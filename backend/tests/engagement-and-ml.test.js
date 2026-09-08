const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const RecentlyViewed = require('../models/RecentlyViewed');
const Review = require('../models/Review');
const activityService = require('../services/activityService');
const reputationService = require('../services/reputationService');
const pricePredictionService = require('../services/pricePredictionService');
const { addFavorite } = require('../controllers/activityController');
const { createReview } = require('../controllers/reviewController');
const { predictPrice } = require('../controllers/pricePredictionController');
const { optionalAuth } = require('../middleware/authMiddleware');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('Favorite and RecentlyViewed schemas store persistent account activity', () => {
  const user = new mongoose.Types.ObjectId();
  const listing = new mongoose.Types.ObjectId();
  const favorite = new Favorite({ user, listing });
  const recent = new RecentlyViewed({ user, listing });

  assert.equal(favorite.validateSync(), undefined);
  assert.equal(recent.validateSync(), undefined);
  assert.equal(recent.viewCount, 0);
});

test('Review requires an integer rating from one to five', () => {
  const id = () => new mongoose.Types.ObjectId();
  const valid = new Review({ order: id(), reviewer: id(), seller: id(), listing: id(), rating: 5 });
  const invalid = new Review({ order: id(), reviewer: id(), seller: id(), listing: id(), rating: 4.5 });

  assert.equal(valid.validateSync(), undefined);
  assert.match(invalid.validateSync().errors.rating.message, /whole number/);
});

test('optionalAuth permits anonymous listing views', async () => {
  let continued = false;
  await optionalAuth({ headers: {} }, {}, async () => { continued = true; });
  assert.equal(continued, true);
});

test('addFavorite is idempotent and scopes the record to the authenticated user', async () => {
  const originalExists = Listing.exists;
  const originalFindOneAndUpdate = Favorite.findOneAndUpdate;
  const userId = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();
  let receivedFilter;

  try {
    Listing.exists = async () => ({ _id: listingId });
    Favorite.findOneAndUpdate = (filter) => {
      receivedFilter = filter;
      return { async populate() { return { _id: new mongoose.Types.ObjectId(), ...filter }; } };
    };
    const res = createResponse();
    await addFavorite({ user: { _id: userId }, body: { listingId: listingId.toString() } }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(receivedFilter, { user: userId, listing: listingId.toString() });
  } finally {
    Listing.exists = originalExists;
    Favorite.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('recordListingView increments a persistent view and trims old history', async () => {
  const originalUpdate = RecentlyViewed.findOneAndUpdate;
  const originalFind = RecentlyViewed.find;
  const originalDeleteMany = RecentlyViewed.deleteMany;
  let receivedUpdate;

  try {
    RecentlyViewed.findOneAndUpdate = async (filter, update) => { receivedUpdate = update; return { ...filter }; };
    RecentlyViewed.find = () => ({ sort() { return this; }, skip() { return this; }, async select() { return []; } });
    RecentlyViewed.deleteMany = async () => {};
    await activityService.recordListingView(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId());
    assert.deepEqual(receivedUpdate.$inc, { viewCount: 1 });
  } finally {
    RecentlyViewed.findOneAndUpdate = originalUpdate;
    RecentlyViewed.find = originalFind;
    RecentlyViewed.deleteMany = originalDeleteMany;
  }
});

test('reputation tiers require both a strong score and review history', () => {
  assert.equal(reputationService.determineTier({ score: 90, ratingCount: 2 }), 'developing');
  assert.equal(reputationService.determineTier({ score: 75, ratingCount: 4 }), 'trusted');
  assert.equal(reputationService.determineTier({ score: 90, ratingCount: 12 }), 'top-seller');
});

test('completed buyers can create a review and trigger reputation refresh', async () => {
  const originalOrderFind = Order.findById;
  const originalReviewCreate = Review.create;
  const originalRefresh = reputationService.refreshSellerReputation;
  const buyer = new mongoose.Types.ObjectId();
  const seller = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const listing = new mongoose.Types.ObjectId();

  try {
    Order.findById = async () => ({ _id: orderId, buyer, seller, listing, status: 'completed', paymentVerified: true });
    Review.create = async (values) => ({ ...values, async populate() {} });
    reputationService.refreshSellerReputation = async () => ({ averageRating: 5, ratingCount: 1 });
    const res = createResponse();
    await createReview({ user: { _id: buyer }, body: { orderId: orderId.toString(), rating: 5, comment: 'Reliable seller' } }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.review.rating, 5);
    assert.equal(res.body.data.reputation.ratingCount, 1);
  } finally {
    Order.findById = originalOrderFind;
    Review.create = originalReviewCreate;
    reputationService.refreshSellerReputation = originalRefresh;
  }
});

test('price controller forwards normalized listing features to the ML service', async () => {
  const originalPredict = pricePredictionService.predictPrice;
  let received;
  try {
    pricePredictionService.predictPrice = async (features) => {
      received = features;
      return { predictedPrice: 50000, algorithm: 'RandomForestRegressor' };
    };
    const res = createResponse();
    await predictPrice({ body: { title: ' Gaming laptop ', description: ' A clean laptop for gaming ', category: ' Electronics ', condition: 'LIKE-NEW' } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(received.category, 'electronics');
    assert.equal(received.condition, 'like-new');
    assert.equal(res.body.data.predictedPrice, 50000);
  } finally {
    pricePredictionService.predictPrice = originalPredict;
  }
});
