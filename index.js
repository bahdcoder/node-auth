const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expresssEdge = require('express-edge')
const expressSession = require('express-session')
const connectMongo = require('connect-mongo')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const MongoStore = connectMongo(expressSession)

const loginUser = require('./controllers/loginUser')
const registerUser = require('./controllers/registerUser')

const User = require('./database/models/User')

const app = express()
mongoose.connect("mongodb://localhost/auth")

app.use(expressSession({
  secret: 'secret',
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(expresssEdge)
app.set("views", `${__dirname}/pages`)

const auth = (req, res, next) => {
  if (req.session.user) {
    return next()
  }

  return res.redirect('/login')
}

const redirecIfAuth = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  return res.redirect("/home");
};


app.get('/login', redirecIfAuth, (req, res) => {
  res.render('login')
})

app.get("/logout", auth, (req, res) => {
  delete req.session.user

  res.redirect('/login')
});

app.get('/home', auth, (req, res) => {
  res.render('home', req.session.user)
})

app.get('/api/users', (req, res) => {
  User.find({}, (error, users) => {
    // const us = JSON.parse(JSON.stringify(users))
    // us.forEach(user => delete user.password)
    res.json(users)
  })
})

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10)
  User.create({ name, email, password: hashedPassword }, (error, user) => {
    const token = jwt.sign({ data: user }, "knsdnfasjkdndskjfnsdfosjouf9ewjdopjpewjdiedjeijdiejide");
    res.status(201).json({ token, user });
  });
})

app.get("/register", redirecIfAuth, (req, res) => {
  res.render("register")
})

app.post('/register', registerUser)
app.post("/login", loginUser);


app.listen(5000, () => console.log('Server working ...'))
