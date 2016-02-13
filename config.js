var fs = require('fs');

var config = {
	//packageInfo	: JSON.parse(fs.readFileSync('package.json')),

	hostname	: process.env.OPENSHIFT_NODEJS_IP 		|| '127.0.0.1',
	port		: process.env.OPENSHIFT_NODEJS_PORT 	|| 8080,
	dburl		: (process.env.OPENSHIFT_MONGODB_DB_URL	|| 'mongodb://localhost:27017/') + 'ey-gazette',
	//dataDir		: process.env.OPENSHIFT_DATA_DIR 		|| './data/',

	siteName	: '行政院公報查詢'
};

module.exports = config;
