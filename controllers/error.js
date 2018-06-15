exports.authErrorResponse = (res, message) => {
    return res.status(401).json({
        data: null,
        message: message
    });
};

exports.errorResponse = (res, err) => {
    return res.status(500).json({
        data: null,
        error: err
    });
};
