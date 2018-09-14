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
    const token = jwt.sign({ data: user }, "secret");
    res.status(201).json({ token, user });
  });
})


const apiAuth = (req, res, next) => {
  const token = req.headers.token;
  
  
  try {
    const data = jwt.verify(token, 'secret')

    req.authUser = data;

    return next()
  } catch (e) {
    return res.status(401).json({ message: 'unauthenticated.' })
  }
}


app.get('/api/articles', apiAuth, (req, res) => {
  res.json({
    articles: [{
      id: 1,
      title: 'first title'
    }, {
        id: 2,
        title: 'second title'
      }]
  })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)

  // find user from database by email.
  User.findOne({ email }, (error, user) => {
    // if user
    if (user) {
      // compare password
      const passwordIsCorrect = bcrypt.compareSync(password, user.password);

      if (passwordIsCorrect) {
        const token = jwt.sign({ data: user }, "secret");
        return res.status(201).json({ token, user });
      } else {
        return res.json({ message: 'incorrect credentials' });
      }
    } else {
      return res.json({ message: 'incorrect credentials' });
    }
  });
})

app.get("/register", redirecIfAuth, (req, res) => {
  res.render("register")
})

app.post('/register', registerUser)
app.post("/login", loginUser);


app.listen(5000, () => console.log('Server working ...'))
