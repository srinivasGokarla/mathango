﻿# mathango
# Google-Authentication-nodejs



## Google credentials 
First we have to get Google credentials .
To get credentials 'if don’t already have them '  go to [Google developer Console](https://console.developers.google.com/) 

>_1)create a new project 
>
>2)Select the project and click credentials and the select OAuth client ID
>
>3)Now Select Web Application in application type. 
>
>4)Input your app name or whatever else you like , in Authorized JavaScript origins add this line`http://localhost:3000 ` and in Authorized redirect URIs field add this line ` http://localhost:5000/auth/google/callback `  and the click to create . 
>
>5)Now copy your *Google client ID* and *Google client secret*_
[Help](https://developers.google.com/adwords/api/docs/guides/authentication)

## Lets Initialize the New Project

To initialize the new project you just need to create a new folder "App name" and open folder in visual studio (or any other IDE ) code or any other IDE and run the below code in command line
```javascript
 npm init  
```
Just fill the project name and any other detail or just skip. After the `package.json` file is generated .

## Structure of the project

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/k2tfjrkggumaoj2fwr2z.jpg)
As with the reference of the above image create folders and files leave node_modules package-lock and package-json as they generate automatically .

## Install Dependencies

These are the Dependencies we need to install for our project.
```
express
axios
ejs
connect-mongo
express-rate-limit
dotenv
express-session
jsonwebtoken
mongoose
passport
passport-google-oauth20
redis
```
Install Dependencies by write the below code in your terminal
```javascript
npm i ejs connect-mongo dotenv express-session mongoose passport passport-google-oauth20 redis axios express-rate-limit jsonwebtoken
```
## Setup App for run
To start the server automatically we just need to install Nodemon which restart server automatically when any change is detected
```javascript
npm i -D nodemon
```
Setup application for developer run and normal run. Just change the Script section with the below code in package.json.
```
"scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
```
## Start local server

To start our app for testing/developer just simply type the following command in the command line:

```javascript
npm run dev
```

#### The main work is start from there

