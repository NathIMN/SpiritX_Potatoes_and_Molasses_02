const notFound = (req, res) => res.redirect(302, "/error-page");

module.exports = notFound;