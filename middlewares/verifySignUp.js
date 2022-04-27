const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        error: { "error": err.toString()},
        message: err
      });
    }

    if (user) {
      res.status(400).send({
        code: 400,
        error: { "error": "Failed! Username is already in use!" },
        message: "Ошибка! Пользователь уже сущетвует"
      });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        return res.status(500).send({
          code: 500,
          error: { "error": err.toString()},
          message: err
        });
      }

      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).send({
          code: 400,
          error: { "error": `Failed! Role ${req.body.roles[i]} does not exist!` },
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
