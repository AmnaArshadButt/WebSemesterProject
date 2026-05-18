const User = require('../models/User');

exports.registerForm = (req, res) => {
  res.render('auth/register');
};

exports.loginForm = (req, res) => {
  res.render('auth/login');
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      req.flash('error', 'Please provide name, a valid email and password (6+ chars)');
      return res.redirect('/register');
    }

    const exists = await User.findOne({ email });
    if (exists) {
      req.flash('error', 'Email already registered');
      return res.redirect('/register');
    }

    const user = await User.create({ name, email, password });
    req.session.userId = user._id;
    req.session.role = user.role;
    req.flash('success', `Welcome, ${user.name}!`);
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Please enter both email and password');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    const match = await user.comparePassword(password);
    if (!match) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    req.session.userId = user._id;
    req.session.role = user.role;
    req.flash('success', `Welcome back, ${user.name}!`);
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }

    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};
