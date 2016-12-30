var execFile = require('child-process-promise').execFile;
var spawn = require('child_process').spawn;

var atob = require('atob');
var config = require('./config/main')[process.env.NODE_ENV || 'development'];
var randomAgent = require('./helper/useragent');

var randomProxy = require('./helper/randomProxy').randomProxy;
var proxyList = require('./helper/randomProxy').proxyList;

var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var wstream = fs.createWriteStream('ip-sure-data.csv', {
    flags: 'a'
});

var ping = require("ping");
var Promise = require('bluebird');

function loadProcess(ip) {
    return new Promise(function(resolve, reject) {
        child = spawn('casperjs', ['casper/iptest.js', "http://"+ip]);

        child.stdout.setEncoding("utf-8");
        child.stdout.on('data', function(data) {

            wstream.write(JSON.stringify(data + "\n"));
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


proxyList(function(list) {
    (function myLoop(i) {
        var launcher = setTimeout(function() {
            isAlive(list[i -1], function(life) {
                if (life) {
                    // ip is Good, launch
                    console.log(list[i-1] + " is alive");
                    wstream.write("Queing: "+ list[i-1] + "\n");
                    promies.push(loadProcess.bind(null, list[i-1]));
                    console.log(i);
                } else {
                    console.log(list[i-1] + " is dead");
                }
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

                if (--i) myLoop(i);
            });
        }, 1000);
    })(list.length);
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
