const dataService = require('../services/dataService');
const bloomService = require('../services/bloomService');

// POST /set
exports.setKey = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ error: 'Key and Value are required' });
        }
        await dataService.setKey(key, value);
        res.status(201).json({ message: 'Key set successfully', key });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /get/:key
exports.getKey = async (req, res) => {
    try {
        const { key } = req.params;

        // Check Bloom Filter first
        const isPossiblyInvalid = bloomService.isPossiblyInvalidated(key);
        let value;
        let source;

        if (!isPossiblyInvalid) {
            // Bloom says FALSE -> Definitely Valid -> Return from Cache
            value = await dataService.getFromCache(key);
            source = 'Cache (Bloom said valid)';
        } else {
            // Bloom says TRUE -> Possibly Invalid -> Fetch from DB
            value = await dataService.getFromDB(key);
            source = 'DB (Bloom said invalid)';
        }

        if (!value) {
            return res.status(404).json({ message: 'Key not found' });
        }

        res.status(200).json({
            key,
            value,
            meta: { source, bloomFilterStatus: isPossiblyInvalid ? 'Possibly Invalid' : 'Valid' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /invalidate
exports.invalidateKey = async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: 'Key required' });

        await dataService.invalidateKey(key);
        res.status(200).json({ message: 'Key invalidated', key });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
