import argparse
import json
import random
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT = Path(__file__).resolve().parent
ARTIFACT_DIR = ROOT / 'artifacts'
MODEL_PATH = ARTIFACT_DIR / 'price_model.joblib'
METADATA_PATH = ARTIFACT_DIR / 'metadata.json'
DATA_PATH = ROOT / 'data' / 'listings.csv'
REQUIRED_COLUMNS = {'title', 'description', 'category', 'condition', 'price'}

CATEGORY_CATALOG = {
    'electronics': [
        ('smartphone', 32000), ('laptop', 76000), ('headphones', 6500),
        ('camera', 48000), ('smart watch', 18000), ('gaming console', 42000),
    ],
    'home-garden': [
        ('sofa', 36000), ('dining table', 28000), ('office chair', 13000),
        ('bookshelf', 9500), ('coffee table', 8000), ('garden tool set', 6000),
    ],
    'vehicles': [
        ('mountain bicycle', 28000), ('scooter', 185000), ('motorbike', 310000),
        ('car', 1650000), ('electric bicycle', 95000), ('vehicle helmet', 6500),
    ],
    'fashion': [
        ('winter jacket', 6500), ('running shoes', 8000), ('traditional kurta', 4500),
        ('leather bag', 11000), ('wrist watch', 14000), ('sunglasses', 5000),
    ],
    'sports': [
        ('cricket bat', 8500), ('football', 3500), ('treadmill', 72000),
        ('trekking backpack', 12000), ('badminton set', 5500), ('camping tent', 18000),
    ],
    'other': [
        ('study books set', 4500), ('acoustic guitar', 16000), ('office printer', 24000),
        ('handmade decor', 7000), ('travel suitcase', 9000), ('baby stroller', 18000),
    ],
}

CONDITION_MULTIPLIERS = {'new': 1.0, 'like-new': 0.82, 'used': 0.58}
QUALITY_TERMS = [
    ('premium', 1.16), ('original', 1.1), ('basic', 0.86),
    ('professional', 1.22), ('compact', 0.94), ('latest model', 1.28),
]


def generate_synthetic_rows(count=720, seed=42):
    """Generate reproducible demo data until real completed-order data is exported."""
    rng = random.Random(seed)
    rows = []
    conditions = list(CONDITION_MULTIPLIERS)

    for index in range(count):
        category = rng.choice(list(CATEGORY_CATALOG))
        item, base_price = rng.choice(CATEGORY_CATALOG[category])
        condition = rng.choices(conditions, weights=[0.25, 0.35, 0.4], k=1)[0]
        quality, quality_multiplier = rng.choice(QUALITY_TERMS)
        age_months = 0 if condition == 'new' else rng.randint(1, 48)
        age_multiplier = max(0.65, 1 - age_months * 0.006)
        noise = rng.uniform(0.88, 1.12)
        price = max(250, round(base_price * CONDITION_MULTIPLIERS[condition] * quality_multiplier * age_multiplier * noise, -1))
        rows.append({
            'title': f'{quality.title()} {item.title()}',
            'description': f'{condition.replace("-", " ")} {item}, {age_months} months old, clean and ready to use in Nepal. Item number {index + 1}.',
            'category': category,
            'condition': condition,
            'price': price,
        })

    return pd.DataFrame(rows)


def load_training_data(data_path=DATA_PATH):
    if data_path.exists():
        data = pd.read_csv(data_path)
        missing = REQUIRED_COLUMNS.difference(data.columns)
        if missing:
            raise ValueError(f'Training CSV is missing columns: {", ".join(sorted(missing))}')
        data = data.dropna(subset=list(REQUIRED_COLUMNS))
        if len(data) < 100:
            raise ValueError('Training CSV must contain at least 100 complete listings')
        return data, f'csv:{data_path.name}'

    return generate_synthetic_rows(), 'synthetic-demo-v1'


def build_pipeline():
    features = ColumnTransformer([
        ('title_text', TfidfVectorizer(ngram_range=(1, 2), max_features=700), 'title'),
        ('description_text', TfidfVectorizer(ngram_range=(1, 2), max_features=900), 'description'),
        ('categories', OneHotEncoder(handle_unknown='ignore'), ['category', 'condition']),
    ])
    regressor = RandomForestRegressor(
        n_estimators=240,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1,
    )
    return Pipeline([('features', features), ('regressor', regressor)])


def train_and_save(data_path=DATA_PATH):
    data, source = load_training_data(data_path)
    features = data[['title', 'description', 'category', 'condition']].copy()
    target = data['price'].astype(float)
    train_x, test_x, train_y, test_y = train_test_split(
        features, target, test_size=0.2, random_state=42,
    )
    model = build_pipeline()
    model.fit(train_x, train_y)
    predictions = model.predict(test_x)
    metrics = {
        'mae': round(float(mean_absolute_error(test_y, predictions)), 2),
        'rmse': round(float(mean_squared_error(test_y, predictions) ** 0.5), 2),
        'r2': round(float(r2_score(test_y, predictions)), 4),
    }
    metadata = {
        'modelVersion': 'random-forest-v1',
        'algorithm': 'RandomForestRegressor',
        'trainingSource': source,
        'trainingRows': len(data),
        'trainedAt': datetime.now(timezone.utc).isoformat(),
        'metrics': metrics,
        'scikitLearnVersion': sklearn.__version__,
    }
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    return model, metadata


def load_or_train():
    if MODEL_PATH.exists() and METADATA_PATH.exists():
        # Only load this local artifact, which is created by this training script.
        return joblib.load(MODEL_PATH), json.loads(METADATA_PATH.read_text(encoding='utf-8'))
    return train_and_save()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train the BazaarSathi price model')
    parser.add_argument('--data', type=Path, default=DATA_PATH, help='Optional real listing CSV')
    arguments = parser.parse_args()
    _, trained_metadata = train_and_save(arguments.data)
    print(json.dumps(trained_metadata, indent=2))
