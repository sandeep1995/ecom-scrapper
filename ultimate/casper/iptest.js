var casper = require('casper').create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});

casper.options.exitOnError = false;
casper.options.onLoadError = function () {
    this.capture("proxy-error.png");
}

if (casper.cli.has(0)) {
    casper.options.pageSettings.proxy = String(casper.cli.get(0));
}

casper.on('error', function (msg, backtrace) {
    casper.capture('error.png');
});

casper.options.onResourceRequested = function (casper, requestData, request) {
    var accept = requestData.headers[0];
    if (accept.value.indexOf('text/css') !== -1) {
        request.abort();
    }
    if (accept.value.indexOf('application/javascript') !== -1) {
      request.abort();
    }
    var skip = [
        'amazon-adsystem.com',
        'fls-eu.amazon',
        'google-analytics.com',
        'doubleclick.net',
        'cm.g.doubleclick.net',
        'www.googleadservices.com'
    ];

    skip.forEach(function (needle) {
        if (requestData.url.indexOf(needle) > 0) {
            request.abort();
        }
    })
};

casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');


casper.options.waitTimeout = 10000;
casper.options.viewportSize = {
    width: 1366,
    height: 768
};

var link = "https://api.ipify.org/?format=json";
casper.start(link, function () {
    this.echo(this.fetchText('pre'));
});


casper.run(function () {
    this.exit();
});
