var execFile = require('child-process-promise').execFile;

const spawn = require('child_process').spawn;

var atob = require('atob');
var config = require('./config/main')[process.env.NODE_ENV || 'development'];
var randomAgent = require('./helper/useragent');
var randomProxy = require('./helper/randomProxy');
var MongoClient = require('mongodb').MongoClient;

var insertDocument = function (db, data, callback) {
    var collection = db.collection('amazoncat');
    collection.insertMany(data, function (err, result) {
        callback(err, result);
    });
}

randomProxy(function(proxy) {
    var agent = randomAgent();
    console.log(proxy);
    const pinger = spawn("ping", [proxy.split("//")[1].split(":")[0]]);
    var child = null;
    var i = 0;
    pinger.stdout.on('data', (data) => {
        console.log(`stdout: ${data} ${++i}`);
        if ( i === 3  ) {
          pinger.kill("SIGINT");
          child = spawn('casperjs', ['casper/allcatagoryamazon.js', String(proxy), String(agent)]);

          child.stdout.on('data', (data) => {
                  console.log(`stdout: ${data}`);
                  data = JSON.parse(data);
                  data = data.map(item => {
                    return {url: item};
                  });

                  MongoClient.connect(config.database, function (err, db) {
                      console.log("Connected correctly to server");
                      insertDocument(db, data, function (err, result) {
                          console.log(result);
                          db.close();
                      });
                  });

              });

              child.stderr.on('data', (data) => {
                  console.log(`stderr: ${data}`);
              });

              child.on('close', (code) => {
                  console.log(`casper exited with code ${code}`);
              });
        }
    });

    setTimeout(function () {
      pinger.kill("SIGINT");

    }, 5000);

    pinger.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    pinger.on('close', (code) => {
        console.log(`pinger exited with code ${code}`);
    });

});
