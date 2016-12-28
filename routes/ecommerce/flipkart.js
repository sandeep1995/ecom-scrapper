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
casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');

var link = casper.cli.get(0);

var productNameSelector = '._2UDlNd ._3eAQiD';
var priceSelector = '._1MVZfW ._3ZYEWO ._2MUtYG ._37U4_g';
var imgSelector = '.sfescn';

casper.start(link, function() {
    this.waitForSelector(priceSelector);
});

casper.then(function() {
    var productName = this.fetchText(productNameSelector);
    var price = String(this.fetchText(priceSelector)).trim().replace(/[^0-9\.]+/g, "");
    var imgUrl = String(this.getElementsInfo(imgSelector)[0].attributes.src).trim();
    var message = {
        name: String(productName).trim(),
        price: Number(price),
        img: imgUrl
    };
    message = JSON.stringify(message);
    this.echo(message);
});

casper.run(function() {
    this.exit();
});
