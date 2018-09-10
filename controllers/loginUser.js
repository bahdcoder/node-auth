const bcrypt = require("bcrypt");
const User = require("../database/models/User");

const loginUser = (req, res) => {
  const { email, password } = req.body;

  // find user from database by email.
  User.findOne({ email }, (error, user) => {
    // if user
    if (user) {
      // compare password
      const passwordIsCorrect = bcrypt.compareSync(password, user.password);

      if (passwordIsCorrect) {
        req.session.user = user;

        return res.redirect('/home');
      } else {
        console.log('wrong password')
        return res.redirect("/login");
      }
    } else {
      console.log('no user')
      return res.redirect("/login");
    }
  });
};

module.exports = loginUser;
