/**
 * CountryController
 *
 * @description :: Server-side logic for managing countries
 */
 var db = sails.config.globals.firebasedb();
 var firebaseAuth = sails.config.globals.firebaseAuth();
 var ref = db.ref("countries");

 module.exports = {
    /**
     * `CountryController.create()`
     */
     create: function (req, res) {
        console.log("Inside create..............req.params = " + JSON.stringify(req.params.all()));
        var _newCountry = {
            name: req.param("name"),
            is_deleted: false
        };
        ref.push(_newCountry).then(function (_country) {
           console.log("Country created: " + JSON.stringify(_country));
           return res.redirect("country");
       }, function (error) {
        console.error("Error on createCountry");
        console.error(JSON.stringify(err));
        return res.view("country/new", {
            country: _newCountry,
            status: 'Error',
            statusDescription: err,
            title: 'Add a new country'
        });
    });
    },
    /**
     * `CountryController.update()`
     */
     update: function (req, res) {
        console.log("Inside update..............");
        var ref = db.ref();

        return  db.ref('countries/' + req.params.id)
        .update({
            name: req.param("name")
        }).then(function (_country) {
            return res.redirect("country");
        }).catch(function (err) {
            console.error("Error on CountryService.updateCountry");
            console.error(err);
            return Country.find().where({pid: req.param("id")}).then(function (_country) {
                if (_country && _country.length > 0) {
                    return res.view("country/edit", {
                        country: _country[0],
                        status: 'Error',
                        errorType: 'validation-error',
                        statusDescription: err,
                        title: 'Country Details'
                    });
                } else {
                    return res.view('500', {message: "Sorry, no Country found with pid - " + req.param("pid")});
                }
            }).catch(function (err) {
                return res.view('500', {message: "Sorry, no Country found with pid - " + req.param("pid")});
            });
        });

    },
    /**
     * `CountryController.delete()`
     */
     delete: function (req, res) {
        console.log("Inside delete..............");

        return Country.find().where({pid: req.param("pid")}).then(function (_country) {
            if (_country && _country.length > 0) {

                _country[0].destroy().then(function (_country) {
                    console.log("Deleted successfully!!! _country = " + _country);
                    return res.redirect("country");
                }).catch(function (err) {
                    console.error(err);
                    return res.redirect("country");
                });
            } else {
                return res.view('500', {message: "Sorry, no Country found with pid - " + req.param("pid")});
            }
        }).catch(function (err) {
            return res.view('500', {message: "Sorry, no Country found with pid - " + req.param("pid")});
        });


    },
    /**
     * `CountryController.find()`
     */
     find: function (req, res) {
        console.log("Inside find..............");
        var _pid = req.params.pid;
        console.log("Inside find.............. _pid = " + _pid);

        return Country.find().where({pid: _pid}).then(function (_country) {

            if (_country && _country.length > 0) {
                console.log("Inside find Found .... _country = " + JSON.stringify(_country));
                return res.view("country/edit", {
                    status: 'OK',
                    title: 'Country Details',
                    country: _country[0]
                });
            } else {
                console.log("Inside find NOT Found .... ");
                return res.view("country/edit", {
                    status: 'Error',
                    errorType: 'not-found',
                    statusDescription: 'No country found with pid, ' + _pid,
                    title: 'Country Details'
                });
            }
        }).catch(function (err) {
            console.log("Inside find ERROR .... ");
            return res.view("country/edit", {
                status: 'Error',
                errorType: 'not-found',
                statusDescription: 'No country found with pid, ' + _pid,
                title: 'Country Details'
            });
        });

    },
    /**
     * `CountryController.index()`
     */
     index: function (req, res) {
        console.log("Inside findall..............");
        var ref = db.ref("countries");
        return ref.once('value', function (areaSnapshot) {
          countries = areaSnapshot.val();
          console.log("CountryService.findAll -- countries = " + countries);
          console.log(JSON.stringify(countries));
          return res.view("country/list", {
            status: 'OK',
            title: 'List of countries',
            countries: countries
        });
      }).catch(function (err) {
        console.error("Error on CountryService.findAll");
        console.error(err);
        return res.view('500', {message: "Sorry, an error occurd - " + err});
    });
  },
    /**
     * `CountryController.findall()`
     */
     new : function (req, res) {
        console.log("Inside new..............");
        return res.view("country/new", {
            country: {
                name: ''
            },
            status: 'OK',
            title: 'Add a new country'
        });
    },
    showFind: function (req, res) {
        console.log("Inside showFind..............");
        res.view("country/find", {
            title: "Search countries"
        });
    },
    resetData: function (req, res) {
        CountryService.preloadData(function(_countries) {
            return res.redirect("country");
        });
    }

};

