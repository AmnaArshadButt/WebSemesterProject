const User = require('../models/User');

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  req.flash('error', 'Please login to continue');
  return res.redirect('/login');
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === 'admin') return next();
    req.flash('error', 'Access Denied');
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
};
