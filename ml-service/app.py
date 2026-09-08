from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from train import load_or_train

model = None
metadata = None


class PriceRequest(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=10, max_length=5000)
    category: str = Field(min_length=2, max_length=100)
    condition: str

    @field_validator('title', 'description', 'category')
    @classmethod
    def strip_text(cls, value):
        return value.strip()

    @field_validator('condition')
    @classmethod
    def valid_condition(cls, value):
        normalized = value.strip().lower()
        if normalized not in {'new', 'like-new', 'used'}:
            raise ValueError('condition must be new, like-new, or used')
        return normalized


@asynccontextmanager
async def lifespan(_app):
    global model, metadata
    model, metadata = load_or_train()
    yield


app = FastAPI(title='BazaarSathi Price Predictor', version='1.0.0', lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_error(_request, error):
    return JSONResponse(
        status_code=422,
        content={
            'success': False,
            'data': None,
            'message': error.errors()[0].get('msg', 'Invalid prediction request'),
        },
    )


@app.get('/health')
async def health():
    return {'success': True, 'data': {'ready': model is not None}, 'message': 'Price prediction service is running'}


@app.get('/model-info')
async def model_info():
    return {'success': True, 'data': metadata, 'message': 'Model metadata retrieved'}


@app.post('/predict')
async def predict_price(request: PriceRequest):
    frame = pd.DataFrame([request.model_dump()])
    predicted = max(0, float(model.predict(frame)[0]))
    predicted = round(predicted / 10) * 10
    uncertainty = max(metadata['metrics']['mae'], predicted * 0.12)
    result = {
        'predictedPrice': predicted,
        'suggestedRange': {
            'minimum': max(0, round((predicted - uncertainty) / 10) * 10),
            'maximum': round((predicted + uncertainty) / 10) * 10,
        },
        'currency': 'NPR',
        'modelVersion': metadata['modelVersion'],
        'algorithm': metadata['algorithm'],
        'trainingSource': metadata['trainingSource'],
        'metrics': metadata['metrics'],
        'disclaimer': 'This is a data-driven estimate, not a guaranteed sale price.',
    }
    return {'success': True, 'data': result, 'message': 'Price estimate generated'}
