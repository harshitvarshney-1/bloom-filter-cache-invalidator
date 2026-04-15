// Repository Layer (Data Access Layer)
// Abstracts the database and cache integrations from the service layer.

const DataModel = require('../models/DataModel');
const cache = new Map();

const getFromCache = (key) => cache.get(key);
const setInCache = (key, value) => cache.set(key, value);
const deleteFromCache = (key) => cache.delete(key);

const getFromDB = async (key) => await DataModel.findOne({ key });
const saveToDB = async (key, value) => {
    return await DataModel.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
    );
};

module.exports = { getFromCache, setInCache, deleteFromCache, getFromDB, saveToDB };
