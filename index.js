const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expresssEdge = require('express-edge')
const expressSession = require('express-session')

const loginUser = require('./controllers/loginUser')
const registerUser = require('./controllers/registerUser')

const app = express()

app.use(expressSession({
  secret: 'secret'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb://localhost/auth")

app.use(expresssEdge)
app.set("views", `${__dirname}/pages`)


app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/home', (req, res) => {
  res.render('home', req.session.user)
})

app.get("/register", (req, res) => {
  res.render("register")
})

app.post('/register', registerUser)
app.post("/login", loginUser);


app.listen(3457, () => console.log('Server working ...'))
