const url = require('url');

var urlFlipkart = "https://www.flipkart.com/clickedia-georgette-embroidered-self-design-semi-stitched-salwar-suit-dupatta-material/p/itmeg8gvamuttwcf?pid=FABEG8GVAVUKQSDE&srno=b_1_7&otracker=browse&lid=LSTFABEG8GVAVUKQSDEJBQ232";
var urlAmazon = "http://www.amazon.in/gp/product/B01EY44FQ2/ref=s9_acsd_al_bw_c_x_1_w?pf_rd_m=A1VBAL9TL5WCBF&pf_rd_s=merchandised-search-2&pf_rd_r=1HDE25JRHYV5QBHMS95C&pf_rd_r=1HDE25JRHYV5QBHMS95C&pf_rd_t=101&pf_rd_p=c23fc414-feaf-4785-bc68-a697619150cd&pf_rd_p=c23fc414-feaf-4785-bc68-a697619150cd&pf_rd_i=1375424031";
var urlSnapdeal = "https://www.snapdeal.com/product/micromax-q424-8gb-champagne/638922092366#bcrumbLabelId:175";
var urlMyntra = "http://www.myntra.com/sweaters/roadster/roadster-women-orange-solid-sweater/1321303/buy?src=search&uq=false&q=tn-sorbe-sweaters&p=1";
var urlEbay = "http://www.ebay.in/itm/Brand-New-Fully-Unlocked-Airtel-4G-LTE-WiFi-Huawei-Modem-Hotspot-for-all-GSM-SIM-/122270305005?hash=item1c77e0caed:g:aYsAAOSwx2dYHgHU";

var Task = require('../models/Task');
var User = require('../models/User');
var request = require("request");
var config = require('../config/main')[process.env.NODE_ENV || 'development'];


const helper = {
    getIdFromFlipkart: (link) => {
        if (link.indexOf('flipkart') == -1) {
            return null;
        }
        var parsed = url.parse(link, true, true);

        if (parsed.query.pid) {
            return String(parsed.query.pid)
        } else {
            return null;
        }
    },

    getIdFromAmazon: (link) => {
        if (link.indexOf('amazon') == -1) {
            return null;
        }
        var parsed = url.parse(link);

        var segs = parsed.pathname.split('/');
        if (segs.length >= 3) {
            return String(segs[3]);
        } else {
            return null;
        }
    },

    getIdFromSnapdeal: (link) => {
        if (link.indexOf('snapdeal') == -1) {
            return null;
        }
        var parsed = url.parse(link);
        var segs = parsed.pathname.split('/');

        if (segs.length >= 3 && segs[1] == 'product') {
            return String(segs[3]);
        } else {
            return null;
        }
    },

    getIdFromMyntra: (link) => {
        if (link.indexOf('myntra') == -1) {
            return null;
        }
        var parsed = url.parse(link);
        var segs = parsed.pathname.split('/');

        if (segs.length >= 3) {
            return String(segs[4]);
        } else {
            return null;
        }
    },

    getIdFromEbay: (link) => {
        if (link.indexOf('ebay') == -1) {
            return null;
        }
        var parsed = url.parse(link);
        var segs = parsed.pathname.split('/');

        if (segs.length >= 3) {
            return String(segs[3]);
        } else {
            return null;
        }
    },

    intelligentGuessId: (url) => {
        if (url.indexOf("flipkart") != -1) {
            return helper.getIdFromFlipkart(url);
        } else if (url.indexOf("amazon") != -1) {
            return helper.getIdFromAmazon(url);
        } else if (url.indexOf("ebay") != -1) {
            return helper.getIdFromEbay(url);
        } else if (url.indexOf("snapdeal") != -1) {
            return helper.getIdFromSnapdeal(url);
        } else if (url.indexOf("myntra") != -1) {
            return helper.getIdFromMyntra(url);
        } else {
            return null;
        }
    },

    sendNotification: (old, latest) => {
        Task.findOne({
            pid: old.pid
        }, function (err, docs) {
            if (err) {
                return console.log(err);
            }
            var uids = docs.addedBy;
            User.find({
                uid: {
                    $in: uids
                }
            }, "token", function (er, users) {
                if (er) {
                    return console.log(er);
                }
                var tokens = users.map(function (item) {
                    return item.token;
                });

                if (tokens.length == 0) {
                    return console.log("No People to notify");
                }

                var news = (old.price > latest.price) ? "decreased" : "increased";

                var title = "Now: Rs. " + latest.price + " in " + latest.merchant;

                var body = latest.merchant + ": Price of " + latest.name + " is " + news + " by Rs. " + Math.abs(old.price - latest.price);

                var options = {
                    method: 'POST',
                    url: 'https://fcm.googleapis.com/fcm/send',
                    headers: {
                        'content-type': 'application/json',
                        'authorization': config.fcmServerKey
                    },
                    body: {
                        notification: {
                            title: title,
                            body: body,
                            icon: '/android-chrome-192x192.png',
                            click_action: "http://localhost:3000"
                        },
                        registration_ids: tokens
                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    console.log(body);
                });

            });
        });
        console.log("I will send notification");
    }
};

module.exports = helper;
