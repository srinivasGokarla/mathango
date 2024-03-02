const express = require('express')
const passport = require('passport')
const router = express.Router();
const jwt = require("jsonwebtoken");
const secretKey = 'SecretKey';
const tokenBlacklist = new Set();
const User = require('../models/User')


router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))


router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const email = req.user.email;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      //create a jwt token for the user
      const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
      console.log(token);
      res.redirect('/log')
      //res.status(200).json({ token });
    } catch(err) {
      
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/logout', (req, res) => {

  req.logout()
  res.redirect('/')

})

module.exports = router
