const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (id, role) => {
  return jwt.sign(
    { sub: id, role: role },
    process.env.JWT_SECRET,
    { expiresIn: `${process.env.JWT_EXPIRE_HOURS || 8}h` }
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user._id, user.role);
    const initials = user.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: initials,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  res.json({ ok: true });
};

module.exports = { login, logout };
