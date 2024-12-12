const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const username = req.body.username;
  const fullname = req.body.fullname;
  const password = req.body.password;
  const confirmPassword = req.body.confirmpassword;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const confirmHashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      username: username,
      password: hashedPw,
      fullname: fullname,
      confirmpassword: confirmHashedPw
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        username: loadedUser.username,
        userId: loadedUser._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    // const user = await User.findById(req.userId);
    // if (!user) {
    //   const error = new Error('User not found.');
    //   error.statusCode = 404;
    //   throw error;
    // }
    // res.status(200).json({ status: user.status });
    console.log(req.userId);
    const users = await User.find();
    res.status(200).json({users});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
