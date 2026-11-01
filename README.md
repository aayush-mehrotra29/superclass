# Classroom Lab

Research-backed lesson-testing prototype for a single educator on a Mac. Upload an English-language video of at most 10 minutes, supply a timed transcript and multiple-choice assessment, inspect source-linked content checks, run constrained scripted learners, and create a versioned revision package. **The current build does not produce validated attention or quiz predictions.**

## Run locally

Requirements: Python 3.11, Node 20+, FFmpeg/FFprobe, and `uv`.

```sh
uv sync --extra test
cd frontend && npm install && cd ..
./scripts/dev.sh
```

Open <http://127.0.0.1:5173>. The script starts a separate persisted-job worker, FastAPI, and Vite. The private SQLite database and uploaded media are stored in `.local/` and ignored by Git. To populate a clearly synthetic example, run `uv run python -m scripts.seed_demo` in a second terminal.

For a built local app, run `cd frontend && npm run build`, then `./scripts/start.sh` and open <http://127.0.0.1:8000>.

## Current capability and evidence

- Five views: Projects, Lesson, Simulation, Findings, Evidence.
- Lesson and assessment edits create new versions; originals remain available. Source and content hashes distinguish video identity from editable lesson content.
- A timed transcript uses `MM:SS - MM:SS | passage` per line. Untimed passages work but cannot seek to video time. With no transcript, analysis pauses for an educator-supplied transcript. Provider transcription is not configured.
- Twelve authored profiles × three seeds by default, up to 100 trajectories. Allowed actions are `read_section`, `review_section`, `ask_question`, and `attempt_item`. The scripted student renderer receives question text and options but no answer key. Runs use no tokens and incur no model cost.
- Findings are transparent **agent-generated content hypotheses**. The report shows attention MAE and quiz Brier/log loss as unavailable until a real behavioral benchmark passes its gate. Revision comparisons show structure and run counts, never invented improvement scores.
- Jobs persist in SQLite, expose SSE progress, support cancellation, and resume a simulation from its saved trajectory count after worker restart. HTML export escapes lesson and finding text.

## Research boundary

The neuroscience project remains a separate repository. [Contribution boundary](docs/contributions.md) and [frozen behavioral protocol](docs/behavioral_protocol_v1.json) describe reused work and the new experiment. The [audit](docs/behavioral_audit.md) is pending because the external research volume is unmounted. Internal free space was below the pre-existing 12 GiB reserve at the first check; `/api/health` reports live readiness. A previous EEG **voltage** baseline is not an attention or comprehension model.

The planned TRIBE branch must preserve its own word-level timing preparation; turn timestamps are insufficient. The [TRIBE v2 model card](https://huggingface.co/facebook/tribev2) identifies it as an fMRI-predictive multimodal model, not a measured attention detector. The proposed Muse Spark endpoint and structured-output shape follow [Meta's video API](https://dev.meta.ai/docs/video-understanding) and [structured output documentation](https://dev.meta.ai/docs/structured-output); no API key is required for this local prototype.

## Verification

```sh
uv run pytest
cd frontend && npm run build
```

Do not publish `.local/`, participant data, private recordings, restricted media, secrets, or model checkpoints.
