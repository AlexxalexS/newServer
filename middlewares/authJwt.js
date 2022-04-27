const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = "";
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    token = bearer[1]
  }


  if (!token) {
    return res.status(403).send({
      code: 403,
      error: {"error": "No token provided!"},
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        code: 401,
        error: {"error": err.toString()},
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        error: { "error": err.toString()},
        message: err
      });
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          return res.status(500).send({
            code: 500,
            error: { "error": err.toString()},
            message: err
          });
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(200).send({ message: "Require Admin Role!" });
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin
};
module.exports = authJwt;
