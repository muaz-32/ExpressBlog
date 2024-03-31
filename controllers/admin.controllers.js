const Admin = require("../dataModels/Admin.model");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");

const postLogin = (req, res, next) => {
    passport.authenticate("admin", {
      successRedirect: "/adminwelcome",
      failureRedirect: "/",
      failureFlash: true,
    })(req, res, next);
};
  
const ADMIN_KEY = 'newkey';

const postRegister = async (req, res, next) => {
    const { key } = req.body;
    const {  email, password } = req.body;
    const name= req.body.username
  
    const errors=[]
    if (!name || !email || !password ) {
      errors.push("All fields are required!");
    }
  
    if (errors.length > 0) {
      res.status(400).json({ error: errors });
    } 
    else {
      if(key !== ADMIN_KEY){
        errors.push("Invalid key");
        res.status(400).json({ error: errors });
      }
      Admin.findOne({ email: email }).then((admin) => {
        if (admin) {
          errors.push("User already exists with this email!");
          res.status(400).json({ error: errors });
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              errors.push(err);
              res.status(400).json({ error: errors });
            } else {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                  errors.push(err);
                  res.status(400).json({ error: errors });
                } else {
                  const newAdmin = new Admin({
                    name,
                    email,
                    password: hash,
                  });
                  newAdmin
                    .save()
                    .then(() => {
                      res.redirect("/");
                    })
                    .catch(() => {
                      errors.push("Please try again");
                      res.status(400).json({ error: errors });
                    });
                }
              });
            }
          });
        }
      });
    }
  };
  
const getDashboard = async (req, res) => {
    const filePath = path.join(__dirname, "..", "views", "homePage.html");
    res.sendFile(filePath);
}

const getLogout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
    });
    res.redirect("/");
};

module.exports = {
    postLogin,
    postRegister,
    getDashboard,
    getLogout,
};