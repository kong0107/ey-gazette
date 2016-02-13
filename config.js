var fs = require('fs');

var config = {
	hostname	: process.env.OPENSHIFT_NODEJS_IP 		|| '127.0.0.1',
	port		: process.env.OPENSHIFT_NODEJS_PORT 	|| 8080,
	dburl		: (process.env.OPENSHIFT_MONGODB_DB_URL	|| 'mongodb://localhost:27017/') + 'ey-gazette',

	siteName	: '行政院公報查詢',
	ipp			: 10,
	distinctFields: [
		'Doc_Style_LName',
		'Doc_Style_SName',
		'Chapter',
		'PubGov',
		'PubGovName',
		'UndertakeGov',
		'Keyword',
		'Eng_Keyword',
		'Category',
		'Cake',
		'Service'
	]
};

module.exports = config;
