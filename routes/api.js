var express = require('express');
var router = express.Router();
var execFile = require('child_process').execFile;
var Task = require('../models/Task');
var Product = require('../models/Product');
var User = require('../models/User');

var grabber = require('../utils/grabber');
var helper = require('../utils/helper');


/* GET users listing. */
router.get('/', function(req, res) {
    res.json({
        status: "success",
        messgae: "Working Fine"
    });
});

module.exports = router;
