const express = require('express');
const bodyparser = require('body-parser');
const createHandler = require('azure-function-express').createHandler;

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(require('./routes/getOrders'));

const server = app.listen(3000, function () {
	const port = server.address().port;
	console.log("App now running on port", port);
});

module.exports = createHandler(app);