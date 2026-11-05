# Numerical model application integration

The product in this repository is `superclass`. The model source is in
https://github.com/aayush-mehrotra29/perception-1, under `version2/`.
The source repository excludes trained weights and participant data. Run the
application against the separately provisioned, qualified numerical release.

## Runtime

This release uses a local FastAPI job worker and browser UI. Heavy TRIBE
inference runs on the existing Modal GPU endpoints. The frozen waveform and
five-score readouts run in the qualified local Python interpreter. This is a
hybrid deployment; it is not a fully hosted app or an all-cloud model runtime.
Keep the SSD attached and the API/worker running during processing and playback.

Create `.local/brain-integration/config.json` with the following machine-local
settings (the setup is already present on the development machine):

```json
{
  "model_root": "/absolute/path/to/MetaHackathon/version2",
  "python": "/absolute/path/to/qualified/research/.venv/bin/python",
  "modal_python": "/absolute/path/to/MetaHackathon/.venv/bin/python",
  "modal_cap_usd": 30,
  "max_video_seconds": 180
}
```

The model root must contain `CURRENT_NUMERICAL_BRAIN_MODEL.json` and its
referenced weights, feature transforms, encoder snapshot, parity receipt, and
surface geometry. The local setup uses the later user-approved $42.50 Modal
workspace ceiling; the original shared ledger is retained. Limits above that
ceiling are rejected. No paid failures are automatically retried.

The credentials stay in the model workspace's owner-only
`.local/brain-credentials.json`. They are read by the cloud dispatch interpreter,
not sent to the browser. The upload is the only media sent for native inference;
participant recordings and fitted EEG weights remain local.

```sh
uv sync --extra test
uv run python -m scripts.seed_brain_demo
cd frontend && npm install && npm run build && cd ..
./scripts/start.sh
```

Open http://127.0.0.1:8000/dashboard. The qualified Velocity example renders an
actual saved model bundle. Upload one project-authored MP4, MOV, or WebM video,
up to 50 MB and 180 seconds, and confirm cloud processing to start a new job.
Other source formats remain saved drafts in this frontend; the numerical
backend's narrated PDF/image/text adapters are not wired to the upload form yet.

## API and playback

- `POST /api/brain/jobs`: multipart `video`, `title`, and `cloud_rights`.
- `GET /api/brain/jobs/{id}`: persistent status and result manifest URL.
- `GET /api/brain/jobs/{id}/media`: uploaded media with byte-range seeking.
- `GET /api/brain/jobs/{id}/bundle/{name}`: allowlisted numerical bundle files.

The existing SQLite queue processes a single job at a time. Upload artifacts
and detailed inference logs are saved on the research SSD under
`version2/.local/superclass-uploads-v1/`. Identical source hashes and model
identities reuse an existing job, including its failure status. They do not
silently launch another paid retry.

The UI checks binary hashes before use. Playback uses the video element's
actual current time. Native cortical segment times are preserved; the five-second
TRIBE offset is not added again. The exported fsaverage5 vertices and triangle
indices drive the surface directly, with a single fixed color range per lesson.
The illustrative GLB is not used for actual model output.

EEG plots use source channel IDs, volts converted to microvolts, and fixed
per-channel ranges. Missing samples remain gaps. Five scores use the exact
one-second query, with nulls shown as unavailable. Scores require a preceding
44-second context and are not instantaneous measured mental states.

## Evidence

The new interface does not improve the underlying model's accuracy. The frozen
EEG model remains approximately r=0.029 on its reused speech benchmark. Full
fusion attention MAE is 2.77214, compared with 2.75781 for content plus cortex;
there is no demonstrated accuracy benefit from the EEG block. Native TRIBE
predictions remain unchanged. Video playback is synchronized presentation of
precomputed predictions, not causal real-time brain sensing.
