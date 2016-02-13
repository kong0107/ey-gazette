var config = require('../config.js');
var express = require('express');

var debug = require('debug')(__filename.substr(__dirname.length + 1));
var router = module.exports = express.Router();

router.get('/', function(req, res) {
	res.redirect('/');
});

router.use(function(req, res) {
	res.status(404).jsonp({
		error: '404',
		message: 'Not Found'
	});
});
