const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Speakeasy = require("speakeasy");

exports.signup = (req, res) => {
    if (req.body.username === undefined || req.body.email === undefined || req.body.password === undefined) {
        res.status(422).send({message: "Заполните все обязательные поля"});
        return;
    }

    const user = new User({
        username: req.body.username.toString(),
        email: req.body.email.toString(),
        password: bcrypt.hashSync(req.body.password.toString(), 8)
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: {$in: req.body.roles}
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }

                    user.roles = roles.map(role => role._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }

                        res.send({
                            code: 201,
                            data: {
                                message: "Регистарция прошла успешно!"
                            }
                        });
                    });
                }
            );
        } else {
            Role.findOne({name: "user"}, (err, role) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }

                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }

                    res.send({
                        code: 201,
                        data: {
                            message: "Регистарция прошла успешно!"
                        }
                    });
                });
            });
        }
    });
};

exports.login = (req, res) => {
    if (req.body.username === undefined || req.body.password === undefined) {
        res.status(422).send({message: "Заполните все обязательные поля"});
        return;
    }

    User.findOne({
        $or: [
            { username: req.body.username },
            { email: req.body.username }
        ]
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                return res.status(500)
                    .send({
                        code: 500,
                        error: {"error": "Server Error"},
                        message: "Server Error"
                    });
            }

            if (!user) {
                return res.status(404)
                    .send({
                        code: 404,
                        error: {"error": "User Not found"},
                        message: "Пользователь не найден"
                    });
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password.toString(),
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401)
                    .send({
                        code: 401,
                        error: {"error": "Invalid Password!"},
                        message: "Не верный пароль!"
                });
            }

            let authorities = [];

            let token = jwt.sign({id: user.id}, config.secret);
            let secret = Speakeasy.generateSecret({length: 40}).base32;

            user.secret = secret
            user.save(err => {
                if (err) {
                    return res.status(500)
                        .send({
                            code: 500,
                            error: {"error": "Server Error"},
                            message: "Server Error"
                        });
                }

                // res.send({message: "User was registered successfully!"});
            });

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }

            res.status(200).send({
                code: 200,
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token,
                    secret: secret
                },
                message: "OK"
            });
        });
};
