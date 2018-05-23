/**
 * WardController
 *
 * @description :: Server-side logic for managing drivers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var db = sails.config.globals.firebasedb();
 var firebaseAuth = sails.config.globals.firebaseAuth();

 module.exports = {

   /**
     * `WardController.create()`
     */
     create: function (req, res) {
      var ref = db.ref("wards");

      var _newWard = {
        name : "1",
        is_deleted : false,
        created_date : 1515232076118,
        modified_date : 1515232076118
      }


      ref.push(_newWard).then(function (_ward) {
       console.log("Ward created: " + JSON.stringify(_ward));
      // return res.redirect("ward");
    }, function (error) {
      console.error("Error on createWard");
      console.error(JSON.stringify(err));
    });
    },

   /**
     * `WardController.create()`
     */
     createCircleWard: function (req, res) {
      var ref = db.ref();

      var _newWard = {
        name: "32",
        is_deleted: false
      };

     var ref = db.ref();
     var circlewards = ref.child("circlewards/-L2e7fEvmHHh7Pj4R30f");

     circlewards.push(_newWard).then(function (_circlewards) {
       console.log("State created: " + JSON.stringify(_circlewards));
       return res.redirect("circlewards");
     }, function (error) {
      console.error("Error on createState");
      console.error(JSON.stringify(err));
      return res.view("circlewards/new", {
        circlewards: _newWard,
        status: 'Error',
        statusDescription: err,
        title: 'Add a new circlewards'
      });
    });

   },

         /*
  * Name: getWardByCircle
  * Created By: A-SIPL
  * Created Date: 15-jan-2018
  * Purpose: a get ward of the selected circle
  * @param  type
  */
  getWardByCircle: function (req, res) {
    if(req.body.id) {
      console.log("circlewards/" + req.body.id);
              var ref = db.ref("circlewards/" + req.body.id);
              ref.once("value", function (snapshot) {
                console.log('response', snapshot.val());
                var wards = CountryService.snapshotToArray(snapshot);
                wards = wards.sort(function(a, b) {
                  var textA = parseInt(a.name);
                  var textB = parseInt(b.name);
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
        return res.json(wards);
      });
    }else{
      return res.json({});
    }
  },

 }