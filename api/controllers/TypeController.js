/**
 * TypesController
 *
 * @description :: Server-side logic for managing types
 */
 var db = sails.config.globals.firebasedb();
 var firebaseAuth = sails.config.globals.firebaseAuth();
 var ref = db.ref("types");

 module.exports = {

  /**
     * `TypesController.create()`
     */
     wards: function (req, res) {
        console.log("call wards");
     var ref = db.ref("circlewards");
       ref.once("value", function (snapshotWards) {
         var wards = [];
         _.map(snapshotWards.val(),function (val, bin_key){
            //val.bin_key = bin_key;
            _.map(val,function (val2){
            wards.push(val2)
        });
        });
        console.log("wards");
        console.log(wards);
      });
   },

    /**
     * `TypesController.create()`
     */
     create: function (req, res) {
       var _newTypes = {
            name: "Type 2",
            is_deleted: false
        };
        ref.push(_newTypes).then(function (_types) {
           console.log("Types created: " + JSON.stringify(_types));
           return res.redirect("types");
       }, function (error) {
        console.error("Error on createTypes");
        console.error(JSON.stringify(err));
        return res.view("types/new", {
            types: _newTypes,
            status: 'Error',
            statusDescription: err,
            title: 'Add a new types'
        });
    });
    }
}
