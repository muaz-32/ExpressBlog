const Admin = require("../dataModels/Admin.model");

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(200).json({error: "You do not have access"})
  }
};

const ensureNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/welcome");
  } else {
    next();
  }
}

const ensureAdmin = (req, res, next) => {
  const email = req.user.email;
  const admin = Admin.findOne({ email: email });
  if (admin) {
    next();
  } else {
    res.status(200).json({error: "You do not have access"})
  }
}

module.exports = { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin };