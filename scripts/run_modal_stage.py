"""Content-only cloud dispatch in the existing Modal interpreter."""
import json
import os
from pathlib import Path
import sys

root = Path(os.environ['SUPERCLASS_MODEL_ROOT'])
sys.path.insert(0, str(root))
from brain.credits import CreditLedger
from brain.credentials import load_credentials
from brain.modal_client import submit
from brain.worker_contract import PublicMediaRequest

cap = float(os.environ['SUPERCLASS_MODAL_CAP_USD'])
if not 30 <= cap <= 42.5:
    raise ValueError('Cloud ceiling exceeds approved limit')
CreditLedger.LIMITS = {**CreditLedger.LIMITS, 'modal': int(round(cap * 1_000_000))}
load_credentials(root.parent / '.local/brain-credentials.json')
payload = json.loads(Path(sys.argv[1]).read_text())
kwargs = payload['kwargs']
if 'state' in kwargs:
    kwargs['state'] = Path(kwargs['state'])
submit(payload['kind'], Path(payload['media']), PublicMediaRequest.model_validate(payload['request']),
       Path(payload['output']), payload['request_id'], **kwargs)
