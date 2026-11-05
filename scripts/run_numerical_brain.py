"""Run the pinned numerical CLI with the user-approved shared Modal ceiling."""
import os
import sys
import json
import subprocess
from pathlib import Path

root = os.environ["SUPERCLASS_MODEL_ROOT"]
sys.path.insert(0, root)

from brain.credits import CreditLedger

cap = float(os.environ["SUPERCLASS_MODAL_CAP_USD"])
if not 30 <= cap <= 42.5:
    raise ValueError("Cloud ceiling exceeds the approved workspace limit")
CreditLedger.LIMITS = {**CreditLedger.LIMITS, "modal": int(round(cap * 1_000_000))}

# Keep the trained Torch runtime intact; only cloud dispatch uses the existing
# Modal environment. The stage file carries content provenance, never weights.
import brain.modal_client

def submit(kind, media, request, output, request_id, **kwargs):
    output = Path(output)
    stage = output.parent / (output.name + '-cloud-request.json')
    stage.parent.mkdir(parents=True, exist_ok=True)
    payload = {'kind': kind, 'media': str(media), 'request': request.model_dump(),
               'output': str(output), 'request_id': request_id,
               'kwargs': {k: str(v) if isinstance(v, Path) else v for k, v in kwargs.items()}}
    stage.write_text(json.dumps(payload, indent=2) + '\n')
    subprocess.run([os.environ['SUPERCLASS_MODAL_PYTHON'], '-B',
                    str(Path(__file__).with_name('run_modal_stage.py')), str(stage)], check=True)
    return json.loads((output / 'manifest.json').read_text())

brain.modal_client.submit = submit

from numerical_brain_v1.cli import main

if __name__ == "__main__":
    main()
