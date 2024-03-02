// import all the things we need  
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const secretKey = 'SecretKey';

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
