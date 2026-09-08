const RecentlyViewed = require('../models/RecentlyViewed');

const MAX_RECENTLY_VIEWED = 50;

const recordListingView = async (userId, listingId) => {
  if (!userId) return null;

  const activity = await RecentlyViewed.findOneAndUpdate(
    { user: userId, listing: listingId },
    {
      $set: { lastViewedAt: new Date() },
      $inc: { viewCount: 1 },
      $setOnInsert: { createdAt: new Date() },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const staleActivities = await RecentlyViewed.find({ user: userId })
    .sort({ lastViewedAt: -1 })
    .skip(MAX_RECENTLY_VIEWED)
    .select('_id');

  if (staleActivities.length > 0) {
    await RecentlyViewed.deleteMany({
      _id: { $in: staleActivities.map((item) => item._id) },
    });
  }

  return activity;
};

module.exports = { recordListingView, MAX_RECENTLY_VIEWED };
