/**
 * DriverController
 *
 * @description :: Server-side logic for managing drivers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var db = sails.config.globals.firebasedb();
var firebaseAuth = sails.config.globals.firebaseAuth();

module.exports = {
  /*
     * Name: index
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: show listing of the supplier
     * @param  int  $id
     */
  index: function (req, res) {
    return res.view('driver-listing', {
      'title': sails.config.title.driver_list
    });
  },


  /*
  * Name: driverlist
  * Created By: A-SIPL
  * Created Date: 20-dec-2017
  * Purpose: shpw grid with data
  * @param  req
  */
  driverlist: function (req, res) {
    /* country listing*/
    drivers = [];
    /* ward listing*/
    var ref = db.ref("areas/-L2sgNgUAhpYrq_4r1Ki");
    ref.once("value", function (areaSnapshot) {
      var areas = CountryService.snapshotToArray(areaSnapshot);
      areas = areas.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      var ref = db.ref("drivers");
      ref.once('value', function (snap) {
        var userJson = (Object.keys(snap).length) ? getDriverList(snap, areas) : {};
        return res.json({'rows': userJson});
      });
    });
  },

  /*
  * Name: add
  * Created By: A-SIPL
  * Created Date: 8-dec-2017
  * Purpose: add new supplier
  * @param  req
  */
  add: function (req, res) {
    var isFormError = false;
    var errors = driver = wards = {};
    /* Checking validation if form post */
    if (req.method == "POST") {
      errors = ValidationService.validate(req);
      if (Object.keys(errors).length) {
        /* wards listing*/
        var ref = db.ref("areas");
        ref.once("value", function (snapshot) {
          var areas = snapshot.val();
          return res.view('add-update-driver', {
            'title': sails.config.title.add_driver,
            'driver': driver,
            'areas': areas,
            'errors': errors,
            'req': req
          });
        }, function (errorObject) {
          return res.serverError(errorObject.code);
        });
      } else {
        var ref = db.ref("drivers");
        ref.orderByChild("mobile_number").equalTo(req.param('mobile_number')).once('value')
          .then(function (snapshot) {
            requestData = snapshot.val();
            if (requestData) {
              req.flash('flashMessage', '<div class="alert alert-danger">' + req.param('mobile_number') + sails.config.flash.mobile_number_already_exist + '</div>');
              return res.redirect(sails.config.base_url + 'driver/add');
            } else {
              var ref = db.ref("drivers");
              var data = {
                name: req.param('name'),
                mobile_number: req.param('mobile_number'),
                address: req.param('address'),
                area_id: req.param('area'),
                area_name: req.param('area_name'),
                is_deleted: false,
                created_date: Date.now(),
                modified_date: Date.now()
              }
              ref.push(data).then(function (snapshotData) {
                var driverId = snapshotData.getKey();
                var refBin = db.ref("bins");
                refBin.orderByChild("area_id").equalTo(req.param('area')).once('value')
                  .then(function (snapshot) {
                    var binDataTemp = [];
                    if (snapshot.val() == null || snapshot.val() == "null") {
                      req.flash('flashMessage', '<div class="alert alert-success">' + sails.config.flash.driver_add_success + '</div>');
                      return res.redirect(sails.config.base_url + 'driver');
                    }
                    else {
                      _.map(snapshot.val(), function (val, uid) {
                        val.uid = uid;
                        binDataTemp.push(val);
                      })
                      _.map(binDataTemp, function (val, index) {
                        var refTemp = db.ref("bins/" + val.uid)
                          .update({
                            'driver_id': driverId,
                            modified_date: Date.now()
                          })
                          .then(function () {
                            if (parseInt(index) == (binDataTemp.length - 1)) {
                              req.flash('flashMessage', '<div class="alert alert-success">' + sails.config.flash.driver_add_success + '</div>');
                              return res.redirect(sails.config.base_url + 'driver');
                            }
                          })
                          .catch(function (err) {
                            req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
                            return res.redirect(sails.config.base_url + 'driver');
                          });
                      });
                    }
                  }, function (error) {
                    req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.driver_add_error + '</div>');
                    return res.redirect(sails.config.base_url + 'driver');
                  })
              }, function (error) {
                req.flash('flashMessage', '<div class="alert alert-danger"' + sails.config.flash.driver_add_error +'</div>');
                return res.redirect(sails.config.base_url + 'driver');
              });
            }
          }).catch(function (err) {
          req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
          return res.redirect(sails.config.base_url + 'driver');
        });
      }
    } else {
      /* wards listing*/
      var ref = db.ref("areas/-L2sgNgUAhpYrq_4r1Ki");
      ref.once("value", function (snapshot) {
        var areas = CountryService.snapshotToArray(snapshot);
        areas = areas.sort(function (a, b) {
          var textA = a.name.toUpperCase();
          var textB = b.name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        return res.view('add-update-driver', {
          'title': sails.config.title.add_driver,
          'driver': driver,
          'areas': areas,
          'errors': errors,
          'req': req
        });
      }, function (errorObject) {
        return res.serverError(errorObject.code);
      });
    }
  },

  /*
     * Name: view
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: add new driver
     * @param  req
     */
  view: function (req, res) {
    /* city listing*/
    var ref = db.ref("areas/-L2sgNgUAhpYrq_4r1Ki");
    ref.once("value", function (snapshot) {
      var areas = CountryService.snapshotToArray(snapshot);
      areas = areas.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      /* driver detail */
      var ref = db.ref("drivers/" + req.params.id);
      ref.once("value", function (snapshot) {
        var driver = snapshot.val();
        if(driver != null){
          return res.view('view-driver', {
            title: sails.config.title.view_driver,
            'driver': driver,
            "areas": areas,
          });
        }else{
          req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
          return res.redirect(sails.config.base_url + 'driver');
        }
      }, function (errorObject) {
        return res.serverError(errorObject.code);
      });
    }, function (errorObject) {
      return res.serverError(errorObject.code);
    });
  },


  /*
     * Name: edit
     * Created By: A-SIPL
     * Created Date: 8-dec-2017
     * Purpose: add new driver
     * @param  req
     */
  edit: function (req, res) {
    var driver =  countries = errors = {};
    var isFormError = false;
    if (req.method == "POST") {
      errors = ValidationService.validate(req);
      if (Object.keys(errors).length) {
        /* city listing*/
        var ref = db.ref("areas/-L2sgNgUAhpYrq_4r1Ki");
        ref.once("value", function (snapshot) {
          var areas = CountryService.snapshotToArray(snapshot);
          areas = areas.sort(function (a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          });
          /* driver detail */
          var ref = db.ref("drivers/" + req.params.id);
          ref.once("value", function (snapshot) {
            var driver = snapshot.val();
            if(driver != null){
              return res.view('add-update-driver', {
                title: sails.config.title.edit_driver,
                'driver': driver,
                "areas": areas,
                "errors": errors
              });
            }else{
              req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
              return res.redirect(sails.config.base_url + 'driver');
            }
          }, function (errorObject) {
            return res.serverError(errorObject.code);
          });
        }, function (errorObject) {
          return res.serverError(errorObject.code);
        });
      } else {
        var ref = db.ref();
        db.ref('drivers/' + req.params.id)
          .update({
            'name': req.param('name'),
            'mobile_number': req.param('mobile_number'),
            'area_id': req.param('area'),
            'area_name': req.param('area_name'),
            'address': req.param('address'),
            modified_date: Date.now()

          })
          .then(function () {
            var driverId = req.params.id;
            var refBin = db.ref("bins");
            refBin.orderByChild("area_id").equalTo(req.param('area')).once('value')
              .then(function (snapshot) {
                var binDataTemp = [];
                if (snapshot.val() == null || snapshot.val() == "null") {
                  req.flash('flashMessage', '<div class="alert alert-success">' + sails.config.flash.driver_updated_success + '</div>');
                  return res.redirect(sails.config.base_url + 'driver');
                }
                else {
                  _.map(snapshot.val(), function (val, uid) {
                    val.uid = uid;
                    binDataTemp.push(val);
                  })
                  _.map(binDataTemp, function (val, index) {
                    var refTemp = db.ref("bins/" + val.uid)
                      .update({
                        'driver_id': driverId,
                        modified_date: Date.now()
                      })
                      .then(function () {
                        if (parseInt(index) == (binDataTemp.length - 1)) {
                          req.flash('flashMessage', '<div class="alert alert-success">' + sails.config.flash.driver_updated_success + '</div>');
                          return res.redirect(sails.config.base_url + 'driver');
                        }
                      })
                      .catch(function (err) {
                        req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
                        return res.redirect(sails.config.base_url + 'driver');
                      });
                  });
                }
              })
          })
          .catch(function (err) {
            req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.driver_updated_error + '</div>');
            return res.redirect(sails.config.base_url + 'driver/edit/' + req.params.id);
          });
      }
    } else {
      /* country listing*/
      var ref = db.ref("areas/-L2sgNgUAhpYrq_4r1Ki");
      ref.once("value", function (snapshot) {
        var areas = CountryService.snapshotToArray(snapshot);
        areas = areas.sort(function (a, b) {
          var textA = a.name.toUpperCase();
          var textB = b.name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        var ref = db.ref("drivers/" + req.params.id);
        ref.once("value", function (snapshot) {
          var driver = snapshot.val();
          if(driver != null){
            ref.once("value", function (snapshot) {
              var cities = snapshot.val();
              return res.view('add-update-driver', {
                title: sails.config.title.edit_driver,
                'driver': driver,
                "areas": areas,
                "errors": errors
              });
            }, function (errorObject) {
              return res.serverError(errorObject.code);
            });
          }else{
            req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
            return res.redirect(sails.config.base_url + 'driver');
          }
        }, function (errorObject) {
          return res.serverError(errorObject.code);
        });
      }, function (errorObject) {
        return res.serverError(errorObject.code);
      });
    }
  },

  /*
    * Name: updateStatus
    * Created By: A-SIPL
    * Created Date: 8-dec-2017
    * Purpose: add new supplier
    * @param  req
    */
  updateStatus: function (req, res) {
    var id = req.body.id;
    var status = req.body.is_active;
    if (id != '') {
      db.ref('/drivers/' + id)
        .update({
          'is_deleted': status
        })
        .then(function () {
          return res.json({'status': true, message: sails.config.flash.update_successfully});
        })
        .catch(function (err) {
          return res.json({'status': false, message: sails.config.flash.something_went_wronge});
        });
    } else {
      return res.json({'status': false, message: sails.config.flash.something_went_wronge});
    }
  }
};

/*
   * Name: getDriverList
   * Created By: A-SIPL
   * Created Date: 20-dec-2017
   * Purpose: sget the user grid dat
   * @param  req
   */
function getDriverList(snap, areas) {
  if (Object.keys(snap).length) {
    snap.forEach(function (childSnap) {
      driver = childSnap.val();
      updateUser = childSnap.val();
      //updateUser.area_name = area_name
      updateUser.user_id = childSnap.key;
      drivers.push(updateUser);
    });
    return drivers;
  } else {
    drivers = {}
    return drivers;
  }
}

