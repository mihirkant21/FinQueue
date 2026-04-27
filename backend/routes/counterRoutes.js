const express = require('express');
const router = express.Router();
const { getCounters, createCounter, assignAgent, deleteCounter } = require('../controllers/counterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getCounters);
router.post('/', protect, authorize('Admin'), createCounter);
router.put('/:id/assign', protect, authorize('Admin'), assignAgent);
router.delete('/:id', protect, authorize('Admin'), deleteCounter);

module.exports = router;
