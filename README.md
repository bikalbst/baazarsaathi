# BazaarSathi

BazaarSathi is a Node.js, Express, MongoDB, and React peer-to-peer marketplace with JWT authentication, listings, chat, Khalti escrow payments, favorites, recently viewed listings, verified reviews, seller reputation, and a Random Forest price assistant.

## Run locally

Use Node.js 20+, MongoDB, and Python 3.12.

### Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Set real MongoDB, JWT, and Khalti values in `backend/.env`. The API runs at `http://localhost:5000`.

### Price prediction service

```powershell
cd ml-service
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python train.py
.\.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

The initial model is trained on a deterministic synthetic academic-demo dataset. Its API response exposes that fact and model metrics. Replace it with completed-sale records using the instructions in `ml-service/data/README.md` before treating estimates as production guidance.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Sign in to persist favorites and recently viewed items, submit reviews for completed purchases, and request price estimates while posting an item.

## Verification

```powershell
cd backend
npm run check
npm test

cd ..\frontend
npm run build
```
