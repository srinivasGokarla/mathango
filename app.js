const express = require('express');
const mongoose=require('mongoose');
const dotenv = require('dotenv')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const rateLimit = require('express-rate-limit');
const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');


const app = express();
const PORT = process.env.PORT||3000;
dotenv.config({ path: './config/config.env' })

//mongodb configuration
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Passport config
require('./config/passport')(passport)

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // Max requests per minute
  message: 'Too many requests, please try again later',
});

// Redis setup for rate limiting
// const redisClient = redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
// });
// const rateLimiter = new RateLimiterRedis({
//   storeClient: redisClient,
//   keyPrefix: 'middleware',
//   points: 5000, 
//   duration: 60, 
// });

// app.use((req, res, next) => {
//   rateLimiter.consume(req.ip)
//     .then(() => {
//       next();
//     })
//     .catch(() => {
//       res.status(429).send('Too Many Requests');
//     });
// });


// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(limiter);

// set view engine
app.set('view engine','ejs');

app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )

app.use(passport.initialize())
app.use(passport.session())


app.use(require("./routes/index"))
app.use('/auth', require('./routes/auth'))


app.listen(PORT,console.log(`listening at ${PORT}`))
