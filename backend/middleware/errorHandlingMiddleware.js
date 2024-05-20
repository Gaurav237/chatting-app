
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode || 500;
    // sending an error response to the client
    res.status(statusCode).json({
        message: err.message
    });
}

module.exports = {
    notFound,
    errorHandler
}