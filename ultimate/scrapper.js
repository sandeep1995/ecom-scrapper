var execFile = require('child-process-promise').execFile;

const spawn = require('child_process').spawn;

var atob = require('atob');
var config = require('./config/main')[process.env.NODE_ENV || 'development'];
var randomAgent = require('./helper/useragent');
var randomProxy = require('./helper/randomProxy');
var MongoClient = require('mongodb').MongoClient;


// MongoClient.connect(config.database, function(err, db) {
//     db.collection('proxy').find({}).toArray(function(err, result) {
//         db.close();
//         var proxyList = result.map(function(item) {
//             return item.ip;
//         });
//         var ip = `http://${String(proxyList[Math.floor(Math.random() * proxyList.length)])}`;
//         return cb(ip);
//     });
// });


function scrapHand(url) {
    randomProxy(function(proxy) {
        var agent = randomAgent();
        console.log(proxy);
        const pinger = spawn("ping", [proxy.split("//")[1].split(":")[0]]);
        var child = null;
        var i = 0;
        pinger.stdout.on('data', (data) => {
            console.log(`stdout: ${data} ${++i}`);
            if (i === 3) {
                pinger.kill("SIGINT");
                clearTimeout(timer);

                child = spawn('casperjs', ['casper/scrapamazon.js', String(proxy), String(agent), "http://www.amazon.in"+url]);

                // child.then(function (result) {
                //   console.log("*********************************");
                //   console.log(result);
                // }).catch(function (err) {
                //   console.log(err);
                // });

                child.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                });

                child.stderr.on('data', (data) => {
                    console.log(`stderr: ${data}`);
                });

                child.on('close', (code) => {
                    console.log(`casper exited with code ${code}`);
                });
            }
        });

        var timer = setTimeout(function() {
            pinger.kill("SIGINT");
            scrapHand(url);

        }, 5000);

        pinger.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        pinger.on('close', (code) => {
            console.log(`pinger exited with code ${code}`);
        });

    });

}
//scrapHand("/gp/bestsellers/books/ref=sd_allcat_books_bestsellers/253-5956496-3638405");
// scrapHand("/Android-Mobiles/b?ie=UTF8&node=4916280031");
scrapHand("/Video-Games-Consoles/b/ref=sd_allcat_vg_consoles/253-5956496-3638405?ie=UTF8&node=4092115031");
