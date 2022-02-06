const {authJwt} = require("../middlewares");
const controller = require("../controllers/totp.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/totp/secret",
        [authJwt.verifyToken],
        controller.generateSecret
    );

    app.post(
        "/api/totp/generate",
        [authJwt.verifyToken],
        controller.generateTotp
    );

    app.post(
        "/api/totp/validate",
        [authJwt.verifyToken],
        controller.totpVerify
    );
}

/*
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
      "/api/test/all",
      controller.allAccess
  );

  app.get(
      "/api/test/user",
      [authJwt.verifyToken],
      controller.userContent
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminContent
  );
};

 */