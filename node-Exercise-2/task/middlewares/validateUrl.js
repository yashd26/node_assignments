const url = require('url');
const { errorHandler } = require("../errorHandler");

function validateUrl(req, res, next) {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (!(pathname === '/data/all/' || pathname === '/data/fixed/' || (pathname.startsWith('/data/_id') && query && query.id))) {
        const err = { statusCode: 404, message: "can't find api" };
        errorHandler(err, req, res);
    }
}

module.exports = { validateUrl };
