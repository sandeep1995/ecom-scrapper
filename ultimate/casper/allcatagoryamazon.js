var casper = require('casper').create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});

casper.options.exitOnError = false;
casper.options.onLoadError = function() {
    casper.capture("load.png")
}



casper.options.pageSettings.proxy = String(casper.cli.get(0));



casper.on('error', function(msg, backtrace) {
    casper.capture('error.png');
    casper.echo(JSON.stringify(backtrace));
    casper.echo(JSON.stringify(msg));
});

// casper.on('resource.requested', function(resource) {
//     for (var obj in resource.headers) {
//         var name = resource.headers[obj].name;
//         var value = resource.headers[obj].value;
//         if (name == "User-Agent") {
//             this.echo(value);
//         }
//     }
// });

casper.options.onResourceRequested = function(casper, requestData, request) {
    var accept = requestData.headers[0];
    if (accept.value.indexOf('text/css') !== -1) {
        // console.log('Skipping CSS file: ' + requestData.url);
        request.abort();
    }
    var skip = [
        'amazon-adsystem.com',
        'fls-eu.amazon',
        'google-analytics.com',
        'doubleclick.net',
        'cm.g.doubleclick.net',
        'googleadservices.com'
    ];
    skip.forEach(function(needle) {
        if (requestData.url.indexOf(needle) > 0) {
            request.abort();
        }
    })
};

casper.options.waitTimeout = 20000;
casper.options.viewportSize = {
    width: 1366,
    height: 768
};

casper.userAgent(String(casper.cli.get(1)));

var links = [];

function getLinks() {
    var links = document.querySelectorAll('#shopAllLinks .nav_a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}


var link = "http://www.amazon.in/gp/site-directory/";

casper.start(link, function() {
    this.waitForSelector("#siteDirectory");
});

casper.then(function() {
    links = this.evaluate(getLinks);
    this.echo(JSON.stringify(links));
});


casper.run(function() {
    this.exit();
});
