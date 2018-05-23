exports.mailConfig = {
    host: process.env.emailHost,
    port: 587,
    secure: false,
    auth: {
        user: process.env.email,
        pass: process.env.emailPassword
    },
    tls: {
        rejectUnauthorized: false
    }
};

exports.matchPasswords = (res, password, repeatPassword) => {
    if (password !== repeatPassword) {
        res.status(500).json({
            data: null,
            message: 'Passwords must match'
        });
        return false;
    }
    return true;
};

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
