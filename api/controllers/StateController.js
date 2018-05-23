/**
 * StateController
 *
 * @description :: Server-side logic for managing cities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var db = sails.config.globals.firebasedb();
 module.exports = {

   /**
     * `StateController.create()`
     */

     staticInsert: function (req, res) {
      var _newState = {
        name: "Madhya Pradesh",
        is_deleted: false
      };
     // db.ref(`/states/-L1pigYbq_ZQl009gBoU`)

     var ref = db.ref();
     var state = ref.child("states/-L1pigYbq_ZQl009gBoU");


     state.push(_newState).then(function (_state) {
       console.log("State created: " + JSON.stringify(_state));
       return res.redirect("state");
     }, function (error) {
      console.error("Error on createState");
      console.error(JSON.stringify(err));
      return res.view("state/new", {
        state: _newState,
        status: 'Error',
        statusDescription: err,
        title: 'Add a new state'
      });
    });
   },

   /**
     * `StateController.staticCityInsert()`
     */

     staticCityInsert: function (req, res) {
      var _newCity = {
        name: "Khargone",
        is_deleted: false
      };

      var ref = db.ref();
      var cities = ref.child("cities/-L2TwVAW-_j7JJ8nDMEI");

      cities.push(_newCity).then(function (_state) {
       console.log("State created: " + JSON.stringify(_state));
       return res.redirect("state");
     }, function (error) {
      console.error("Error on createState");
      console.error(JSON.stringify(err));
      
    });
    },

    create: function (req, res) {
      console.log("Inside create..............req.params = " + JSON.stringify(req.params.all()));
      var _newState = {
        name: req.param("name"),
        is_deleted: false
      };
      db.ref(`/users/${currentUser.uid}`)
      ref.push(_newState).then(function (_state) {
       console.log("State created: " + JSON.stringify(_state));
       return res.redirect("state");
     }, function (error) {
      console.error("Error on createState");
      console.error(JSON.stringify(err));
      return res.view("state/new", {
        state: _newState,
        status: 'Error',
        statusDescription: err,
        title: 'Add a new state'
      });
    });
    },

  /**
   * CommentController.create()
   */
   index: function (req, res) {
    return res.view('city-listing', {title: sails.config.title.city_list});
  }, 

  /*
  * Name: getStateByCountry
  * Created By: A-SIPL
  * Created Date: 18-dec-2017
  * Purpose: aget city of the selected country
  * @param  type
  */
  getStateByCountry: function (req, res) {
    if(req.body.id) {
              var ref = db.ref("states/" + req.body.id);
              ref.once("value", function (snapshot) {
                var states = CountryService.snapshotToArray(snapshot);
                states = states.sort(function(a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
              });
                return res.json(states);
      });
    }else{
      return res.json({});
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
    if(Object.keys(snap).length){
      snap.forEach(function (childSnap) {
        city = childSnap.val();
        updateCity = city;
        country_id = city.country_id;
      //console.log("id is-->", country_id);
      //console.log("Country id is-->", countries[country_id]['name']);
      updateCity.city_id =  childSnap.key;
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

