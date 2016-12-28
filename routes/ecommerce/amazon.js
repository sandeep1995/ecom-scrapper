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

casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');

casper.options.waitTimeout = 10000;
casper.options.viewportSize = {
    width: 1366,
    height: 768
};

var link = casper.cli.get(0);

var productNameSelector = '#productTitle.a-size-large';
var priceSelector = '#priceblock_ourprice';
var imgSelector = 'img#landingImage';

casper.start(link, function() {
    this.waitForSelector(productNameSelector);
});

casper.then(function() {

    if (casper.exists("span#priceblock_dealprice")) {
        priceSelector = "span#priceblock_dealprice";
    }

    if (casper.exists('span#priceblock_saleprice')) {
        priceSelector = 'span#priceblock_saleprice';
    }

    if (casper.exists('span.offer-price.price3P')) {
        priceSelector = 'span.offer-price.price3P';
    }

    if (casper.exists('#imgBlkFront')) {
        imgSelector = "#imgBlkFront";
    }

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
