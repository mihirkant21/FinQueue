const QueueToken = require('../models/QueueToken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Helper to get socket io instance
const getIo = () => {
  return require('../server').io;
};

// Service duration mapping (in minutes)
const getServiceDuration = (type) => {
  const durations = {
    'Account Services': 10,
    'Loan Services': 20,
    'Foreign Exchange': 15,
    'General Inquiry': 5,
    'Card Services': 12,
    'Fixed Deposits': 15,
  };
  return durations[type] || 10;
};

// @desc Generate a new queue token
// @route POST /api/queue
// @access Private (Customer)
const generateToken = async (req, res) => {
  try {
    const { customerName, phoneNumber, serviceType } = req.body;

    if (!customerName || !phoneNumber || !serviceType) {
      return res.status(400).json({ message: 'Please provide your name, phone number, and service type.' });
    }

    const waitingTokens = await QueueToken.find({ status: 'Waiting', serviceType });
    const queueLength = waitingTokens.length;
    const position = queueLength + 1;

    let estimatedWaitTime = 0;
    waitingTokens.forEach(t => {
      estimatedWaitTime += getServiceDuration(t.serviceType);
    });

    const getServicePrefix = (type) => {
      const prefixes = {
        'Account Services': 'ACC',
        'Loan Services': 'LON',
        'Foreign Exchange': 'FEX',
        'General Inquiry': 'GEN',
        'Card Services': 'CRD',
        'Fixed Deposits': 'FIX',
      };
      return prefixes[type] || 'Q';
    };

    const prefix = getServicePrefix(serviceType);
    const tokenCount = await QueueToken.countDocuments({ serviceType });
    const tokenNumber = `${prefix}-${(tokenCount + 1).toString().padStart(3, '0')}`;

    const newToken = await QueueToken.create({
      userId: req.user._id,
      tokenNumber,
      queuePosition: position,
      customerName,
      phoneNumber,
      serviceType,
    });

    const io = getIo();
    if (io) {
      io.emit('queue_updated', { message: 'New token generated', tokenInfo: newToken });
    }

    res.status(201).json({ token: newToken, estimatedWaitTime });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current user's tokens
// @route GET /api/queue/my-tokens
// @access Private (Customer)
const getMyTokens = async (req, res) => {
  try {
    const tokens = await QueueToken.find({ userId: req.user._id, status: { $in: ['Waiting', 'Called'] } })
      .populate('serviceCounterId', 'counterName')
      .sort('createdAt');

    if (!tokens || tokens.length === 0) {
      return res.status(404).json({ message: 'No active tokens found.' });
    }

    const responseArray = await Promise.all(tokens.map(async (token) => {
      let estimatedWaitTime = 0;
      if (token.status === 'Waiting') {
        const tokensAhead = await QueueToken.find({
          createdAt: { $lte: token.createdAt },
          status: 'Waiting',
          serviceType: token.serviceType,
        });

        let position = 0;
        tokensAhead.forEach(t => {
          if (t._id.toString() !== token._id.toString()) {
            estimatedWaitTime += getServiceDuration(t.serviceType);
          }
          position++;
        });

        token.queuePosition = position;
        await token.save();
      }
      return { token, estimatedWaitTime };
    }));

    res.status(200).json({ tokens: responseArray });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all waiting + called tokens
// @route GET /api/queue
// @access Private (Agent, Admin)
const getAllTokens = async (req, res) => {
  try {
    let query = { status: { $in: ['Waiting', 'Called'] } };
    if (req.user.role === 'Agent' && req.user.department && req.user.department !== 'All') {
      query.serviceType = req.user.department;
    }
    const tokens = await QueueToken.find(query)
      .populate('userId', 'name email')
      .populate('serviceCounterId', 'counterName')
      .sort('createdAt');
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get ALL tokens (history) for admin
// @route GET /api/queue/all
// @access Private (Admin)
const getAllTokensHistory = async (req, res) => {
  try {
    const tokens = await QueueToken.find()
      .populate('userId', 'name email')
      .populate('serviceCounterId', 'counterName')
      .sort({ createdAt: -1 });
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Call next token from queue
// @route PUT /api/queue/call-next
// @access Private (Agent)
const callNextToken = async (req, res) => {
  try {
    let query = { status: 'Waiting' };
    if (req.user.role === 'Agent' && req.user.department && req.user.department !== 'All') {
      query.serviceType = req.user.department;
    }
    const token = await QueueToken.findOne(query).sort('createdAt');
    if (!token) {
      return res.status(404).json({ message: 'No more customers in your department\'s queue.' });
    }

    const { counterId } = req.body;
    token.status = 'Called';
    token.serviceCounterId = counterId;
    await token.save();

    const user = await User.findById(token.userId);

    if (user && user.email) {
      await sendEmail({
        email: user.email,
        subject: `Token ${token.tokenNumber} — Please Proceed to Your Counter`,
        message: `Dear ${token.customerName},\n\nYour token ${token.tokenNumber} has been called. Please proceed to your assigned Service Counter now.\n\nThank you for banking with us.\n\nBank Digital Queue System`,
      });
    }

    const populatedToken = await token.populate('serviceCounterId', 'counterName');

    const io = getIo();
    if (io) {
      io.emit('token_called', { token: populatedToken, counterId });
      io.emit('queue_updated', { message: 'Queue advanced' });
    }

    res.status(200).json(populatedToken);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Complete a token service
// @route PUT /api/queue/:id/complete
// @access Private (Agent)
const completeToken = async (req, res) => {
  try {
    const token = await QueueToken.findById(req.params.id);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = 'Completed';
    await token.save();

    const io = getIo();
    if (io) {
      io.emit('queue_updated', { message: 'Service completed' });
    }

    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel a token (by customer)
// @route DELETE /api/queue/:id
// @access Private (Customer)
const cancelToken = async (req, res) => {
  try {
    const token = await QueueToken.findById(req.params.id);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    if (token.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this token' });
    }

    if (token.status !== 'Waiting') {
      return res.status(400).json({ message: 'Only waiting tokens can be cancelled.' });
    }

    token.status = 'Cancelled';
    await token.save();

    const io = getIo();
    if (io) {
      io.emit('queue_updated', { message: 'Token cancelled' });
    }

    res.status(200).json({ message: 'Token cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get queue stats for admin dashboard
// @route GET /api/queue/stats
// @access Private (Admin)
const getQueueStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCustomers = await QueueToken.countDocuments({ createdAt: { $gte: today } });
    const waiting = await QueueToken.countDocuments({ status: 'Waiting' });
    const called = await QueueToken.countDocuments({ status: 'Called' });
    const completed = await QueueToken.countDocuments({ status: 'Completed', createdAt: { $gte: today } });

    const tokens = await QueueToken.find();
    let totalTime = 0;
    tokens.forEach(t => { totalTime += getServiceDuration(t.serviceType); });
    const avgServiceTime = tokens.length > 0 ? (totalTime / tokens.length).toFixed(1) : 0;
    const performance = avgServiceTime > 40 ? 'Warning' : avgServiceTime > 20 ? 'Good' : 'Excellent';

    const serviceBreakdown = {};
    tokens.forEach(t => {
      serviceBreakdown[t.serviceType] = (serviceBreakdown[t.serviceType] || 0) + 1;
    });

    res.status(200).json({
      totalCustomers,
      waiting,
      inService: called,
      completed,
      avgServiceTime: avgServiceTime + 'm',
      performance,
      serviceBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateToken,
  getMyTokens,
  getAllTokens,
  getAllTokensHistory,
  callNextToken,
  completeToken,
  cancelToken,
  getQueueStats,
};
