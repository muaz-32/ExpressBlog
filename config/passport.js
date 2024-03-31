const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require("./../dataModels/User.model");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return done(null, false, {
          message: "This email is not registered!",
        });
      } 
      else {
        if(user.oath==true){
          return done(null, false, {
            message: "This email is registered with google!",
          });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password Incorrect!" });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }

  passport.use('user', new LocalStrategy({ usernameField: 'email' }, authenticateUser)) 
  passport.serializeUser((user, done) =>{
    console.log(user);
    done(null, user.email);
  });
  passport.deserializeUser(async (email, done) => {
    try {
      console.log(email);
      const user = await User.findOne({ email: email });
      console.log(user)
      done(null, user);
    } 
    catch (err) {
      done(err, null);
    }
  });
}

module.exports = initialize