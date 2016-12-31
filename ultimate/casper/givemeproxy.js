// http://gimmeproxy.com/api/getProxy?get=true&supportsHttps=true&maxCheckPeriod=1000
var casper = require('casper').create({
    verbose: true,
    logLevel: "debug",
    pageSettings: {
        loadImages: true,
        loadPlugins: true,
        "webSecurityEnabled": false,
        "ignoreSslErrors": true
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
}

casper.on('error', function(msg, backtrace) {
    casper.capture("./data/" + uniqueName + '-error.png');
    casper.echo(JSON.stringify(backtrace));
    casper.echo(JSON.stringify(msg));
});

casper.on("page.initialized", function(page) {
    // casper.evaluate(function() {
    //     window.navigator = {
    //         plugins: {
    //             "Shockwave Flash": {
    //                 description: "Shockwave Flash 24.0 r0"
    //             },
    //             "Widevine Content Decryption Module": {
    //                 description: "Enables Widevine licenses for playback of HTML audio/video content. (version: 1.4.8.903)"
    //             }
    //         },
    //         mimeTypes: {
    //             "application/x-shockwave-flash": {
    //                 enabledPlugin: true
    //             },
    //             "application/x-ppapi-widevine-cdm": {
    //                 enabledPlugin: true
    //             }
    //         }
    //     };
    // });

    casper.evaluate(function() {
        window.navigator = {
            plugins: {
                "Shockwave Flash": {
                    description: "Shockwave Flash 11.2 e202"
                }
            },
            mimeTypes: {
                "application/x-shockwave-flash": {
                    enabledPlugin: true
                }
            }
        };
    });


    casper.evaluate(function() {
        var create = document.createElement;
        document.createElement = function(tag) {
            var elem = create.call(document, tag);
            if (tag === "video") {
                elem.canPlayType = function() {
                    return "probably";
                };
            }
            return elem;
        };
    });

    casper.evaluate(function() {
        var create = document.createElement;
        document.createElement = function(tag) {
            var elem = create.call(document, tag);
            if (tag === "audio") {
                elem.canPlayType = function() {
                    return "probably";
                };
            }
            return elem;
        };
    });

});

casper.on('resource.requested', function(resource) {
    this.echo("Requesting: "+JSON.stringify(resource));
});

casper.on('remote.message', function(msg) {
    this.echo("Remote says: " + msg);
});

casper.userAgent("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0")


casper.options.onResourceRequested = function(casper, requestData, request) {

    var accept = requestData.headers[0];
    //
    // if (accept.value.indexOf('text/css') !== -1) {
    //     casper.echo('Skipping CSS file: ' + requestData.url);
    //     request.abort();
    // }
    //

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

casper.options.waitTimeout = 60000 * 15;
casper.options.viewportSize = {
    width: 1366,
    height: 768
};

var stream = fs.open("./data/" + uniqueName + "-proxy-data.json", "aw");

casper.start("https://www.youtube.com/", function() {
    casper.wait(8000, function() {
        this.capture("youtube1.png");
        this.echo(this.getTitle());

    });
});

casper.waitForSelector('#masthead-search', function() {
    this.fill('#masthead-search', {
        'search_query': 'MAKE ENGLISH EASY Some',
    }, true);
});

<!-- wait until a form tag disappears -->
casper.waitForSelector('a.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.yt-uix-sessionlink.g-hovercard.spf-link', function() {
    this.capture("youtube2.png");
});

casper.then(function() {
    this.thenClick("a.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.yt-uix-sessionlink.g-hovercard.spf-link", function() {
        casper.waitForSelector("a.spf-link.branded-page-header-title-link.yt-uix-sessionlink", function() {
            casper.wait(15000, function() {
                this.capture("makeeasy.png");
                this.thenClick(".yt-uix-button-epic-nav-item");
            });
        });
    });
});

var links = [];

function getAllVideosLink() {
    var links = document.querySelectorAll('.yt-uix-tile-link');
    links = Array.prototype.map.call(links, function(link) {
        return link.getAttribute('href');
    });
    return links;
}

casper.waitForSelector("#channels-browse-content-grid", function() {
    links = this.evaluate(getAllVideosLink);
    casper.echo(JSON.stringify(links));
    casper.capture("videos.png");
});

var i = 0;
casper.then(function(){
    this.each(links,function(self,link){
        self.thenOpen("https://www.youtube.com"+link,function(a){
            this.echo(this.getCurrentUrl());
            this.wait(5000, function () {
              i++;
              this.capture("pic"+i+".png");
            });
        });
    });
});


casper.thenOpen("https://www.youtube.com/html5", function() {
    this.capture("html5.png");
});



casper.thenOpen("http://gimmeproxy.com/api/getProxy?get=true&supportsHttps=true&maxCheckPeriod=1000&country=IN", function() {
    var data = JSON.stringify(this.fetchText("pre"));
    this.echo(data);
    stream.writeLine(data);
});

casper.run(function() {
    this.exit();
});
