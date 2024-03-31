const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Admin = require("./../dataModels/Admin.model");

function initialize(passport, getAdminByEmail, getAdminById) {
  const authenticateAdmin = async (email, password, done) => {
    Admin.findOne({ email: email })
    .then((admin) => {
      if (!admin) {
        return done(null, false, {
          message: "This email is not registered!",
        });
      } 
      else {
        bcrypt.compare(password, admin.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, admin);
          } else {
            return done(null, false, { message: "Password Incorrect!" });
          }
        });
      }
    })
  }

  passport.use('admin', new LocalStrategy({ usernameField: 'email' }, authenticateAdmin)) 
  passport.serializeUser((admin, done) =>{
    console.log(admin);
    done(null, admin.email);
  });
  passport.deserializeUser(async (email, done) => {
    try {
      console.log(email);
      const admin = await Admin.findOne({ email: email });
      console.log(admin)
      done(null, admin);
    } 
    catch (err) {
      done(err, null);
    }
  });
}

module.exports = initialize