module.exports = {

	cityData: function (countryId, cityId) {
		return 'sipl'
	},

/*
     * Name: snapshotToArray
     * Created By: AG-SIPL
     * Created Date: 18-Jan-2018
     * Purpose: change order of object
     * @param  req
     */
     snapshotToArray: function(snapshot) {
     	var returnArr = [];
      if(snapshot != null){
        snapshot.forEach(function(childSnapshot) {
          var item = childSnapshot.val();
          item.key = childSnapshot.key;
          returnArr.push(item);
        });
      }
     	return returnArr;
     },



 }


