const express = require('express');
const router = express.Router();
const {
  generateToken,
  getMyTokens,
  getAllTokens,
  getAllTokensHistory,
  callNextToken,
  completeToken,
  cancelToken,
  getQueueStats,
} = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, generateToken);
router.get('/my-tokens', protect, getMyTokens);
router.get('/stats', protect, authorize('Admin'), getQueueStats);
router.get('/all', protect, authorize('Admin'), getAllTokensHistory);
router.get('/', protect, authorize('Agent', 'Admin'), getAllTokens);
router.put('/call-next', protect, authorize('Agent'), callNextToken);
router.put('/:id/complete', protect, authorize('Agent', 'Admin'), completeToken);
router.delete('/:id', protect, cancelToken);

module.exports = router;
