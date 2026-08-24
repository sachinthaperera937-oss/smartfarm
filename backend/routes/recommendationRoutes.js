const express = require('express');
const router = express.Router();
const { generateRecommendation, getRecommendations } = require('../controllers/recommendationController');
const auth = require('../middleware/authMiddleware');

router.post('/:farmId', auth, generateRecommendation);
router.get('/:farmId', auth, getRecommendations);

module.exports = router;