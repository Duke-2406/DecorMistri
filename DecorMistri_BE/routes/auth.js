const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('username')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ username: value });
        console.log(value);
        console.log(userDoc);
        if (userDoc){
          return Promise.reject('E-Mail address already exists!');
        }
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('confirmpassword')
      .trim()
      .isLength({ min: 5 }),
    body('fullname')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

router.post('/login', authController.login);

router.get('/users', isAuth, authController.getUsers);

router.patch(
  '/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

module.exports = router;
