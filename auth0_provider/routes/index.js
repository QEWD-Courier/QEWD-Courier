var express = require('express');
var router = express.Router();
var passport = require('passport');
var dotenv = require('dotenv');
var util = require('util');
var URL = require('url').URL;
var querystring = require('querystring');

dotenv.config();

// Perform the login, after login Auth0 will redirect to callback
router.get('/openid/auth', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'

// Perform session logout and redirect to homepage
router.get('/logout', (req, res) => {
  req.logout();
  var logoutURL = new URL(
    util.format('https://%s/logout', process.env.AUTH0_DOMAIN)
  );
  var searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: process.env.AUTH0_REDIRECT_URL
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
});

module.exports = router;
