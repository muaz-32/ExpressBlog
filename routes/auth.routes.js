const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    getDashboard,
    getLogout,
    googlelogin,
    googlecallback,
    googleredirect,
    googlefailure,
    forgotpassword,
    resetpassword,
    } = require("../controllers/auth.controllers");
const { ensureAuthenticated, ensureNotAuthenticated } = require("../middlewares/auth.middleware");

router.get("/", ensureNotAuthenticated, (req, res) => {
    res.send("Hello World!");
});

router.get("/login", ensureNotAuthenticated, getLogin);
router.post("/login", postLogin);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.get("/welcome", ensureAuthenticated, getDashboard);
router.get("/logout", getLogout);

router.get("/auth/google", googlelogin);
router.get("/auth/google/callback", googlecallback);
router.get("/googleredirect", googleredirect);
router.get("/googlefailure", googlefailure);

router.post('/forgotpassword', forgotpassword);
router.post('/resetpassword/:token', resetpassword);

module.exports = router;