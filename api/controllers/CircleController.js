/**
 * DriverController
 *
 * @description :: Server-side logic for managing circles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var db = sails.config.globals.firebasedb();
 var firebaseAuth = sails.config.globals.firebaseAuth();

 module.exports = {

   /**
     * `VehicleController.create()`
     */
     create: function (req, res) {

       var ref = db.ref();
       var circle = ref.child("circles/-L2TxNe8boIvuTly8hdd ");
       var ward = [];
       ward.push('-L2KIB-k19hAD5ZQtPIx');
       ward.push('-L2KJ0fCuEMiUkKcRCmv');
       ward.push('-L2KJ0fCuEMiUkKcRCmv');
       ward.push('-L2KJ0fCuEMiUkKcRCmv');
       ward.push('-L2KJ0fCuEMiUkKcRCmv');
       var _newVehicle = {
        name: '1',
        ward: ward,
        is_deleted: false
      };
      circle.push(_newVehicle).then(function (_circle) {
       console.log("Circle created: " + JSON.stringify(_circle));
         //  return res.redirect("circle");
       }, function (error) {
        console.error("Error on createCircle");
        console.error(JSON.stringify(err));
      });

    },

     /*
  * Name: getCircleByCity
  * Created By: A-SIPL
  * Created Date: 15-jan-2018
  * Purpose: a get circle of the selected city
  * @param  type
  */
  getCircleByCity: function (req, res) {
     if(req.body.id) {
              var ref = db.ref("circles/" + req.body.id);
              ref.once("value", function (snapshot) {
                var circles = CountryService.snapshotToArray(snapshot);
                circles = circles.sort(function(a, b) {
                  var textA = parseInt(a.name);
                  var textB = parseInt(b.name);
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
        return res.json(circles);
      });
    }else{
      return res.json({});
    }
  }

  }