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
    var productLink = 'a.a-link-normal.s-access-detail-page.a-text-normal';
    var nodes = document.querySelectorAll(productLink);
    return Array.prototype.map.call(nodes, function(e) {
        return e.getAttribute('href').indexOf('http://') == -1 ? "https://www.amazon.in"+e.getAttribute('href').split("ref")[0] : e.getAttribute('href').split("ref")[0];
    });
}

var results = 'div.s-item-container';

var searchPage = "http://www.amazon.in/s/?field-keywords=" + fixedEncodeURIComponent(link);

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
