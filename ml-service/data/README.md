# Training data

The service uses a deterministic synthetic Nepal marketplace dataset for the academic demo when `listings.csv` is absent. This keeps the application runnable without claiming production accuracy.

For a real model, export at least 100 completed BazaarSathi sales to `listings.csv` with these columns:

`title,description,category,condition,price`

Then retrain with `python train.py --data data/listings.csv`. Do not train on active asking prices when completed sale prices are available.
