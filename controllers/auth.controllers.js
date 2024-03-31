const User = require("../dataModels/User.model");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
// require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'muazul14@gmail.com',
    pass: 'dnucaxkwyhblkeqk '
  }
});

const JWT_RESET_PASSWORD = '4cb74aeae8d3ba63e781963642ae6610ec5ae6f8469219446c893d96935ac2e9';
const CLIENT_URL = 'http://localhost:3000';

const getLogin = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "login.html");
  res.sendFile(filePath);
};

const postLogin = (req, res, next) => {
  passport.authenticate("user", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};


const getRegister = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "register.html");
  res.sendFile(filePath);
};

const postRegister = async (req, res, next) => {
  const {  email, password } = req.body;
  const name= req.body.username

  const errors=[]
  if (!name || !email || !password ) {
    errors.push("All fields are required!");
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors });
  } else {
    //Create New User
    User.findOne({ email: email }).then((user) => {
      if (user) {
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
                const newUser = new User({
                  name,
                  email,
                  oath: false,
                  password: hash,
                });
                newUser
                  .save()
                  .then(() => {
                    res.redirect("/login");
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

const getLogout = async (req, res) => {
  req.logout((err) => {
    if (err) {
      res.json({ error: err });
    } else res.redirect("/");
  });
}


const googlelogin = passport.authenticate("google", {
  scope: ["email", "profile"]
});

const googlecallback = passport.authenticate("google", {
  successRedirect: "/googleredirect",
  failureRedirect: "/goooglefailure",
  failureFlash: true
});

const googleredirect = (req, res) => {  
  console.log(req.user);
  const email = req.user.email;
  const fname = req.user.name.givenName;
  const lname = req.user.name.familyName;
  const name = fname + " " + lname;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.redirect("/welcome");
      } 
      else {
        const newUser = new User({
          name,
          email,
          oath: true,
        });
        newUser
          .save()
          .then(() => {
            res.redirect("/welcome");
          })
          .catch(() => {
            res.send("Please try again");
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const googlefailure = (req, res) => {
  res.send("failed to authenticate..");
};

const forgotpassword = (req, res) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.send("This email is not registered!");
      } 
      else if(user.oath==true){
        res.send("This email is registered with google!");
      }
      else {
        console.log(JWT_RESET_PASSWORD);
        const token = jwt.sign({ _id: user._id }, JWT_RESET_PASSWORD, { expiresIn: '20m' });
        const data = {
          from: '',
          to: email,
          subject: 'Reset Password',
          html: `
            <h2>Please click on given link to reset your password</h2>
            <p>${CLIENT_URL}/resetpassword/${token}</p>
          `
        };

        transporter.sendMail(data, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            res.send("Email sent successfully");
          }
        });
      }
    }
    )
    .catch((err) => {
      console.log(err);
    });
};

const resetpassword = (req, res) => {
  const token = req.params.token;
  const { password, confirmpassword } = req.body;
  const errors = [];
  if (!password || !confirmpassword) {
    errors.push("All fields are required!");
  }
  if (password !== confirmpassword) {
    errors.push("Passwords do not match!");
  }
  if (errors.length > 0) {
    res.status(400).json({ error: errors });
  } else {
    jwt.verify(token, JWT_RESET_PASSWORD, (err, decodedData) => {
      if (err) {
        res.status(401).json({ error: "Incorrect token or it is expired" });
      } else {
        User.findOne({ _id: decodedData._id })
          .then((user) => {
            if (!user) {
              res.status(404).json({ error: "User not found!" });
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                  res.status(400).json({ error: err });
                } else {
                  bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                      res.status(400).json({ error: err });
                    } else {
                      user.password = hash;
                      user.save()
                        .then(() => {
                          res.redirect("/login");
                        })
                        .catch(() => {
                          res.status(400).json({ error: "Failed to reset password" });
                        });
                    }
                  });
                }
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
}

module.exports = {
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
};
