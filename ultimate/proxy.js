var execFile = require('child-process-promise').execFile;
var atob = require('atob');
var config = require('./config/main')[process.env.NODE_ENV || 'development'];
var MongoClient = require('mongodb').MongoClient;

function proxyFinder() {
    var insertDocuments = function (db, data, callback) {
        var collection = db.collection('proxy');
        collection.insertMany(data, function (err, result) {
            callback(err, result);
        });
    }

    execFile('casperjs', ['casper/findproxy.js'])
        .then(function (result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            return stdout;
        }).then(function (stdout) {
            proxyArray = JSON.parse(stdout);
            proxyArray = proxyArray.map(item => {
                return { ip: atob(item.proxy), timestamp: new Date() };
            });

            MongoClient.connect(config.database, function (err, db) {
                console.log("Connected correctly to server");
                insertDocuments(db, proxyArray, function (err, result) {
                    console.log(result);
                    db.close();
                    const ONE_MIN = 1000*60;
                    setTimeout(proxyFinder, ONE_MIN * 5);
                });
            });

        }).catch(function (err) {
            console.error('ERROR: ', err);
        });
}

proxyFinder();
