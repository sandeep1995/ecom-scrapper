var config = require('../config/main')[process.env.NODE_ENV || 'development'];
var MongoClient = require('mongodb').MongoClient;
var pingProxy = require('ping-proxy');
var ips = [];
const randomProxy = function (cb) {
    var ip = null;
    MongoClient.connect("mongodb://127.0.0.1:27017/ecommerce", function (err, db) {
        db.collection('proxy').find({}).sort({
            timestamp: -1
        }).limit(10).toArray(function (err, result) {
             db.close();
            if (err) {
                console.log(err);
                return cb(null);
            } else {
                if (result.length > 0 && ips.length == 0) {
                    ips = result.map(function (item) {
                        return item.ip;
                    });
                    ip = `http://${String(ips[Math.floor(Math.random() * ips.length)])}`;
                    return cb(ip);
                }
            }
        });
    });
};



const proxyList = function (cb) {
    var ip = null;
    MongoClient.connect("mongodb://127.0.0.1:27017/ecommerce", function (err, db) {
        db.collection('proxy').find({}).sort({
            timestamp: -1
        }).limit(350).toArray(function (err, result) {
             db.close();
            if (err) {
                console.log(err);
                return cb(null);
            } else {
                if (result.length > 0 && ips.length == 0) {
                    ips = result.map(function (item) {
                        return item.ip;
                    });
                    return cb(ips);
                }
            }
        });
    });
};

var goodProxies = ["http://219.106.230.5:80", "http://175.180.240.80:8998"]

module.exports = {randomProxy, proxyList};
