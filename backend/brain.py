"""Bridge the app to the versioned numerical research release."""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path

from . import store

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / ".local/brain-integration/config.json"


def settings() -> dict:
    config = json.loads(CONFIG.read_text())
    model = Path(config["model_root"])
    pointer = json.loads((model / "CURRENT_NUMERICAL_BRAIN_MODEL.json").read_text())
    if not pointer["release_complete"]:
        raise RuntimeError("The numerical model release is unavailable")
    return {**config, "pointer": pointer, "model": model}


def data_root() -> Path:
    root = settings()["model"] / ".local/superclass-uploads-v1"
    root.mkdir(parents=True, exist_ok=True)
    return root


def file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def create_job(source: Path, filename: str, title: str, duration: float) -> str:
    config = settings()
    if duration > config["max_video_seconds"]:
        raise ValueError(f"Use a video of at most {config['max_video_seconds']} seconds")
    digest = file_hash(source)
    request = {
        "source_id": "superclass-" + digest[:24], "sha256": digest,
        "source_url": None, "source_origin": "project_generated",
        "cloud_use_basis": "Uploader confirms this project lesson is theirs to process using cloud model inference.",
        "media_kind": "video", "size_bytes": source.stat().st_size,
    }
    # Exact source identity may reuse a qualified result. A different video
    # never borrows these predictions or gets a synthetic fallback.
    identity = config['pointer']['model_manifest_sha256']
    existing = next((row for row in store.list_kind("brain_runs")
                     if row["source_sha256"] == digest and row.get('model_identity') == identity), None)
    if existing:
        source.unlink(missing_ok=True)
        return existing["id"]
    job_id = store.create_job("brain", digest, {"request": request, "title": title, "duration": duration,
                                                       "source": str(source)})
    store.put("brain_runs", {"id": job_id, "state": "queued", "source_sha256": digest,
                              "source": str(source), "title": title, "duration": duration,
                              "model_identity": identity})
    return job_id


def bundle(job_id: str) -> Path:
    row = store.get("brain_runs", job_id)
    if not row or row["state"] != "complete":
        raise FileNotFoundError("Numerical bundle is not ready")
    path = Path(row["bundle"])
    if not path.is_dir() or not (path / "manifest.json").is_file():
        raise FileNotFoundError("Numerical bundle is missing")
    return path


def process(job: dict) -> None:
    job_id = job["id"]
    config = settings()
    model = config["model"]
    source = Path(job["config"]["source"])
    request = job["config"]["request"]
    root = data_root() / job_id
    root.mkdir(parents=True, exist_ok=True)
    request_path = root / "request.json"
    request_path.write_text(json.dumps(request, indent=2) + "\n")
    output = root / "inference"
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "OMP_NUM_THREADS": "1",
           "OPENBLAS_NUM_THREADS": "1", "VECLIB_MAXIMUM_THREADS": "1",
           "SUPERCLASS_MODEL_ROOT": str(model),
           "SUPERCLASS_MODAL_PYTHON": config["modal_python"],
           "SUPERCLASS_MODAL_CAP_USD": str(config["modal_cap_usd"])}
    command = [config["python"], "-B", str(ROOT / "scripts/run_numerical_brain.py"),
               "--source", str(source), "--request-json", str(request_path),
               "--output", str(output), "--composite-model", config["pointer"]["model_directory"],
               "--request-id", "superclass-" + job_id]
    store.update_job(job_id, state="running", stage="model inference", progress=5)
    with (root / "inference.log").open("w") as log:
        result = subprocess.run(command, cwd=model, env=env, stdout=log,
                                stderr=subprocess.STDOUT, timeout=7200, check=False)
    if result.returncode:
        raise RuntimeError("Model inference stopped; inspect the saved run log and paid dispatch before retrying")
    manifest = json.loads((output / "bundle/manifest.json").read_text())
    if not manifest.get("complete") or manifest["original_source"]["sha256"] != request["sha256"]:
        raise RuntimeError("Model result does not match the uploaded lesson")
    record = store.get("brain_runs", job_id)
    store.put("brain_runs", {**record, "state": "complete", "bundle": str(output / "bundle")})
    store.update_job(job_id, state="complete", stage="complete", progress=100)
