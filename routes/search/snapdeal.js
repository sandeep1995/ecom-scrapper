var casper = require('casper').create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false
    }
});

casper.options.exitOnError = true;
casper.options.onLoadError = function() {
    casper.exit();
}

casper.options.waitTimeout = 10000;
casper.options.viewportSize = {
    width: 1366,
    height: 768
};

function fixedEncodeURIComponent(str) {
    return str.replace(/[ !,'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

var link = casper.cli.get(0);
var links = [];

function getLinks() {
    var productLink = 'a.dp-widget-link.noUdLine.hashAdded';
    var nodes = document.querySelectorAll(productLink);
    return Array.prototype.map.call(nodes, function(e) {
        return e.getAttribute('href').split("#")[0];
    });
}

var results = 'div.col-xs-6.favDp.product-tuple-listing.js-tuple';

var searchPage = "https://www.snapdeal.com/search?keyword=" + fixedEncodeURIComponent(link);

casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');



casper.start(searchPage, function() {
    this.waitForSelector(results);
});

casper.then(function() {
    links = this.evaluate(getLinks);
    links.length = links.length >= 5 ? 5 : links.length;
    this.echo(JSON.stringify(links));
});

casper.run(function() {
    this.exit();
});
