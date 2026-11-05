"""Register the hash-qualified project-authored video; no model calls."""
import json
from pathlib import Path
from backend import brain, store

config = brain.settings()
model = config['model']
fixture = json.loads((model.parent / '.local/brain-fixtures-multimodal-v1/manifest.json').read_text())['cases']['video']
bundle = Path(config['pointer']['examples_directory']) / 'video/bundle'
manifest = json.loads((bundle / 'manifest.json').read_text())
source = Path(fixture['source'])
if brain.file_hash(source) != manifest['original_source']['sha256']:
    raise ValueError('Demo source does not match the numerical output')
store.put('brain_runs', {'id':'qualified-video-v1','state':'complete',
    'source_sha256':manifest['original_source']['sha256'],'source':str(source),
    'title':'Velocity — verified numerical example','duration':manifest['presentation_duration_seconds'],
    'bundle':str(bundle),'model_identity':config['pointer']['model_manifest_sha256']})
print('Registered qualified-video-v1; no paid inference')
