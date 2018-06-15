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
