var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
  pid: {
    type: String,
    unique: true,
  },
  url: {
    type: String,
    unique: true
  },
  addedBy: [String]
});

module.exports = mongoose.model('Task', TaskSchema);
