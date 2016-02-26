var express = require('express');

var debug = require('debug')(__filename.substr(__dirname.length + 1));
var router = module.exports = express.Router();

router.get('/:articleId', function(req, res, next) {
	req.app.locals.db.collection('records')
	.findOne({MetaId: req.params.articleId}, function(err, doc) {
		if(err || !doc) return next(err);
		res.locals.pageTitle = doc.Title;
		res.render('article', {doc: doc});
	});
});
