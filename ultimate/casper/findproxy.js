var casper = require('casper').create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});

casper.options.exitOnError = true;
casper.options.onLoadError = function () {
    casper.exit();
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

var link = "https://proxy-spider.com/";
casper.start(link, function () {
    this.echo(JSON.stringify(this.getGlobal('pr')));
});


casper.run(function () {
    this.exit();
});
