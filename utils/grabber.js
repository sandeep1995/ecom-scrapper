var Product = require('../models/Product');
var helper = require('./helper');

var execFile = require('child-process-promise').execFile;

module.exports = {
    flipkart: (url, pid) => {
        console.log("Executing Flipkart");
        return execFile('casperjs', ['--cookies-file='+pid+'.txt', 'routes/ecommerce/flipkart.js', url.split("&")[0]])
            .then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                if (stderr) {
                    throw stderr;
                }
                return stdout;
            }).then(function(stdout) {
                var message = JSON.parse(stdout);
                message.merchant = "Flipkart";
                message.pid = pid;
                message.url = url;
                console.log(message);
                Product.findOne({
                        pid: message.pid
                    }).sort('-timestamp').exec()
                    .then(function(data) {
                        if (data == null) {
                            var product = new Product(message);
                            return product.save();
                        } else {
                            if (data.price != message.price) {
                                helper.sendNotification(data, message);
                                var product = new Product(message);
                                return product.save();
                            }
                        }
                    })
            }).catch(function(err) {
                return console.error('ERROR: ', err);
            });
    },

    amazon: (url, pid) => {
        console.log("Executing Amazon");
        return execFile('casperjs', ['--cookies-file='+pid+'.txt', 'routes/ecommerce/amazon.js', url.split("ref")[0]])
            .then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                if (stderr) {
                    throw stderr;
                }
                return stdout;
            }).then(function(stdout) {
                var message = JSON.parse(stdout);
                message.merchant = "Amazon";
                message.pid = pid;
                message.url = url;
                console.log(message);
                Product.findOne({
                        pid: message.pid
                    }).sort('-timestamp').exec()
                    .then(function(data) {
                        if (data == null) {
                            var product = new Product(message);
                            return product.save();
                        } else {
                            // save if price is different
                            // send notification
                            if (data.price != message.price) {
                                helper.sendNotification(data, message);
                                var product = new Product(message);
                                return product.save();
                            }
                        }
                    })
            }).catch(function(err) {
                return console.error('ERROR: ', err);
            });
    },

    snapdeal: (url, pid) => {
        console.log("Executing Snapdeal");
        return execFile('casperjs', ['--cookies-file='+pid+'.txt', 'routes/ecommerce/snapdeal.js', url])
            .then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                return stdout;
            }).then(function(stdout) {
                var message = JSON.parse(stdout);
                message.merchant = "Snapdeal";
                message.pid = pid;
                message.url = url;
                console.log(message);
                Product.findOne({
                        pid: message.pid
                    }).sort('-timestamp').exec()
                    .then(function(data) {
                        if (data == null) {
                            var product = new Product(message);
                            return product.save();
                        } else {
                            // save if price is different
                            // send notification
                            if (data.price != message.price) {
                                helper.sendNotification(data, message);
                                var product = new Product(message);
                                return product.save();
                            }
                        }
                    })
            }).catch(function(err) {
                return console.error('ERROR: ', err);
            });
    },

    myntra: (url, pid) => {
        console.log("Executing Myntra");
        return execFile('casperjs', ['--cookies-file='+pid+'.txt', 'routes/ecommerce/myntra.js', url])
            .then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                if (stderr) {
                    throw stderr;
                }

                return stdout;
            }).then(function(stdout) {
                var message = JSON.parse(stdout);
                message.merchant = "Myntra";
                message.pid = pid;
                message.url = url;
                console.log(message);
                Product.findOne({
                        pid: message.pid
                    }).sort('-timestamp').exec()
                    .then(function(data) {
                        if (data == null) {
                            var product = new Product(message);
                            return product.save();
                        } else {
                            // save if price is different
                            // send notification
                            if (data.price != message.price) {
                                helper.sendNotification(data, message);

                                var product = new Product(message);
                                return product.save();
                            }
                        }
                    })
            }).catch(function(err) {
                return console.error('ERROR: ', err);
            });
    },

    ebay: (url, pid) => {
        console.log("Executing Ebay");
        return execFile('casperjs', ['--cookies-file='+pid+'.txt', 'routes/ecommerce/ebay.js', url])
            .then(function(result) {
                var stdout = result.stdout;
                var stderr = result.stderr;
                if (stderr) {
                    throw stderr;
                }
                return stdout;
            }).then(function(stdout) {
                var message = JSON.parse(stdout);
                message.merchant = "Ebay";
                message.pid = pid;
                message.url = url;
                console.log(message);
                Product.findOne({
                        pid: message.pid
                    }).sort('-timestamp').exec()
                    .then(function(data) {
                        if (data == null) {
                            var product = new Product(message);
                            return product.save();
                        } else {
                            // save if price is different
                            // send notification
                            if (data.price != message.price) {
                                helper.sendNotification(data, message);

                                var product = new Product(message);
                                return product.save();
                            }
                        }
                    })
            }).catch(function(err) {
                return console.error('ERROR: ', err);
            });
    }
};
