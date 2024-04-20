const url = require('url');
const { handleFetchAllRecords, handleFetchFixedRecords, handleFetchRecordById } = require('./controller');
const { validateUrl } = require("./middlewares/validateUrl");

function handleRequest(req, res) {
    validateUrl(req, res);

    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === '/data/all/') {
        handleFetchAllRecords(req, res);
    }
    else if (pathname === '/data/fixed/') {
        handleFetchFixedRecords(req, res);
    }
    else if (pathname.startsWith('/data/_id') && query && query.id) {
        handleFetchRecordById(req, res);
    }
}

module.exports = { handleRequest };