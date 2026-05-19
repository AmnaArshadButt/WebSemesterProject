const User = require('../../models/User');

async function profile(req, res, next) {
  try {
    const userId = req.user && req.user.user_id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(userId).select('name email role createdAt updatedAt').lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  profile
};