You need to just put your google client id and secret in this file. And also the mongodb uri like(`mongodb://localhost:27017/`) if you are hosting mongodb from your system . if you are using [Mongodb Atlas](https://www.mongodb.com/cloud/atlas/) it like(`mongodb+srv://XXXX:XXXX@cluster0.obaan.mongodb.net/{DBNAME}?retryWrites=true&w=majority`)

file:`config/config.env`

```
PORT = 3000
MONGO_URI=mongodb+srv://XXXX:XXXX@cluster0.obaan.mongodb.net/{DBNAME}?retryWrites=true&w=majority
GOOGLE_CLIENT_ID = XXXXXXXXXX
GOOGLE_CLIENT_SECRET = XXXXXXXXXXXXXXXX
```

In my case we use Mongodb Atlas . you can refer [this](https://codeforgeek.com/mongodb-atlas-node-js/) for getting mongodb atlas URI . and refer [this](https://developers.google.com/adwords/api/docs/guides/authentication) for Google client id and secret if any problem occur .

## Application

Its time code our `app.js` file this is the main file and it will sit in the root of our website.
In this file we have to setup our server.

file:`app.js`

Import all the necessary modules. 

```javascript
const express = require('express');
const mongoose=require('mongoose');
const dotenv = require('dotenv')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
require('./config/passport')(passport)
```

Connect to mongodb and set express template.

```javascript
const app = express();
const PORT = process.env.PORT||3000;
dotenv.config({ path: './config/config.env' })

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
app.use(express.static('public'))
app.set('view engine','ejs');
```

Initialize middleware and setup database for storing sessions.

```javascript
app.use(express.urlencoded({extended:true}))
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )
  // Passport middleware
app.use(passport.initialize())
app.use(passport.session())
```

last part import routes

```javascript
app.use(require("./routes/index"))
app.use('/auth', require('./routes/auth'))

app.listen(PORT,console.log(`listening at ${PORT}`))
```

Now our `app.js` file is ready🎉🎉


## Routes

Now its time to code our routes
we are to code 2 routes files one`auth.js` for authentication and another one `index.js` for redirecting between pages
 Lets code out `auth.js` file .
 
file:`auth.js`

```javascript
//Importing required modules 
const express = require('express')
const passport = require('passport')
const router = express.Router()
```

send to google to do the authentication.
In scopes profile gets us their basic information including their name and email gets their emails.

```javascript

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))

```

Callback after google has authenticated the user.

```javascript
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const email = req.user.email;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
      console.log(token);
      res.redirect('/log')
    } catch(err) {
      
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);
```

For logout

```javascript
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
```

Now our `auth.js` file is ready🎉🎉


###### Before creating `index.js` file we have to create out middleware to ensure that the user is authenticated or not.
 
file:`middleware/auth.js`

```javascript
module.exports = {
  // if user is authenticated the redirected to next page else redirect to login page
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/')
    }
  },
  // if user is authenticated and going to login page then redirected to home page if not authenticated redirected to login page  .
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/log');
    }
  },
}

```

Now our middleware is ready lets code our next router `index.js`.

file:`routes/index.js`

```javascript

const router = require('express').Router()
//importing middleware
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get('/', ensureGuest ,(req, res) => {
    res.render('login')
  })

router.get("/log",ensureAuth, async(req,res)=>{
    res.render('index',{userinfo:req.user})
})
module.exports=router;
```

## Configure Passport's Google startegy

file:`config/passport.js`

```javascript
// import all the things we need  
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = function (passport) {

  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        
        const fullName = `${profile.name.givenName} ${profile.name.familyName}`;
    

        try {
          let user = await User.findOne({ googleId: profile.id });
  
          if (!user) {
           
              user = await User.create({
              googleId: profile.id,
              name: fullName,
              recentlyVisitedBoards: profile.recentlyVisitedBoards,
              avatar: profile.photos[0].value,
              email: profile.emails[0].value
            });
            user = await User.create(newUser)
          }
          done(null, user);
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  )

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
} 
```

## User model

Now its time to create our database model to user user data in database.

file:`models/User.js`

```javascript

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    recentlyVisitedBoards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);


```

file:`models/Board.js`

```javascript


const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Board', BoardSchema);



```

file:`models/Task.js`

```javascript



const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ["Unassigned", "In Development", "Pending Review", "Done"],
        default: "Unassigned"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deadline: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);



```
### Good news at that time all the routes,models,and middlewares are ready the only things is ready is out HTML(EJS) Pages.

## Login and main pages

Now its time to create our login page using bootstrap.

file:`views/login.ejs`

```javascript
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.0-2/css/all.min.css"
        integrity="sha256-46r060N2LrChLLb5zowXQ72/iKKNiw/lAmygmHExk/o=" crossorigin="anonymous" />
    <link rel="stylesheet" href="/css/style.css">
    <title>Login</title>
</head>

<body>
<div class="container login-container" >
        <img style="width: 10%; display: flex; justify-items: center;" src="https://user-images.githubusercontent.com/40141083/41202260-db389144-6cb5-11e8-9fa6-fbb5938da489.png"/>
        <h1>Welcome to KenBoard</h1>
        <div class="card" style="margin-top:100px;">
            
            <div class="card-content">
                <div class="section" style="text-align: center;">
                    <a href="/auth/google" class="btn blue darken-1">
                        <i class="fab fa-google left"></i> Log In With Google
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>

</html>
```

Lets Create Main page which appear after user login.

file:`views/index.ejs`

```javascript
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Done</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
</head>

<body>

    <!-- As a link -->
 <nav class="navbar navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="/"><img class="logo" src="<%= userinfo.avatar %>" alt=""> &nbsp; <%=
                    userinfo.name %></a>
            <a class="navbar-brand btn btn-danger btn-small" style="color: white;" href="/auth/logout">Logout</a>
        </div>
    </nav>


   

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW"
        crossorigin="anonymous"></script>
    <script src="ejs.min.js"></script>
</body>

</html>
```



#### 🎉🎉

#### Our  Google Authentication App is ready .

Now its your time to use that amazing Middleware `passport.js` Good Luck 😎🎶


Here is the demo. I use the above code in my project Todo app 







