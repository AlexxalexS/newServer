const Speakeasy = require("speakeasy");

exports.generateSecret = (req, res) => {
    const secret = Speakeasy.generateSecret({length: 40});
    res.send({"secret": secret.base32});
};

exports.generateTotp = (req, res) => {
    res.send({
        "token": Speakeasy.totp({
            secret: req.body.secret,
            encoding: "base32"
        }),
        "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
    });
};

exports.totpVerify = (req, res) => {
    res.send({
        "valid": Speakeasy.totp.verify({
            secret: req.body.secret,
            encoding: "base32",
            token: req.body.token,
            window: 0
        })
    });
};


