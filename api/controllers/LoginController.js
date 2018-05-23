/**
 * LoginController
 *
 * @description :: Server-side logic for managing logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var validator = require('validator');
var firebase = require("firebase");
var db = sails.config.globals.firebasedb();
var firebaseAuth = sails.config.globals.firebaseAuth();

module.exports = {
  /*
     * Name: index
     * Created By: A-SIPL
     * Created Date: 14-dec-2017
     * Purpose: login page for admin
     */
  index: function (req, res) {
    if (!req.session.authenticated) {
      var errors = {};
      /* Checking validation if form post */
      if (req.method == "POST") {
        errors = ValidationService.validate(req);
        if (Object.keys(errors).length) {
          res.locals.layout = 'layout-login';
          return res.view('login', {title: sails.config.title.login, errors: errors});
        } else {
          firebaseAuth.auth().signInWithEmailAndPassword(req.param('email'), req.param('password'))
            .then(function (user) {
              var ref = db.ref("users").orderByChild('id').equalTo(user.uid);
              ref.once("value", function (snapshot) {
                var adminDetail = snapshot.val();
                var userKey = Object.keys(adminDetail)[0];
                if (adminDetail) {
                  if (adminDetail[userKey].is_admin != undefined && adminDetail[userKey].is_admin == true) {
                    req.session.authenticated = true;
                    req.session.user = user;
                    req.session.userid = (Object.keys(adminDetail)[0]) ? Object.keys(adminDetail)[0] : '';
                    return res.redirect(sails.config.base_url + 'dashboard');
                  } else {
                    req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + User.message.email_valid + '</div>');
                    return res.redirect(sails.config.base_url);
                  }
                } else {
                  req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
                  return res.redirect(sails.config.base_url);
                }
              }, function (errorObject) {
                return res.serverError(errorObject.code);
              });
            }).catch(function (error) {
            if (error.code == "auth/invalid-email") {
              req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + User.message.email_valid + '</div>');
            } else {
              req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.invalid_email_password + '</div>');
            }
            return res.redirect(sails.config.base_url + 'login');
          });
        }
      }
      if (req.method == "GET") {
        res.locals.layout = 'layout-login';
        return res.view('login', {title: sails.config.title.login, errors: errors});
      }
    } else {
      res.redirect('dashboard');
    }
  },

  /*
     * Name: forgotPassword
     * Created By: A-SIPL
     * Created Date: 24-jan-2018
     * Purpose: for generate password
     */
  forgotPassword: function (req, res) {
    var errors = {};
    if (req.method == "POST") {
      errors = ValidationService.validate(req);
      if (Object.keys(errors).length) {
        res.locals.layout = 'layout-login';
        return res.view('forgot-password', {
          errors: errors,
          title: sails.config.title.forgot_password
        });
      } else {
        firebase.auth().sendPasswordResetEmail(req.param('email').trim())
          .then(function () {
            req.flash('flashMessage', '<div class="flash-message alert alert-success">' + sails.config.flash.forgot_mail_send_success + '</div>');
            return res.redirect(sails.config.base_url + 'login');
          })
          .catch(function (error) {
            req.flash('flashMessage', '<div class="flash-message alert alert-danger">'+ error.message +'</div>');
            return res.redirect(sails.config.base_url + 'login/forgotPassword');
          })
      }
    } else {
      res.locals.layout = 'layout-login';
      return res.view('forgot-password', {
        errors: errors,
        title: sails.config.title.forgot_password
      });
    }
  },

  /*
     * Name: signUp
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: update profile
     * @param  req
     */
  signUp: function (req, res) {
    firebase.auth().createUserWithEmailAndPassword('smartbin@gmail.com', '123456')
      .then(function () {
        user = firebase.auth().currentUser;
      }).then(function () {
      user.updateProfile({
        displayName: 'Smart Bin',
      });
    }).then(function () {
      var ref = db.ref().child("users");
      var data = {
        email: 'smartbin@gmail.com',
        password: '123456',
        name: "Smart Bin",
        phone: "9713997998",
        id: user.uid,
        is_deleted: false,
        is_admin: true,
        created_at: Date.now(),
        modified_at: Date.now(),
      }
      console.log('Created');

      ref.push(data).then(function () {//use 'child' and 'set' combination to save data in your own generated key
        req.flash('flashMessage', '<div class="alert alert-success">Admin Created Successfully.</div>');
        return res.redirect(sails.config.base_url + 'login');
      }, function (error) {
        req.flash('flashMessage', '<div class="alert alert-danger">Error In Creating Admin.</div>');
        return res.redirect(sails.config.base_url + 'login');
      });
    })
      .catch(function (error) {
        console.log(error);
        console.log(error.code);
        console.log(error.message);
      });
  },


  /*
     * Name: signUp
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: update profile
     * @param  req
     */
  signUpMobileNumber: function (req, res) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      'size': 'invisible',
      'callback': function (response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
      }
    });

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    var recaptchaResponse = grecaptcha.getResponse(window.recaptchaWidgetId);
    var phoneNumber = '9754645195';
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(function (confirmationResult) {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
      }).catch(function (error) {
      // Error; SMS not sent
      // ...
    });
  },
};

