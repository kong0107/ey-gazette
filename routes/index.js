var config = require('../config.js');
var express = require('express');
var async = require('async');

var router = module.exports = express.Router();
var model = {};

router.get('/', function(req, res) {
	res.render('index', model);
});
