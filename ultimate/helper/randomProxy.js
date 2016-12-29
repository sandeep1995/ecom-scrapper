var config = require('../config/main')[process.env.NODE_ENV || 'development'];
var MongoClient = require('mongodb').MongoClient;
var pingProxy = require('ping-proxy');
const randomProxy = function(cb) {
    MongoClient.connect(config.database, function(err, db) {
        db.collection('proxy').find({}).sort({
            timestamp: -1
        }).limit(10).toArray(function(err, result) {
            db.close();
            var proxyList = result.map(function(item) {
                return item.ip;
            });
            var ip = `http://${String(proxyList[Math.floor(Math.random() * proxyList.length)])}`;
            return cb(ip);
        });
    });
};
var goodProxies = ["http://219.106.230.5:80", "http://175.180.240.80:8998"]
module.exports = randomProxy;
