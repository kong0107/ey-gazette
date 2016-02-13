var config = require('../config.js');
var express = require('express');

var router = module.exports = express.Router();
var model = {};

router.get('/', function(req, res) {
	/*console.log(res.locals);
	res.render('index', model);*/
	var coll = req.app.locals.db.collection('records');
	coll.distinct('Chapter', function(err, docs) {
		model.data = docs;
		res.render('index', model);
	});
});
