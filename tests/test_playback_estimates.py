import pytest
np = pytest.importorskip("numpy")
from scripts.playback_estimates import bounds,pool,changes,signal_timeline


def test_opening_preview_and_causal_subsequent_windows():
    assert bounds(0,60)==(0,1)
    assert bounds(2,60)==(0,2)
    assert bounds(20,60)==(8,20)
    x=np.arange(120,dtype=np.float32)[:,None]
    assert pool({'video':x},2,60)['video'][0,0]==1.5
    x[4:]=99999
    assert pool({'video':x},2,60)['video'][0,0]==1.5


def test_missing_coverage_is_masked_not_filled():
    x=np.ones((120,2),np.float32);x[2]=np.nan
    assert np.isnan(pool({'video':x},2,60)['video']).all()
    assert np.isfinite(pool({'video':x},20,60)['video']).all()
    raw,_,_=changes([[1,2],[np.nan,np.nan],[30,40],[30,40]])
    assert np.isnan(raw[:3]).all() and raw[3]==0


def test_constant_signals_do_not_manufacture_flags():
    rows,flags,_=signal_timeline(np.ones((40,3)),np.ones((40,4)))
    assert not flags and all(row['value']==0 for row in rows[1:])
    x=np.ones((40,3));x[10:]+=50
    _,flags,_=signal_timeline(x,x)
    assert len(flags)==1 and flags[0]['second']==10
