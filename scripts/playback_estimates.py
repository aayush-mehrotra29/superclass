"""Experimental short-context playback adapter; frozen weights and native arrays unchanged.

This is a new, unvalidated inference policy, not a new fitted model or benchmark.
The opening frame previews the first second of precomputed content. Later queries
use at most 12 preceding seconds. Missing neural blocks stay masked.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import numpy as np

VERSION = 'responsive-playback-v1'
CONTEXT = 12


def bounds(second, duration):
    stop = min(max(float(second), 1.), duration)
    return max(0., stop - CONTEXT), stop


def pool(blocks, second, duration):
    start, stop = bounds(second, duration)
    a, b = int(round(start * 2)), int(round(stop * 2))
    result = {}
    for name, x in blocks.items():
        values = x[a:b]
        result[name] = (np.mean(values, axis=0, dtype=np.float64)[None].astype(np.float32)
                        if b <= len(x) and b > a and np.isfinite(values).all()
                        else np.full((1, x.shape[1]), np.nan, np.float32))
    return result


def changes(values):
    """Magnitude only; no psychological interpretation and no bridging missing rows."""
    values = np.asarray(values, float)
    result = np.full(len(values), np.nan)
    for i in range(1, len(values)):
        if np.isfinite(values[i-1:i+1]).all():
            result[i] = np.sqrt(np.mean((values[i] - values[i-1]) ** 2))
    finite = result[np.isfinite(result)]
    positive = finite[finite > 1e-12]
    scale = float(np.quantile(positive, .95)) if len(positive) else 0.
    normalized = np.clip(result / scale * 10, 0, 10) if scale > 1e-12 else np.where(np.isfinite(result), 0., np.nan)
    return result, normalized, scale


def signal_timeline(eeg, cortex):
    _, a, sa = changes(eeg)
    _, b, sb = changes(cortex)
    rows = []
    for i in range(len(a)):
        available = [float(x) for x in (a[i], b[i]) if np.isfinite(x)]
        rows.append({'second': i, 'value': float(np.mean(available)) if available else None,
                     'eeg': float(a[i]) if np.isfinite(a[i]) else None,
                     'cortex': float(b[i]) if np.isfinite(b[i]) else None})
    candidates = [i for i in range(2, len(rows)-1)
                  if rows[i]['value'] is not None and rows[i-1]['value'] is not None and rows[i+1]['value'] is not None
                  and rows[i]['value'] >= 8 and rows[i]['value'] > rows[i-1]['value']
                  and rows[i]['value'] >= rows[i+1]['value']]
    selected = []
    for i in sorted(candidates, key=lambda i: rows[i]['value'], reverse=True):
        if all(abs(i-j) >= 6 for j in selected): selected.append(i)
        if len(selected) == 8: break
    flags = []
    for i in sorted(selected):
        row=rows[i]; active=[name for name in ('eeg','cortex') if row[name] is not None and row[name] >= 8]
        flags.append({'second':i,'value':row['value'],'label':'EEG + cortex shift' if len(active)==2 else 'EEG shift' if active==['eeg'] else 'Cortical response shift',
                      'basis':'Large relative change in predicted signals; not a validated learning event.'})
    return rows, flags, {'eeg_p95_change':sa,'cortex_p95_change':sb,'normalization':'95th percentile of nonzero within-lesson one-second changes; fixed across playback'}


def generate(bundle, model, output, duration):
    from brain.worker_contract import file_sha256
    from brain.fusion_data import prepare_native, load_grid, native_intervals
    from numerical_brain_v1.fusion_inference import preflight
    from numerical_brain_v1.fusion_features import load_transforms, transform, eeg_windows, cortical_windows, neural_blocks
    from lesson_harness_v1 import QUALITIES, LEVELS
    from lesson_harness_v1.model import load_network, predict
    from brain.edugage_targets import guard
    import torch
    torch.set_num_threads(1)
    bundle,model,output=map(Path,(bundle,model,output)); guard(output)
    original_hash=file_sha256(bundle/'manifest.json')
    manifest=json.loads((bundle/'manifest.json').read_text())
    pipeline=json.loads((bundle.parent/'manifest.json').read_text())
    native=Path(pipeline['native_cortex_directory']); eeg_dir=bundle.parent/'eeg'
    original_source=manifest['original_source']['sha256']
    source=json.loads((eeg_dir/'manifest.json').read_text())['source_sha256']
    meta=preflight(model)
    # Reuse the exact branch-identity validation and fitted compression transforms.
    _,pins=neural_blocks(eeg_dir,native,source,np.array([44.]))
    trained=json.loads((model/'neural-provenance.json').read_text())
    assert pins['channel_order']==trained['channel_order']
    for key in ('eeg_forecast_lock_sha256','cortical_checkpoint_sha256'):
        assert {r[key] for r in trained['source_pins'].values()}=={pins[key]}
    grid=output.parent/'responsive-playback-grid-v1'
    if not grid.exists(): prepare_native(native,duration,grid)
    gm,blocks=load_grid(grid)
    assert gm['native_manifest_sha256']==file_sha256(native/'manifest.json') and gm['duration_seconds']==duration
    states=load_transforms(model/'transforms')
    nets=[load_network(model/Path(m['manifest']).parent) for m in meta['ensemble']]
    with np.load(eeg_dir/'eeg.npz',allow_pickle=False) as z:
        times,volts,supported=z['query_seconds'].copy(),z['predicted_eeg_volts'].copy(),z['supported'].copy()
    cortical=native_intervals(native,'tribe')
    points=[]; neural_short=[]; cortical_short=[]; features=[]; seen_content=False
    for second in range(int(np.floor(duration))+1):
        start,stop=bounds(second,duration); context=stop-start
        means=pool(blocks,second,duration)
        means['progress']=np.array([[second/duration]],np.float32)
        means['predicted_eeg']=eeg_windows(times,volts,supported,[stop],context=context)
        means['predicted_cortex']=cortical_windows(*cortical,[stop],context=context)
        active=[n for n,v in means.items() if n in states and np.isfinite(v).all()]
        has_content=bool(set(active)&{'text','audio','video'})
        mode='short_context' if has_content else 'opening_prior' if not seen_content else 'unavailable'
        seen_content |= has_content
        if mode=='opening_prior':
            # A network bias/prior, not a neural or individual-student observation.
            means={n:np.full_like(v,np.nan) for n,v in means.items()};active=[]
        features.append(transform(means,states)[0])
        points.append({'second':second,'context_start':start,'context_stop':stop,'mode':mode,
                       'active_inputs':active,'opening_preview':second==0,'qualities':{}})
        neural_short.append(eeg_windows(times,volts,supported,[second],context=1.)[0])
        cortical_short.append(cortical_windows(*cortical,[second],context=1.)[0])
    probabilities=np.stack([predict(n,np.asarray(features,np.float32)) for n in nets]).astype(float)
    for i,p in enumerate(points):
        for h,name in enumerate(QUALITIES):
            usable=p['mode']!='unavailable' and meta['heads'][name]['status']=='fitted'
            distribution=probabilities[:,i,h].mean(0);distribution/=distribution.sum()
            p['qualities'][name]={'value':float(distribution@LEVELS) if usable else None,
                'ensemble_sd':float(np.std(probabilities[:,i,h]@LEVELS)) if usable else None,
                'evidence_status':'unvalidated_short_context' if p['mode']=='short_context' else p['mode'],
                'supervision_origins':meta['heads'][name]['supervision_origins']}
    signal,flags,scales=signal_timeline(neural_short,cortical_short)
    result={'schema':VERSION,'source_sha256':original_source,'bundle_manifest_sha256':original_hash,
        'model_manifest_sha256':file_sha256(model/'manifest.json'),'adapter_sha256':file_sha256(Path(__file__)),
        'context_seconds':CONTEXT,'trained_context_seconds':44,'points':points,'signal_change':signal,'flags':flags,'signal_scales':scales,
        'opening_policy':'At t=0 preview the first second of precomputed content; unavailable opening content uses the explicitly labeled network prior.',
        'validation_status':'Unvalidated inference-policy transfer; no new benchmark claim. Auxiliary SAM and descriptors are masked.',
        'score_postprocessing':'Expected ordinal score from unchanged three-seed network; no amplification, jitter, or minimum variation.',
        'native_neural_arrays_changed':False,'observed_participant_data_used':False}
    assert file_sha256(bundle/'manifest.json')==original_hash
    guard(output);output.parent.mkdir(parents=True,exist_ok=True)
    temp=output.with_suffix('.tmp');temp.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n');temp.replace(output)
    return {'points':len(points),'flags':len(flags),'opening_mode':points[0]['mode'],'output':str(output)}


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--bundle',type=Path,required=True);p.add_argument('--model',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--duration',type=float,required=True)
    args=p.parse_args();sys.path.insert(0,os.environ['SUPERCLASS_MODEL_ROOT'])
    print(json.dumps(generate(args.bundle,args.model,args.output,args.duration)))
