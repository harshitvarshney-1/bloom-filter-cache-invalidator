const DataModel = require('../models/DataModel');
const bloomService = require('./bloomService');

const cache = new Map();

exports.setKey = async (key, value) => {
   
    await DataModel.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });

    cache.set(key, value);
    console.log(`[SET] Saved '${key}' to DB and Cache.`);
};

exports.getFromCache = async (key) => {
    console.log(`[CACHE] Fetching '${key}'...`);
    return cache.get(key);
};


exports.getFromDB = async (key) => {
    console.log(`[DB] Fetching '${key}' from MongoDB...`);
    const data = await DataModel.findOne({ key });
    if (data) {
        cache.set(key, data.value);
        return data.value;
    }
    return null;
};

// Invalidate
exports.invalidateKey = async (key) => {
    bloomService.addToInvalidatedSet(key);
    // Note: We do NOT delete from cache here to demonstrate the Bloom Filter logic 
    // on the next GET request. But in reality, you might. 
    // For this specific student demo, let's keep it in cache to prove Bloom forced a DB hit.
    console.log(`[INVALIDATE] Marked '${key}' as invalid in Bloom Filter.`);
};
