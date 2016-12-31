var config = require('../config/main')['development'];
var MongoClient = require('mongodb').MongoClient;
var pingProxy = require('ping-proxy');
var ips = [];
const randomProxy = function(cb) {
    var ip = null;
    MongoClient.connect(config.database, function(err, db) {
        db.collection('proxy').find({}).sort({
            timestamp: -1
        }).limit(150).toArray(function(err, result) {
            db.close();
            if (err) {
                console.log(err);
                return cb(null);
            } else {
                if (result.length > 0 && ips.length == 0) {
                    ips = result.map(function(item) {
                        return item.ip;
                    });
                    ip = `http://${String(ips[Math.floor(Math.random() * ips.length)])}`;
                    return cb(ip);
                }
            }
        });
    });
};



const proxyList = function(cb) {
    // var ip = null;
    // MongoClient.connect(config.database, function (err, db) {
    //     db.collection('proxy').find({}).sort({
    //         timestamp: -1
    //     }).limit(150).toArray(function (err, result) {
    //          db.close();
    //         if (err) {
    //             console.log(err);
    //             return cb(null);
    //         } else {
    //             if (result.length > 0 && ips.length == 0) {
    //                 ips = result.map(function (item) {
    //                     return item.ip;
    //                 });
    //                 return cb(ips);
    //             }
    //         }
    //     });
    // });

    var ips = ["http://43.241.246.40:8080",
        "socks5://220.225.208.245:45554",
        "http://103.240.8.2:8080",
        "http://220.225.87.129:8080",
        "http://220.225.87.129:8080",
        "http://175.101.16.92:8080",
        "http://110.172.169.241:808",
        "http://103.224.187.105:8080",
        "http://175.101.16.92:8080",
        "http://49.205.228.38:8080",
        "socks5://61.0.245.62:45554",
        "socks5://103.233.117.115:45554",
        "http://182.72.163.162:8080",
        "http://183.82.109.189:8080"
    ];
    return cb(ips);

};

var goodProxies = ["http://219.106.230.5:80", "http://175.180.240.80:8998"]

module.exports = {
    randomProxy,
    proxyList
};
