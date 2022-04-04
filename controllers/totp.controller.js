const Speakeasy = require("speakeasy");
const db = require("../models");
const User = db.user;

exports.totpVerify = (req, res) => {
    console.log(req.body.id)
    User.findOne({
        _id: req.body.id
    })
        .exec((err, user) => {
            if (err) {
                return res.status(500)
                    .send({
                        code: 500,
                        error: {"error": "Server Error"},
                        message: "Server Error"
                    });
            }
            console.log(user)
            let isValid = Speakeasy.totp.verify({
                secret: user.secret,
                encoding: "base32",
                token: req.body.token,
                window: 0
            })
            res.send({
                "valid": isValid
            });
        });
};

exports.generateSecret = (req, res) => {
    const secret = Speakeasy.generateSecret({length: 40});
    res.send({"secret": secret.base32});
};

exports.generateTotp = (req, res) => {
    res.send({
        code: 200,
        data: {
            "token": Speakeasy.totp({
                secret: req.body.secret,
                encoding: "base32"
            }),
            "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
        }

    });
};



