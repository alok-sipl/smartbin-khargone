/**
 * CityController
 *
 * @description :: Server-side logic for managing cities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var db = sails.config.globals.firebasedb();
 module.exports = {
  /**
   * CommentController.create()
   */
   index: function (req, res) {
    return res.view('city-listing', {title: sails.config.title.city_list});
  },


  /*
    * Name: cityList
    * Created By: A-SIPL
    * Created Date: 11-dec-2017
    * Purpose: get all city data
    * @param  type
    */
    cityList: function (req, res) {
      cities = [];
      countries = [];
      var ref = db.ref('countries');
      ref.once("value", function (snapshot) {
        countries = snapshot.val();
        console.log(countries);
        var ref = db.ref("cities");
        ref.once('value', function (snap) {
          console.log(snap.val());
          var cityJson     = (Object.keys(snap).length) ? getCityList(snap, countries) : {};
          return res.json({'rows':cityJson});
        });
      });
    },

  /*
    * Name: addCity
    * Created By: A-SIPL
    * Created Date: 9-dec-2017
    * Purpose: add new city location
    * @param  type
    */
    addCity: function (req, res) {
      async.waterfall([
        function (cb) {
          if (req.method == 'GET') {
            var country = {};
            var city = {};
            var ref = db.ref('countries');
            ref.once("value", function (snapshot) {
              country = snapshot.val();
              return res.view('add-update-city', {title: sails.config.title.add_city, 'country': country, type: req.params.id});
            });
          } else {
            var ref = db.ref();
            var postsRef = db.ref('countries/' + req.param('country'));
            postsRef.push({
              name: req.param('city'),
              is_deleted: 0
            });
            return res.redirect('city');
          }
        }
        ])
    },

  /*
    * Name: updateCity
    * Created By: A-SIPL
    * Created Date: 13-dec-2017
    * Purpose: add new city location
    * @param  type
    */
    updateCity: function (req, res) {
      async.waterfall([
        function(cb) {
          var ref = db.ref();
          var postsRef = ref.child("countries/-L0E-tknbeJKkXDSQHzr/");
          var newPostRef = postsRef.push();
          newPostRef.set({
            name: 'Alok ',
            is_deleted: 0,
          });
        }
        ])
    },


  /*
  * Name: addCity
  * Created By: A-SIPL
  * Created Date: 9-dec-2017
  * Purpose: add new city location
  * @param  type
  */
  addCountry: function (req, res) {
    var ref = db.ref();
    var cities = ref.child("countries");
    var newCities = cities.push();
    newCities.set({
      name: 'France',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'China',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'Spain',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'Singapore',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'Switzerland',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'Belgium',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'India',
      is_deleted: false
    });
    var newCities = cities.push();
    newCities.set({
      name: 'Japan',
      is_deleted: false
    });
  },


  /*
  * Name: addCity
  * Created By: A-SIPL
  * Created Date: 13-dec-2017
  * Purpose: add new city location
  * @param  type
  */
  addCities: function (req, res) {
    async.waterfall([
      function(cb) {
        var ref = db.ref();
        var cities = ref.child("cities");
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Indore',
          is_deleted: false
        });
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Mumbai',
          is_deleted: false
        });
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Delhi',
          is_deleted: false
        });
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Pune',
          is_deleted: false
        });
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Baroda',
          is_deleted: false
        });
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Raipur',
          is_deleted: false
        });
        var newCities = cities.push();
        newCities.set({
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Bhapal',
          is_deleted: false
        });
      }
      ])
},


  /*
  * Name: addSubCities
  * Created By: A-SIPL
  * Created Date: 13-dec-2017
  * Purpose: add new city location
  * @param  type
  */
  addSubCities: function (req, res) {
    async.waterfall([
      function(cb) {
        var ref = db.ref();
        var subcities = ref.child("subcities");
        var newSubCities = subcities.push();
        newSubCities.set({
          city_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Dewas',
          is_deleted: false
        });
        var newSubCities = subcities.push();
        newSubCities.set({
          city_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Ujjain',
          is_deleted: false
        });
        var newSubCities = subcities.push();
        newSubCities.set({
          city_id: "-L0xTMeRAbBDb1DZhwpc",
          name: 'Pithampur',
          is_deleted: false
        });
      }
      ])
  },


  /*
* Name: addLikes
* Created By: A-SIPL
* Created Date: 27-dec-2017
* Purpose: add likes on supplier
* @param  type
*/
addLikes: function (req, res) {
  var ref = db.ref();
  var likes = ref.child("likes");
  var newSubCities = likes.push();
  newSubCities.set({
    user_id: "-L0UbCoAiFk06mBEYfDZ",
    supplier_id: "-L12NuoTcIk4d7WfNa6k"
  });
  var newSubCities = likes.push();
  newSubCities.set({
    user_id: "-L0UbCoAiFk06mBEYfDZ",
    supplier_id: "-L12ON6YsFBFRd29plTr"
  });
  var newSubCities = likes.push();
  newSubCities.set({
    user_id: "-L0oJuC3wNmUAnuic-or",
    supplier_id: "-L12Qr3gWN1bqsLjis6S"
  });
  var newSubCities = likes.push();
  newSubCities.set({
    user_id: "-L11mL6iWoNEfcwGf3m4",
    supplier_id: "-L12NuoTcIk4d7WfNa6k"
  });
},

