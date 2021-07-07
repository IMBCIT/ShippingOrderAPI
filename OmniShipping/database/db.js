const sql = require('mssql')

// //Azure SQL DB
// const dbConfig = {
// 	user: 'apiadmin',
// 	password: 'OmniShipping!',
// 	server: 'omnishippingapi.database.windows.net',
// 	database: 'OmniShipping',
// 	requestTimeout: 999999999,
// 	options: {
// 		encrypt: true
// 	}
// };

const dbConfig = {
	user: 'apiadmin',
	password: 'OmniShipping!',
	server: 'servername',
	database: 'Live',
	options: {
		trustedConnection: true
	}
}

const connection = sql.connect(dbConfig, function (err) {
	if (err)
		throw err;
})

module.exports = connection;