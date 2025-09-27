const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
	const statusCode = res.statusCode ? res.statusCode : 500;
	console.log("header sent: " + res.headersSent);
	switch (statusCode) {
		case constants.VALIDATION_ERROR: {
			res.json({ error: "Invalid data", message: err.message });
			break;
		}
		case constants.UNAUTHORIZED: {
			res.json({ error: "Not authorized", message: err.message });
			break;
		}
		case constants.FORBIDDEN: {
			res.json({ error: "Forbidden", message: err.message });
			break;
		}
		case constants.NOT_FOUND: {
			res.json({ error: "Not found", message: err.message });
			break;
		}
		case constants.SERVER_ERROR: {
			res.json({ error: "Server error", message: err.message });
			break;
		}
		default: {
			console.log("Unhandled error");
			console.log(res.statusCode, err.stackTrace, err.message);
			res.json({ error: "Unknown error", message: err.message });
			break;
		}
	}
};

module.exports = errorHandler;
