const ServiceCounter = require('../models/ServiceCounter');

// @desc Get all service counters
// @route GET /api/counters
// @access Private
const getCounters = async (req, res) => {
  try {
    const counters = await ServiceCounter.find().populate('assignedAgent', 'name email');
    res.status(200).json(counters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new counter
// @route POST /api/counters
// @access Private/Admin
const createCounter = async (req, res) => {
  try {
    const { counterName, serviceType } = req.body;
    const counterExists = await ServiceCounter.findOne({ counterName });

    if (counterExists) {
      return res.status(400).json({ message: 'Counter name already exists' });
    }

    const counter = await ServiceCounter.create({ 
      counterName, 
      serviceType: serviceType || 'All' 
    });
    res.status(201).json(counter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Assign agent to a counter
// @route PUT /api/counters/:id/assign
// @access Private/Admin
const assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const counter = await ServiceCounter.findById(req.params.id);

    if (!counter) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    counter.assignedAgent = agentId;
    await counter.save();

    res.status(200).json(counter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCounters,
  createCounter,
  assignAgent
};
