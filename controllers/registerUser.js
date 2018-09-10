const bcrypt = require('bcrypt')
const User = require("../database/models/User");

const registerUser = (req, res) => {
  // const name = req.body.name;
  // const email = req.body.email;
  // const password = req.body.password;
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10)
  User.create({ name, email, password: hashedPassword }, (error, user) => {
    res.redirect("/login");
  });
};

module.exports = registerUser;
