const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const Listing = require('../models/Listing');
const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { authorizeRoles } = require('../middleware/authMiddleware');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('Listing model defines required marketplace fields and defaults', () => {
  const sellerId = new mongoose.Types.ObjectId();
  const listing = new Listing({
    title: 'Mountain Bike',
    description: 'Well maintained bicycle',
    price: 25000,
    category: 'Sports',
    condition: 'Used',
    seller: sellerId,
  });

  assert.equal(listing.category, 'sports');
  assert.equal(listing.condition, 'used');
  assert.equal(listing.status, 'active');
  assert.equal(listing.views, 0);
  assert.deepEqual(listing.images, []);
  assert.equal(listing.validateSync(), undefined);
});

test('getListings applies search, filters, and sorting', async () => {
  const originalFind = Listing.find;
  let receivedFilter;
  let receivedSort;

  try {
    Listing.find = (filter) => {
      receivedFilter = filter;
      return {
        populate() {
          return this;
        },
        async sort(sortBy) {
          receivedSort = sortBy;
          return [];
        },
      };
    };

    const req = {
      query: {
        search: 'bike',
        category: 'Sports',
        condition: 'Used',
        status: 'active',
        minPrice: '1000',
        maxPrice: '30000',
        sort: 'price_asc',
      },
    };
    const res = createResponse();

    await getListings(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(receivedFilter.category, 'sports');
    assert.equal(receivedFilter.condition, 'used');
    assert.equal(receivedFilter.status, 'active');
    assert.deepEqual(receivedFilter.price, { $gte: 1000, $lte: 30000 });
    assert.equal(receivedFilter.$or[0].title.test('Mountain Bike'), true);
    assert.deepEqual(receivedSort, { price: 1 });
  } finally {
    Listing.find = originalFind;
  }
});

test('getListingById atomically increments views', async () => {
  const originalFindByIdAndUpdate = Listing.findByIdAndUpdate;
  const listingId = new mongoose.Types.ObjectId();
  const listing = { _id: listingId, views: 8 };
  let receivedUpdate;

  try {
    Listing.findByIdAndUpdate = (id, update, options) => {
      assert.equal(id, listingId.toString());
      assert.deepEqual(options, { new: true, runValidators: true });
      receivedUpdate = update;
      return {
        async populate() {
          return listing;
        },
      };
    };

    const req = { params: { id: listingId.toString() } };
    const res = createResponse();

    await getListingById(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(receivedUpdate, { $inc: { views: 1 } });
    assert.equal(res.body.data, listing);
  } finally {
    Listing.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test('getMyListings returns only listings owned by the authenticated account', async () => {
  const originalFind = Listing.find;
  const userId = new mongoose.Types.ObjectId();
  let receivedFilter;

  try {
    Listing.find = (filter) => {
      receivedFilter = filter;
      return {
        populate() { return this; },
        async sort() { return [{ _id: new mongoose.Types.ObjectId(), seller: userId }]; },
      };
    };
    const res = createResponse();
    await getMyListings({ user: { _id: userId } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(receivedFilter.seller, userId);
    assert.equal(res.body.data.length, 1);
  } finally {
    Listing.find = originalFind;
  }
});

test('createListing assigns the authenticated seller and ignores protected fields', async () => {
  const originalCreate = Listing.create;
  const sellerId = new mongoose.Types.ObjectId();
  const forgedSellerId = new mongoose.Types.ObjectId();
  let receivedData;

  try {
    Listing.create = async (listingData) => {
      receivedData = listingData;
      return {
        ...listingData,
        _id: new mongoose.Types.ObjectId(),
        async populate() {},
      };
    };

    const req = {
      user: { _id: sellerId, role: 'seller' },
      body: {
        title: 'Phone',
        description: 'Almost new',
        price: 40000,
        category: 'electronics',
        condition: 'like-new',
        seller: forgedSellerId,
        views: 999,
      },
    };
    const res = createResponse();

    await createListing(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(receivedData.seller, sellerId);
    assert.equal(receivedData.views, undefined);
  } finally {
    Listing.create = originalCreate;
  }
});

test('updateListing allows the owner and ignores seller and views changes', async () => {
  const originalFindById = Listing.findById;
  const sellerId = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();
  const listing = {
    _id: listingId,
    seller: sellerId,
    title: 'Old title',
    views: 4,
    async save() {},
    async populate() {},
  };

  try {
    Listing.findById = async () => listing;
    const req = {
      params: { id: listingId.toString() },
      user: { _id: sellerId },
      body: {
        title: 'Updated title',
        seller: new mongoose.Types.ObjectId(),
        views: 100,
      },
    };
    const res = createResponse();

    await updateListing(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(listing.title, 'Updated title');
    assert.equal(listing.seller, sellerId);
    assert.equal(listing.views, 4);
  } finally {
    Listing.findById = originalFindById;
  }
});

test('deleteListing rejects a non-owner', async () => {
  const originalFindById = Listing.findById;
  const listingId = new mongoose.Types.ObjectId();
  let deleteCalled = false;

  try {
    Listing.findById = async () => ({
      _id: listingId,
      seller: new mongoose.Types.ObjectId(),
      async deleteOne() {
        deleteCalled = true;
      },
    });

    const req = {
      params: { id: listingId.toString() },
      user: { _id: new mongoose.Types.ObjectId() },
    };
    const res = createResponse();

    await deleteListing(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(deleteCalled, false);
  } finally {
    Listing.findById = originalFindById;
  }
});

test('seller role guard rejects buyers', async () => {
  const req = { user: { role: 'buyer' } };
  const res = createResponse();
  let nextCalled = false;

  await authorizeRoles('seller')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});
