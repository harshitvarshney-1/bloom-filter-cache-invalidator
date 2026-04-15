// Metrics Module
// Tracks system performance and cache hit/miss ratio for observability.

const metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    bloomFilterPositives: 0, // When bloom says it might be invalid
    bloomFilterNegatives: 0, // When bloom says it is definitely valid
};

const recordHit = () => metrics.cacheHits++;
const recordMiss = () => metrics.cacheMisses++;
const recordBloomPositive = () => metrics.bloomFilterPositives++;
const recordBloomNegative = () => metrics.bloomFilterNegatives++;

const getMetrics = () => ({ ...metrics });

module.exports = {
    recordHit, recordMiss, recordBloomPositive, recordBloomNegative, getMetrics
};