like: function (req, res) {
  db.ref('/users').orderByChild('name')
  .startAt('Alok')
  .endAt("Alok\uf8ff")
  .once('value')
  .then(function (snapshot) {
    console.log(snapshot.val());
  });
},


orderBy: function (req, res) {
  db.ref('/countries')
  .orderByChild("name")
  .limitToFirst(2)
  .once('value')
  .then(function (snapshot) {
    console.log(snapshot.val());
  });
},

count: function (req, res) {
  db.ref('/countries')
  .once('value')
  .then(function (snapshot) {
    console.log(snapshot.numChildren());
  });
},

  /*
  * Name: getCityByCountry
  * Created By: A-SIPL
  * Created Date: 18-dec-2017
  * Purpose: aget city of the selected country
  * @param  type
  */
  getCityByCountry: function (req, res) {
    if(req.body.id) {
      const ref = db.ref('cities');
      ref.orderByChild('country_id')
      .equalTo(req.body.id)
      .once("value",function (snapshot) {
        return res.json(snapshot.val());
      });
    }else{
      return res.json({});
    }
  },


  /*
  * Name: getCityByState
  * Created By: A-SIPL
  * Created Date: 18-dec-2017
  * Purpose: aget city of the selected country
  * @param  type
  */
  getCityByState: function (req, res) {
    if(req.body.id) {
      var ref = db.ref("cities/" + req.body.id);
      ref.once("value", function (snapshot) {
        var cities = CountryService.snapshotToArray(snapshot);
        cities = cities.sort(function(a, b) {
          var textA = a.name.toUpperCase();
          var textB = b.name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        return res.json(cities);
      });
    }else{
      return res.json({});
    }
  },


  /*
  * Name: getAreaByCity
  * Created By: A-SIPL
  * Created Date: 18-dec-2017
  * Purpose: aget city of the selected country
  * @param  type
  */
  getAreaByCity: function (req, res) {
    if(req.body.id) {
      const ref = db.ref('areas');
      ref.orderByChild('city_id')
      .equalTo(req.body.id)
      .once("value",function (snapshot) {
        return res.json(snapshot.val());
      });
    }else{
      return res.json({});
    }
  },


  /*
  * Name: addSubCities
  * Created By: A-SIPL
  * Created Date: 13-dec-2017
  * Purpose: add new city location
  * @param  type
  */
  addUser: function (req, res) {
    async.waterfall([
      function(cb) {
        var ref = db.ref();
        var subcities = ref.child("users");
        var newSubCities = subcities.push();
        newSubCities.push({
          account_number: "2234522586",
          area: 'Dewas',
          city_id: "-L0Ik_goeeUdNOKTJ_DB",
          country_id: "-L0E-tknbeJKkXDSQHzr",
          createdAt: 1512749459933,
          email: "abc@gmail.com",
          isOnline: true,
          name: "SS",
          password:"123456",
          phone:"99999922222"
        });
      }
      ])
  },


  /*
  * Name: addSupplier
  * Created By: A-SIPL
  * Created Date: 13-dec-2017
  * Purpose: add new city location
  * @param  type
  */
  addSupplier: function (req, res) {
    async.waterfall([
      function(cb) {
        var ref = db.ref();
        var subcities = ref.child("suppliers");
        subcities.push({
          account_number: "2234522586",
          area: 'Dewas',
          country_name: "India",
          city_name: "Indore",
          city_id: "-L0xTMeRAbBDb1DZhwpc",
          country_id: "-L0xTMeRAbBDb1DZhwpc",
          created_date: 1513774149199,
          modified_date: 1513774149199,
          company_name: "Himalay",
          email: "himalay@gmail.com",
          is_deleted: false,
          name: "Himalay",
          mobile_number:"9713997998"
        });
      }
      ])
  },


  /*
   * Name: view
   * Created By: A-SIPL
   * Created Date: 22-dec-2017
   * Purpose: show grid with data
   * @param  req
   */
   view: function (req, res) {
    /* cities detail */
    var errors = {};
    var ref = db.ref("cities");
    ref.once("value", function (snapshot) {
      var cities = snapshot.val();
      /* countries listing*/
      var ref = db.ref("countries");
      ref.once("value", function (snapshot) {
        var countries = snapshot.val();
        return res.view('location-listing', {
          title: sails.config.title.location_list,
          cityId : req.params.id,
          cities : cities,
          countries : countries
        });
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
   * Created Date: 22-dec-2017
   * Purpose: show grid with data
   * @param  req
   */
   edit:function(req, res){
    if (req.method == "POST") {
      errors = ValidationService.validate(req);
      if (Object.keys(errors).length) {
        isFormError = true;
        console.log("In error");
      } else {
        console.log("City id" , req.param('city_id'));
        var ref = db.ref();
        var usersRef  = ref.child('cities/'+ req.param('city_id'));
        usersRef.update({
          'country_id': req.param('country'),
          'is_deleted': req.param('status'),
          'name': req.param('city'),
        });
        return res.redirect('/city');
      }
    }else {
      var errors = {};
      var ref = db.ref("cities");
      ref.once("value", function (snapshot) {
        var cities = snapshot.val();
        /* city listing*/
        var ref = db.ref("countries");
        ref.once("value", function (snapshot) {
          var countries = snapshot.val();
          return res.view('view-edit-city', {
            title: sails.config.title.edit_city,
            'city': cities[req.params.id], 'cities': cities, countries: countries, errors: errors, isEdit: true,
          });
        }, function (errorObject) {
          return res.serverError(errorObject.code);
        });

      }, function (errorObject) {
        return res.serverError(errorObject.code);
      });
    }
  },


  /*
   * Name: editLocation
   * Created By: A-SIPL
   * Created Date: 27-dec-2017
   * Purpose: Edit location
   * @param  req
   */
   editLocation:function(req, res){
    if (req.method == "POST") {
      errors = ValidationService.validate(req);
      if (Object.keys(errors).length) {
        isFormError = true;
        console.log("In error");
      } else {
        console.log("City id" , req.param('city_id'));
        var ref = db.ref();
        var usersRef  = ref.child('cities/'+ req.param('city_id'));
        usersRef.update({
          'country_id': req.param('country'),
          'is_deleted': req.param('status'),
          'name': req.param('city'),
        });
        return res.redirect('/city');
      }
    }else {
      var errors = {};
      var ref = db.ref("subcities/" + req.params.id);
      ref.once("value", function (snapshot) {
        var subcities = snapshot.val();
        var ref = db.ref("cities");
        ref.once("value", function (snapshot) {
          var cities = snapshot.val();
          /* city listing*/
          var ref = db.ref("countries");
          ref.once("value", function (snapshot) {
            var countries = snapshot.val();
            return res.view('view-edit-location', {
              title: sails.config.title.edit_location,
              'subcities': subcities, 'cities': cities, countries: countries, errors: errors, isEdit: true,
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
    }
  },

  /*
   * Name: subCities
   * Created By: A-SIPL
   * Created Date: 22-dec-2017
   * Purpose: show grid with data
   * @param  req
   */
   subCity: function (req, res) {
    return res.view('subcity-listing', {title: sails.config.title.view_location});
  },


  /*
    * Name: cityList
    * Created By: A-SIPL
    * Created Date: 11-dec-2017
    * Purpose: get all city data
    * @param  type
    */
    subCityList: function (req, res) {
      subCities = [];
      cities = [];
      var cityId = (req.query.cityId != undefined) ? req.params.id : '';
      var ref = db.ref('cities/'+ req.query.cityId);
      ref.once("value", function (snapshot) {
        cities = snapshot.val();
        var ref = db.ref("subcities");
        ref.orderByChild("city_id").equalTo(req.query.cityId).once("value", function(snap) {
          var cityJson     = (Object.keys(snap).length) ? getSubCityList(snap, cities) : {};
          return res.json({'rows':cityJson});
        });
      });
    },

  /*
 * Name: updateStatus
 * Created By: A-SIPL
 * Created Date: 26-dec-2017
 * Purpose: Update status of city
 * @param  req
 */
 updateStatus: function (req, res) {
  var id = req.body.id;
  var status = req.body.is_active;
  if(id != ''){
    db.ref('/cities/' + id)
    .update({
      'is_deleted': status
    })
    .then(function () {
      return res.json({'status':true});
    })
    .catch(function (err) {
      res.json({'status':false, 'message': err});
    });
  }else{
    return res.json({'status':false, message: sails.config.flash.something_went_wronge});
  }
},
};



/*
   * Name: getUserList
   * Created By: A-SIPL
   * Created Date: 20-dec-2017
   * Purpose: sget the user grid dat
   * @param  req
   */
   function getCityList(snap, countries){
    cities ={}
   return cities;
  console.log(countries);
  if(Object.keys(snap).length){
    snap.forEach(function (childSnap) {
      city = childSnap.val();
      updateCity = city;
      country_id = childSnap.key;
      updateCity.city_id =  childSnap.key;
      console.log("call 724 line no , countries");
      console.log(countries);
      console.log("city == ");
      console.log(city);
      console.log("country_id == ");
      console.log(country_id);

      updateCity.country_name =  countries[country_id]['name'];
      cities.push(updateCity);
    });
    return cities;
  }else{
    cities ={}
    return cities;
  }
}



/*
   * Name: getSubCityList
   * Created By: A-SIPL
   * Created Date: 22-dec-2017
   * Purpose: sget the user grid data
   * @param  req
   */
   function getSubCityList(snap, cities){
    if(Object.keys(snap).length){
      snap.forEach(function (childSnap) {
        subCity = childSnap.val();
        updateSubCity = subCity;
        city_id = subCity.city_id;
        updateSubCity.city_id =  childSnap.key;
        updateSubCity.city_name =  cities['name'];
        subCities.push(updateSubCity);
      });
      return subCities;
    }else{
      subCities ={}
      return subCities;
    }
  }

