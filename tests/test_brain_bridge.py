import json
from pathlib import Path
from fastapi.testclient import TestClient
from backend import api, brain, store


def configure(tmp_path, monkeypatch):
    monkeypatch.setattr(store, 'DATA_DIR', tmp_path / 'db')
    monkeypatch.setattr(brain, 'data_root', lambda: tmp_path)
    config = {'max_video_seconds':180, 'pointer':{'model_manifest_sha256':'model-one'}}
    monkeypatch.setattr(brain, 'settings', lambda: config)
    monkeypatch.setattr(api, 'duration', lambda path: 60.0)
    return TestClient(api.app), config


def test_upload_cache_and_budget_actions(tmp_path, monkeypatch):
    client, config = configure(tmp_path, monkeypatch)
    files = {'video':('lesson.mp4',b'fixture bytes','video/mp4')}
    assert client.post('/api/brain/jobs',files=files).status_code == 422
    assert client.post('/api/brain/jobs',files=files,data={'cloud_rights':'true'},headers={'origin':'https://other.example'}).status_code == 403
    a = client.post('/api/brain/jobs',files=files,data={'cloud_rights':'true'}).json()['job_id']
    b = client.post('/api/brain/jobs',files=files,data={'cloud_rights':'true'}).json()['job_id']
    assert a == b
    assert store.job(a)['state'] == 'queued'
    assert len(store.list_kind('brain_runs')) == 1
    assert client.get(f'/api/brain/jobs/{a}/bundle/manifest.json').status_code == 404
    config['pointer']['model_manifest_sha256'] = 'model-two'
    c = client.post('/api/brain/jobs',files=files,data={'cloud_rights':'true'}).json()['job_id']
    assert c != a


def test_only_manifest_members_served_and_media_ranges(tmp_path, monkeypatch):
    client, _ = configure(tmp_path, monkeypatch)
    source=tmp_path/'source.mp4'; source.write_bytes(b'0123456789')
    bundle=tmp_path/'bundle';bundle.mkdir()
    (bundle/'manifest.json').write_text(json.dumps({'files':{'scores.json':'hash'}}))
    (bundle/'scores.json').write_text('{"value":null}')
    (bundle/'secret.json').write_text('private')
    store.put('brain_runs',{'id':'test','state':'complete','bundle':str(bundle),'source':str(source)})
    assert client.get('/api/brain/jobs/test/bundle/secret.json').status_code == 404
    assert client.get('/api/brain/jobs/test/bundle/scores.json').json() == {'value':None}
    r=client.get('/api/brain/jobs/test/media',headers={'range':'bytes=2-5'})
    assert r.status_code == 206 and r.content == b'2345'


def test_running_stage_uses_completed_artifacts_and_keeps_failures(tmp_path, monkeypatch):
    client, _ = configure(tmp_path, monkeypatch)
    job_id = store.create_job('brain', 'source')
    store.put('brain_runs', {'id':job_id, 'state':'queued'})
    store.update_job(job_id, state='running', stage='model inference')
    assert 'Verifying' in client.get(f'/api/brain/jobs/{job_id}').json()['stage']
    root = tmp_path / job_id / 'inference'
    (root / 'content').mkdir(parents=True)
    (root / 'content/tribe-cloud-request.json').write_text('{}')
    assert client.get(f'/api/brain/jobs/{job_id}').json()['stage'] == 'Processing cortical responses in the cloud'
    (root / 'content/manifest.json').write_text('{}')
    assert client.get(f'/api/brain/jobs/{job_id}').json()['stage'] == 'Processing speech features in the cloud'
    store.update_job(job_id, state='failed', stage='failed', error='Saved cloud failure')
    response = client.get(f'/api/brain/jobs/{job_id}').json()
    assert response['stage'] == 'failed' and response['error'] == 'Saved cloud failure'
