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

exports.emailValidation = (res, email) => {
    const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (!re.test(email)) {
        return res.status(500).json({
            data: null,
            message: 'Invalid email format'
        });
    }
};
