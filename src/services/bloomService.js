const BloomFilter = require('../utils/BloomFilter');

const bloomFilter = new BloomFilter(1000, 3);

const addToInvalidatedSet = (key) => {
    bloomFilter.add(key);
    console.log(`[BloomFilter] Key '${key}' added to invalidated set.`);
};

const isPossiblyInvalidated = (key) => {
    const result = bloomFilter.contains(key);
    console.log(`[BloomFilter] Check '${key}': ${result ? 'Possibly Invalidated' : 'Definitely Valid'}`);
    return result;
};

const getMemoryUsage = () => {
    return bloomFilter.getMemoryUsage();
}

module.exports = {
    addToInvalidatedSet,
    isPossiblyInvalidated,
    getMemoryUsage
};
