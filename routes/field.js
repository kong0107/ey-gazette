var config = require('../config.js');
var express = require('express');

var debug = require('debug')(__filename.substr(__dirname.length + 1));
var router = module.exports = express.Router();

router.get('/', function(req, res) {
	res.render('field', {
		distinctFields: config.distinctFields
	});
});

router.get('/:field/:value?/:page?',
	function(req, res, next) {
		var fields = req.app.locals.fields;
		var field = res.locals.field = req.params.field;
		if(config.distinctFields.indexOf(field) == -1) return next('route');
		if(req.params.value) return next();
		res.locals.pageTitle = fields[field].title;
		res.render('field-field', {
			fieldOptions: fields[field].options
		});
	},
	function(req, res) {
		var fieldValue = res.locals.fieldValue = req.params.value;
		var page = res.locals.page = parseInt(req.params.page, 10) || 1;
		var skip = (page - 1) * config.ipp;
		var query = {};
		query[req.params.field] = fieldValue;
		
		debug('Page: ' + page);

		req.app.locals.db.collection('records')
		.find(query).sort({gazetteDate: -1}).skip(skip).limit(config.ipp)
		.toArray(function(err, docs) {
			if(err) return next(err);
			res.render('field-field-value', {docs: docs});
		});
	}
);
