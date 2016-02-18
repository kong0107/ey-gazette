var config = require('../config.js');
var express = require('express');
var async = require('async');

var debug = require('debug')(__filename.substr(__dirname.length + 1));
var router = module.exports = express.Router();

router.get('/:q?', function(req, res, next) {
	var q = req.query.q || req.params.q || '';
	q = q.trim();
	if(!q) return res.redirect('/');
	res.locals.search = q;
	res.locals.pageTitle = '搜尋「' + q + '」的結果';

	var page = res.locals.page = parseInt(req.query.page, 10) || 1;
	var skip = (page - 1) * config.ipp;

	var re = new RegExp(q);
	var cursor = req.app.locals.db.collection('records').find({$or:[
		{'Doc_Style_LName': re},
		{'Doc_Style_SName': re},
		{'Chapter': re},
		{'PubGov': re},
		{'PubGovName': re},
		{'UndertakeGov': re},
		{'Officer_name': re},
		{'GazetteId': re},
		{'Title': re},
		{'TitleEnglish': re},
		{'ThemeSubject': re},
		{'Keyword': re},
		{'Eng_Keyword': re},
		{'Explain': re},
		{'Category': re},
		{'Cake': re},
		{'Service': re},
		{'HTMLContent': re}
	]});

	async.parallel({
		count: function(callback) {
			cursor.count(callback);
		},
		docs: function(callback) {
			cursor.sort({gazetteDate: -1}).skip(skip).limit(config.ipp).toArray(callback);
		}
	}, function(err, results) {
		if(err) return next(err);
		res.render('search', results);
	});
});
