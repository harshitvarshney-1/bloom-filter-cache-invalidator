// Validation Layer
// Ensures inputs are correct before they reach the controller.

const validateCacheKey = (req, res, next) => {
    const { key } = req.params;
    if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Valid cache key is required in URL.' });
    }
    next();
};

const validateCacheBody = (req, res, next) => {
    const { key, value } = req.body;
    if (!key || !value) {
        return res.status(400).json({ error: 'Both key and value are required in body.' });
    }
    next();
};

module.exports = { validateCacheKey, validateCacheBody };
