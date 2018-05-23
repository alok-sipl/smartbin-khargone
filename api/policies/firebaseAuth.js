// /**
//  * firebaseAuth
//  *
//  * @module      :: Policy
//  * @description :: Simple policy to allow any authenticated user over firebase
//  *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
//  * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
//  *
//  */
//
// module.exports = function firebaseAuth(req, res, next) {
//   var firebaseAuth = sails.config.globals.firebaseAuth();
//   firebaseAuth.auth().onAuthStateChanged(function (user) {
//     if (user) {
//       sails.config.globals.userDetail = {
//         "name": user.displayName,
//         "email": user.email,
//         "image": user.photoURL,
//         "id": user.uid,
//       };
//       return next();
//     } else {
//       sails.config.globals.userDetail = {}
//       return res.redirect(sails.config.base_url + 'login');
//     }
//   })
// };



module.exports = function(req, res,next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.session.authenticated) {
    return next();
  }else{
    req.session.flash = {
      flashMessage:'<div class="alert alert-danger">Please login.</div>'
    }
    res.redirect(sails.config.base_url);
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};
