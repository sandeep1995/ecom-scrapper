var casper = require('casper').create({
    proxy: 'http://localhost:3128',
    verbose: true,
    logLavel: "debug",
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});


casper.options.exitOnError = true;
casper.options.onLoadError = function() {
    casper.exit();
}

casper.on('error', function(msg,backtrace) {
  casper.capture('error.png');
  casper.echo(JSON.stringify(backtrace));
  casper.echo(JSON.stringify(msg));
});


casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');


casper.options.waitTimeout = 10000;
casper.options.viewportSize = {
    width: 1366,
    height: 768
};

var link = "https://www.whatismyip.com/";

casper.start(link, function() {
    this.capture(Math.round(Math.random()*100) + ".png");
});

casper.run(function() {
    this.exit();
});
