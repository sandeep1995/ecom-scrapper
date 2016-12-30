var casper = require('casper').create({
    // verbose: true,
    // logLevel: "debug",
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});
var uniqueName = Math.random().toString(36).substring(7);
casper.options.exitOnError = false;

casper.options.onLoadError = function() {
    casper.capture("./data/" + uniqueName + '-load.png');
}
var fs = require('fs');

if (casper.cli.has(0)) {
    casper.options.pageSettings.proxy = String(casper.cli.get(0));
} else {
    casper.options.pageSettings.proxy = "http://219.106.230.5:80";
}

casper.on('error', function(msg, backtrace) {
    casper.capture("./data/" + uniqueName + '-error.png');
    casper.echo(JSON.stringify(backtrace));
    casper.echo(JSON.stringify(msg));
});

// casper.on('resource.requested', function(resource) {
//     this.echo(JSON.stringify(resource));
// });

// casper.on('remote.message', function(msg) {
//   this.echo(msg);
// });


casper.options.onResourceRequested = function(casper, requestData, request) {

    var accept = requestData.headers[0];

    // if (accept.value.indexOf('text/css') !== -1) {
    //     casper.echo('Skipping CSS file: ' + requestData.url);
    //     request.abort();
    // }

    if (accept.value.indexOf('text/plain') !== -1) {
      //  casper.echo('Skipping: ' + requestData.url);
        request.abort();
    }

    var skip = [
        "adsensecustomsearchads",
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

var names = [];
var urls = [];
var prices = [];

var imgUrls = [];
var data = [];

function getAll() {
    var names = document.querySelectorAll('h2.a-size-base.a-color-null.s-inline.s-access-title.a-text-normal');
    names = Array.prototype.map.call(names, function(e) {
        return e.innerText;
    });

    var urls = document.querySelectorAll('a.a-link-normal.s-access-detail-page.a-text-normal');
    urls = Array.prototype.map.call(urls, function(e) {
        return e.getAttribute('href').split("ref")[0];
    });

    var prices = document.querySelectorAll('span.a-size-base.a-color-price.s-price.a-text-bold');

    prices = Array.prototype.map.call(prices, function(e) {
        return String(e.innerText).trim().replace(/[^0-9\.]+/g, "");;
    });

    var imgUrls = document.querySelectorAll("img.s-access-image.cfMarker");

    imgUrls = Array.prototype.map.call(imgUrls, function(e) {
        return e.getAttribute('src');
    });

    return data = names.map(function(item) {
        var i = names.indexOf(item);
        return {
            name: item,
            url: urls[i],
            price: prices[i],
            imgUrl: imgUrls[i]
        }
    });
}

function getAllDiff() {

    var names = document.querySelectorAll("#zg_centerListWrapper div.a-section.a-spacing-mini > img");
    names = Array.prototype.map.call(names, function(e) {
        return e.getAttribute("alt");
    });


    var imgUrls = document.querySelectorAll("#zg_centerListWrapper div.a-section.a-spacing-mini > img");

    imgUrls = Array.prototype.map.call(imgUrls, function(e) {
        return e.getAttribute("src");
    });

    var prices = document.querySelectorAll("#zg_centerListWrapper .a-size-base.a-color-price");

    prices = Array.prototype.map.call(prices, function(e) {
        return String(e.innerText).trim().replace(/[^0-9\.]+/g, "");;
    });

    var urls = document.querySelectorAll("#zg_centerListWrapper div.a-section.a-spacing-none.p13n-asin > .a-link-normal");

    urls = Array.prototype.map.call(urls, function(e) {
        return e.getAttribute('href').split("ref")[0];
    });

    return data = names.map(function(item) {
        var i = names.indexOf(item);
        return {
            name: item,
            url: urls[i],
            price: prices[i],
            imgUrl: imgUrls[i]
        }
    });
}



var tobewritten = [];

var link = String(casper.cli.get(2));;
casper.echo("Starting: " + link);

var i = 0;

var stream = fs.open("./data/" + uniqueName + "-data.json", "aw");
var urlStream = fs.open("./data/" + uniqueName + "-data.csv", "aw");

urlStream.writeLine(JSON.stringify(casper.cli.args));

function getALlProducts() {
    var nextPage = "a#pagnNextLink";
    casper.wait(2000, function() {
        if (casper.visible(nextPage) || casper.exists(nextPage)) {
            i++;
            casper.capture("./data/" + uniqueName + "-image" + i + ".png");
            if (casper.exists(".cfMarker")) {
                data = this.evaluate(getAll);
            }

            tobewritten = JSON.stringify(data);

            this.echo(tobewritten);

            stream.writeLine(tobewritten + ",");
            stream.flush();
            urlStream.flush();
            tobewritten = null;

            var nextLink = casper.getElementAttribute(nextPage, "href");
            nextLink = "http://www.amazon.in" + nextLink.split("&qid")[0];
            casper.echo("Opening: " + nextLink);

            urlStream.writeLine(nextLink + ",");
            casper.thenClick(nextPage);
            casper.then(getALlProducts);
        } else if (casper.exists("div.a-section.a-spacing-mini") && !casper.exists(".cfMarker")) {
            i++;
            casper.capture("./data/" + uniqueName + "-image" + i + ".png");
            tobewritten = this.evaluate(getAllDiff);

            tobewritten = JSON.stringify(tobewritten);

            this.echo(tobewritten);

            stream.writeLine(tobewritten + ",");
            stream.flush();
            urlStream.flush();
            tobewritten = null;

            var nextLink = this.getElementAttribute(".zg_pagination li:nth-child("+(i+1)+") a", "href");

            if (nextLink == null) {
                casper.exit();
                stream.close();
                urlStream.close();
                casper.echo("END BY " + nextLink);
                casper.exit();
            } else {
                urlStream.writeLine(nextLink + ",");
                casper.thenOpen(nextLink);
                casper.then(getALlProducts);
            }

        } else {
            stream.close();
            urlStream.close();
            casper.echo("a#pagnNextLink END");
            casper.exit();
        }
    });
}

casper.start(String(link)).wait(2000, function() {
    casper.capture("./data/" + uniqueName + "-image-first" + i + ".png");
    if (casper.exists(".s-layout-toggle-picker > a") || casper.visible(".s-layout-toggle-picker > a")) {
        casper.capture("./data/" + uniqueName + "-button" + i + ".png");
        casper.thenClick(".s-layout-toggle-picker > a");
        casper.then(getALlProducts);
    } else if (casper.exists("div.a-section.a-spacing-mini") && !casper.exists(".cfMarker")) {
        casper.capture("./data/" + uniqueName + "-image-second-abnormal" + i + ".png");
        casper.then(getALlProducts);
    } else {
        stream.close();
        urlStream.close();
        casper.capture("./data/" + uniqueName + "-Failed" + i + ".png");
        casper.echo("FIRST END");
        casper.exit();
    }
});

casper.then(getALlProducts);

casper.run(function() {
    this.exit();
});
