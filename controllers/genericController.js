const genericGet = (req, res, next) => {
	res.status(200).json("Stuff worked");
};

module.exports = genericGet;
