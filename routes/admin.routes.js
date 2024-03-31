const express = require("express");
const router = express.Router();

const {
    postLogin,
    postRegister,
    getDashboard,
    getLogout,
} = require("../controllers/admin.controllers");
const { deletePost } = require("../controllers/post.controllers");

const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require("../middlewares/auth.middleware");

router.post("/adminlogin", postLogin);
router.post("/adminregister", postRegister);
router.get("/adminwelcome", ensureAuthenticated, ensureAdmin, getDashboard);
router.get("/adminlogout", getLogout);

router.delete("/post/:id", ensureAuthenticated, ensureAdmin, deletePost);

module.exports = router;