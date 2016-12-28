var Product = require('../models/Product');
var Task = require('../models/Task');

var helper = require('./helper');

var execFile = require('child-process-promise').execFile;

module.exports = {
    flipkart: (name, pid) => {
        console.log("Flipkart suggestions");
        return execFile('casperjs', ['routes/search/flipkart.js', String(name)])
          .then(function(result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            if (stderr) {
              throw stderr;
            }
            return stdout;
        }).then(function (stdout) {
          var message = JSON.parse(stdout);
          console.log(message);
          Product.findOne({pid: pid}).sort('-timestamp').exec()
          .then(function (data) {
            data.suggestions.flipkart = message;
            return data.save().then(function () {
                  message = message.forEach(function (item) {
                    var dataToIn =  {
                      url: item,
                      pid: helper.intelligentGuessId(item)
                    };
                    Task.findOne({pid: dataToIn.pid}).exec().then(function (task) {
                      if (task == null) {
                        task = new Task(dataToIn);
                        task.save();
                      }
                    })
                  });
            }, function (err) {
              if (err) {
                throw err;
              }
            });
          })
        }).catch(function(err) {
            return console.error('ERROR: ', err);
        });
    },
    amazon: (name, pid) => {
        console.log("Amazon suggestions");
        return execFile('casperjs', ['routes/search/amazon.js', String(name)])
          .then(function(result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            if (stderr) {
              throw stderr;
            }
            return stdout;
        }).then(function (stdout) {
          var message = JSON.parse(stdout);
          console.log(message);
          Product.findOne({pid: pid}).sort('-timestamp').exec()
          .then(function (data) {
             data.suggestions.amazon = message;
            return data.save().then(function () {
                  message = message.forEach(function (item) {
                    var dataToIn =  {
                      url: item,
                      pid: helper.intelligentGuessId(item)
                    };
                    Task.findOne({pid: dataToIn.pid}).exec().then(function (task) {
                      if (task == null) {
                        task = new Task(dataToIn);
                        task.save();
                      }
                    })
                  });
            }, function (err) {
              if (err) {
                throw err;
              }
            });
          })
        }).catch(function(err) {
            return console.error('ERROR: ', err);
        });
    },

    snapdeal: (name, pid) => {
        console.log("Snapdeal suggestions");
        return execFile('casperjs', ['routes/search/snapdeal.js', String(name)])
          .then(function(result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            if (stderr) {
              throw stderr;
            }
            return stdout;
        }).then(function (stdout) {
          var message = JSON.parse(stdout);
          console.log(message);
          Product.findOne({pid: pid}).sort('-timestamp').exec()
          .then(function (data) {

            data.suggestions.snapdeal = message;
            return data.save().then(function () {
                  message = message.forEach(function (item) {
                    var dataToIn =  {
                      url: item,
                      pid: helper.intelligentGuessId(item)
                    };
                    Task.findOne({pid: dataToIn.pid}).exec().then(function (task) {
                      if (task == null) {
                        task = new Task(dataToIn);
                        task.save();
                      }
                    })
                  });
            }, function (err) {
              if (err) {
                throw err;
              }
            });
          })
        }).catch(function(err) {
            return console.error('ERROR: ', err);
        });
    }
};
