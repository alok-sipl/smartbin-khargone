/**
 * firebaseAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user over firebase
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = function firebaseNoAuth(req, res, next) {
    var firebaseAuth = sails.config.globals.firebaseAuth();
    firebaseAuth.auth().onAuthStateChanged(function (user) {
      if (user) {
        return res.redirect(sails.config.base_url + 'supplier');
      } else {
        return next();
      }
    })
};
