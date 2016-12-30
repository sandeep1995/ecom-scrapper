var execFile = require('child-process-promise').execFile;
var spawn = require('child_process').spawn;

var atob = require('atob');
var config = require('./config/main')[process.env.NODE_ENV || 'development'];
var randomAgent = require('./helper/useragent');

var randomProxy = require('./helper/randomProxy').randomProxy;
var proxyList = require('./helper/randomProxy').proxyList;

var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var wstream = fs.createWriteStream('data.csv', {
    flags: 'a'
});

var ping = require("ping");
var Promise = require('bluebird');

function loadProcess(arg) {
    return new Promise(function(resolve, reject) {

        child = spawn('casperjs', ['casper/scrapamazon.js', String(arg.ip), String(randomAgent()), "http://www.amazon.in" + arg.url]);

        child.stdout.on('data', function(data) {
            wstream.write(data.toString())
            console.log(data.toString());
        });

        child.stderr.on('data', function(err) {
            reject(err.toString());
        });

        child.on('close', function() {
            resolve();
        });
    });
}

var promies = [];

MongoClient.connect("mongodb://127.0.0.1:27017/ecommerce", function(err, db) {
    db.collection('amazoncat').find({}).limit(10).toArray(function(err, result) {

        db.close();
        proxyList(function(list) {
            j = 0;
            (function myLoop(i) {
                var launcher = setTimeout(function() {
                    isAlive(list[j], function(life) {
                        if (life) {
                            // ip is Good, launch
                            console.log(list[j] + " is alive");
                            wstream.write("Using: " + list[j] + "\n");
                            wstream.write("Queing: " + result[i - 1].url + "\n");
                            promies.push(loadProcess.bind(null, {
                                ip: list[j],
                                url: result[i - 1].url
                            }));
                            if (i == 1) {
                                clearTimeout(launcher);
                                wstream.write("[---------------------Starting--------------------------] ");
                                Promise.map(promies, function(command) {
                                        return command();
                                    })
                                    .then(function() {
                                        wstream.write("[---------------------Done--------------------------] ");

                                        console.log('Child Processes Completed');
                                    });
                            }
                        } else {
                            console.log(list[j] + " is dead");
                        }
                        j++;
                        if (--i) myLoop(i);
                    });
                }, 1000);
            })(result.length);
        });
    });
});

function isAlive(ip, cb) {
    var pinger = spawn("ping", [ip.split(":")[0]]);
    var i = 0;
    var timer = setTimeout(function() {
        if (i < 2) {
            cb(false);
        } else {
            cb(true);
        }
        clearTimeout(timer);
        pinger.kill("SIGINT");
    }, 3000);

    pinger.stdout.setEncoding("utf-8")
    pinger.stdout.on("data", function(data) {
        i++;
    });
}
