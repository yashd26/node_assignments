function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(statusCode);
    res.end(JSON.stringify({
        error: {
            message: err.message
        }
    }));
}

module.exports = { errorHandler };