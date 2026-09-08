# BazaarSathi price prediction service

This FastAPI service trains a scikit-learn `RandomForestRegressor` on listing text, category, and condition. The initial model is explicitly demo-only and uses reproducible synthetic training records; replace it with completed-sale exports before production use.

From `ml-service`:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python train.py
.\.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

The model artifact is generated locally in `artifacts/` and is intentionally excluded from Git. Keep scikit-learn versions pinned and never load model artifacts from untrusted sources.
