const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cacheController');

router.post('/set', cacheController.setKey);
router.get('/get/:key', cacheController.getKey);
router.post('/invalidate', cacheController.invalidateKey);

module.exports = router;
