const  mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },
  token: {
    type: String
  }
});

module.exports = mongoose.model('User', UserSchema);
