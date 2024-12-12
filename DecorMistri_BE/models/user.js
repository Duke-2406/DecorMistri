const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirmpassword: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    required: true
  }
});

module.exports = User = mongoose.model('user', userSchema);
