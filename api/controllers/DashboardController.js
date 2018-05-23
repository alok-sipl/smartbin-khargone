/**
 * DashboardController
 *
 * @description :: Server-side logic for managing dashboards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var db = sails.config.globals.firebasedb();
var firebaseAuth = sails.config.globals.firebaseAuth();
var firebase = require("firebase");
var validator = require('validator');

module.exports = {
  /*
     * Name: index
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: dashboard of the user
     * @param  int  $id
     */
  index: function (req, res) {
    var wards = [];
    var drivers = [];
    var ref = db.ref("circlewards");
    ref.once("value", function (snapshotWards) {
      _.map(snapshotWards.val(), function (val, bin_key) {
        _.map(val, function (val2, ward_key) {
          val2.id = ward_key;
          wards.push(val2)
        });
      });
      wards.sort(function (a, b) {
        return a.name - b.name;
      })
      var ref = db.ref("drivers");
      ref.orderByChild('name').once("value", function (snapshot) {
        if (Object.keys(snapshot).length) {
          snapshot.forEach(function (childSnap) {
            bindetails = childSnap.val();
            bindetails.id = childSnap.key;
            drivers.push(bindetails);
          });
        }
        return res.view('dashboard', {
          title: sails.config.title.dashboard,
          wards: wards,
          drivers: drivers
        });

      }).catch(function (err) {
        req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
        return res.redirect('dashboard');
      });
    }).catch(function (err) {
      req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
      return res.redirect('dashboard');
    });
  },

  /*
     * Name: profile
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: update profile
     * @param  req
     */
  profile: function (req, res) {
    var errors = {};
    var user = {};
    var countries = {};
    var cities = {};
    /* Checking validation if form post */
    if (req.method == "POST") {
      errors = ValidationService.validate(req);
      if (Object.keys(errors).length) {
        /* user detail */
        var ref = db.ref("users/" + req.session.userid);
        ref.once("value", function (snapshot) {
          var user = snapshot.val();
          /* country listing*/
          var ref = db.ref("countries");
          ref.once("value", function (snapshot) {
            var countries = snapshot.val();
            /* city listing*/
            var ref = db.ref("cities");
            ref.once("value", function (snapshot) {
              var cities = snapshot.val();
              return res.view('profile', {
                'title': sails.config.title.edit_profile,
                'user': user, "countries": countries,
                'cities': cities,
                'errors': errors
              });
            }, function (errorObject) {
              return res.serverError(errorObject.code);
            });
          }, function (errorObject) {
            return res.serverError(errorObject.code);
          });
        }, function (errorObject) {
          return res.serverError(errorObject.code);
        });
      } else {
        var ref = db.ref();
        db.ref('users/' + req.session.userid)
          .update({
            'name': req.param('name'),
           }).then(function () {
          user = firebaseAuth.auth().currentUser;
        }).then(function () {
          user.updateProfile({
            displayName: req.param('name'),
            photoURL: sails.config.base_url + 'images/profile.png'
          });
          req.session.user.displayName = req.param('name');
          req.session.user.photoURL = sails.config.base_url + "images/profile.png";
        })
          .then(function () {
            req.flash('flashMessage', '<div class="alert alert-success">' + sails.config.flash.profile_update_success + '</div>');
            return res.redirect(sails.config.base_url + 'dashboard/profile');
          })
          .catch(function (err) {
            console.log("In error-->", err);
            req.flash('flashMessage', '<div class="alert alert-error">' + sails.config.flash.profile_update_error + '</div>');
            return res.redirect(sails.config.base_url + 'dashboard/profile');
          });
      }
    } else {
      /* user detail */
      if (req.session.userid !== undefined && req.session.userid) {
        var ref = db.ref("users/" + req.session.userid);
        ref.once("value", function (snapshot) {
          var user = snapshot.val();
          /* country listing*/
          var ref = db.ref("countries");
          ref.once("value", function (snapshot) {
            var countries = snapshot.val();
            /* city listing*/
            var ref = db.ref("cities");
            ref.once("value", function (snapshot) {
              var cities = snapshot.val();
              return res.view('profile', {
                'title': sails.config.title.edit_profile,
                'user': user, "countries": countries,
                'cities': cities,
                'errors': errors
              });
            }, function (errorObject) {
              return res.serverError(errorObject.code);
            });
          }, function (errorObject) {
            return res.serverError(errorObject.code);
          });
        }, function (errorObject) {
          return res.serverError(errorObject.code);
        });
      } else {
        return res.redirect(sails.config.base_url + 'login');
      }
    }

  },


  /*
   * Name: changePassword
   * Created By: A-SIPL
   * Created Date: 20-dec-2017
   * Purpose: chnage password of admin
   * @param  req
   */
  changePassword: function (req, res) {
    if (req.session.userid !== undefined && req.session.userid) {
      var errors = {};
      if (req.method == "POST") {
        errors = ValidationService.validate(req);
        if (Object.keys(errors).length) {
          return res.view('profile', {
            'title': sails.config.title.change_password,
            'user': user,
            'errors': errors
          });
        } else {

          var ref = db.ref("users/" + req.session.userid);
          ref.once("value", function (snapshot) {
            var user = snapshot.val();
            if (user != null) {
              if (user.password == req.param('new_password').trim()) {
                req.flash('flashMessage', '<div class="flash-message alert alert-warning">' + sails.config.flash.same_password_warning + '</div>');
                return res.redirect(sails.config.base_url + 'dashboard/changePassword');
              } else {
                var user = firebaseAuth.auth().currentUser;
                if (user) {
                  var credentials = firebaseAuth.auth.EmailAuthProvider.credential(
                    user.email,
                    req.param('current_password')
                  );
                  user.reauthenticateWithCredential(credentials).then(function () {
                    user.updatePassword(req.param('new_password').trim()).then(function () {
                      var ref = db.ref();
                      var status = (req.param('status') == "false" || req.param('status') == false) ? false : true;
                      db.ref('users/' + req.session.userid)
                        .update({
                          'password': req.param('new_password').trim()
                        })
                        .then(function () {
                          req.flash('flashMessage', '<div class="flash-message alert alert-success">' + sails.config.flash.password_change_success + '</div>');
                          return res.redirect(sails.config.base_url + 'dashboard/changePassword');
                        })
                        .catch(function (err) {
                          req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.password_change_error + '</div>');
                          return res.redirect(sails.config.base_url + 'dashboard/changePassword');
                        });
                    }).then(function () {
                      req.flash('flashMessage', '<div class="flash-message alert alert-success">' + sails.config.flash.password_change_success + '</div>');
                      return res.redirect(sails.config.base_url + 'dashboard/changePassword');
                    }).catch(function (error) {
                      req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.password_change_error + '</div>');
                      return res.redirect(sails.config.base_url + 'dashboard/changePassword');
                    });
                  }).catch(function (error) {
                    req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.old_password_unmatch + '</div>');
                    return res.redirect(sails.config.base_url + 'dashboard/changePassword');
                  });
                } else {
                  return res.redirect(sails.config.base_url + 'dashboard/changePassword');
                }
              }
            } else {
              req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.profile_update_error + '</div>');
              return res.redirect(sails.config.base_url + 'login');
            }
          }, function (errorObject) {
            return res.serverError(errorObject.code);
          });

        }
      } else {
        return res.view('change-password', {title: sails.config.title.change_password, "errors": errors});
      }
    } else {
      return res.redirect(sails.config.base_url + 'login');
    }
  },


  /*
     * Name: logout
     * Created By: A-SIPL
     * Created Date: 13-dec-2017
     * Purpose: for  logout the admin
     * @param  req
     */
  logout: function (req, res) {
    req.session.user = {};
    req.session.authenticated = false;
    req.session.destroy(function (err) {
      return res.redirect('/');
    });
  },
};

