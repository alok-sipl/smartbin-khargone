/**
 * BinController
 *
 * @description :: Server-side logic for managing drivers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var async = require('async');
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
        return res.view('bin-listing', {
            'title': sails.config.title.bin_list
        });
    },


    /**
     * `BinController.create()`
     */
     create: function (req, res) {
        var ref = db.ref("bins");
        var _newBin = {
            "alert_level": "80",
            "area_id": "-L37kL3lJmfpGE9tof9X",
            "area_name": "MG Road",
            "circle_id": "-L2e7fEvmHHh7Pj4R30f",
            "city_id": "-L2TxNe8boIvuTly8hdd",
            "country_id": "-L1pigYbq_ZQl009gBoU",
            "created_date": 1516030147156,
            "id": "181818181818181",
            "is_deleted": false,
            "latest_dust_level": 80,
            "latitude": "21.813122",
            "location": "Goal Building",
            "longitude": "75.617581",
            "modified_date": 1519636667296,
            "name": "Goal Building",
            "smoke": 0,
            "state_id": "-L2TwVAW-_j7JJ8nDMEI",
            "ward_id": "-L2sgNgUAhpYrq_4r1Ki"
        }
        ref.push(_newBin).then(function (_bin) {
            //return res.redirect(sails.config.base_url + 'bin');
        }, function (error) {
            console.error("Error on createBin");
            console.error(JSON.stringify(err));
        });
    },


    /*
    Add Bin via csv
    */
    importBinCsv: function (req, res) {
        var parser = parse({delimiter: ','}, function (err, data) {
            data.forEach(function (line) {
                // create country object out of parsed fields
                var country = {
                    "alert_level": line[1],
                    "area_id": line[2],
                    "area_name": line[3],
                    "circle_id": line[4],
                    "city_id": line[5],
                    "country_id": line[6],
                    "created_date": Date.now(),
                    "id": line[8],
                    "is_deleted": false,
                    "latest_dust_level": line[10],
                    "latitude": line[11],
                    "location": line[12],
                    "longitude": line[13],
                    "modified_date": Date.now(),
                    "name": line[15],
                    "smoke": line[16],
                    "state_id": line[17],
                    "ward_id": line[18]
                };
                console.log('Rows--->', JSON.stringify(country));
                // var cities = db.ref().child("countries");
                // var newCities = cities.push();
                // newCities.set(country);
            });
        });
        fs.createReadStream('countries.csv').pipe(parser);
    },

    /*
    * Name: binlist
    * Created By: A-SIPL
    * Created Date: 20-dec-2017
    * Purpose: shpw grid with data
    * @param  req
    */
    binlist: function (req, res) {
        bins = [];
        var ref = db.ref("bins");
        ref.once('value', function (snap) {
            var tempBinRecords = [];
            _.map(snap.val(), function (val, bin_key) {
                val.bin_key = bin_key;
                tempBinRecords.push(val)
            });
            if (snap.val() != null && Object.keys(snap.val()).length) {
                var i = 0;
                async.forEach(tempBinRecords, function (childSnap, callback) {
                    updateBin = {};
                    var ref = db.ref("areas/" + childSnap.ward_id + "/" + childSnap.area_id);
                    ref.once("value", function (snapshot) {
                        var area = snapshot.val();
                        var ref = db.ref("circlewards/" + childSnap.circle_id + "/" + childSnap.ward_id);
                        ref.once("value", function (snapshotWards) {
                            var ward = snapshotWards.val();
                            bindetails = childSnap;
                            updateBin = bindetails;
                            updateBin.latitude = parseFloat(updateBin.latitude);
                            updateBin.longitude = parseFloat(updateBin.longitude);
                            if (ward) {
                                updateBin.ward_name = ward.name;
                            }
                            if (area) {
                                updateBin.area_name = area.name;
                            }
                            if (childSnap.alert_level != undefined && childSnap.alert_level != '' && childSnap.latest_dust_level != undefined && childSnap.latest_dust_level != undefined) {
                                updateBin.filling_status = parseInt((((parseInt(childSnap.alert_level) - parseInt(childSnap.latest_dust_level))) * 100) / parseInt(childSnap.alert_level));
                            } else {
                                updateBin.filling_status = 0;
                            }
                            bins.push(updateBin);
                            i++;
                            callback();
                            if (i == Object.keys(snap.val()).length) {
                                bins.sort(function (a, b) {
                                    return b.filling_status - a.filling_status;
                                })
                                return res.json({'rows': bins});
                            }
                        });
                    });
                });
            } else {
                bins = {};
                //return bins;
                return res.json({'rows': bins});
            }

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
        var errors = bin = countries = states = cities = wards = areas = circles = {};
        /* Checking validation if form post */
        if (req.method == "POST") {
            errors = ValidationService.validate(req);
            if (Object.keys(errors).length) {
                addBinCollection(req, res, errors);
            } else {
                var allowExts = ['image/png', 'image/jpg', 'image/jpeg'];
                var ref = db.ref("/bins");
                ref.orderByChild("id").equalTo(req.param('id')).once('value')
                .then(function (snapshot) {
                    bindata = snapshot.val();
                    req.file('image').upload({
                            // don't allow the total upload size to exceed ~4MB
                            maxBytes: sails.config.length.max_file_upload
                        }, function whenDone(err, uploadedFiles) {
                            if (err) {
                                errors['image'] = {message: err}
                                addBinCollection(req, res, errors);
                            } else {
                                if (uploadedFiles.length === 0) {
                                    errors['image'] = {message: Bin.message.bin_image_required}
                                    addBinCollection(req, res, errors);
                                } else if (allowExts.indexOf(uploadedFiles[0].type) == -1) {
                                    errors['image'] = {message: Bin.message.invalid_file}
                                    addBinCollection(req, res, errors);
                                } else if (bindata) {
                                    req.flash('flashMessage', '<div class="alert alert-danger">' + req.param('id') + sails.config.flash.bin_id_already_exist + '</div>');
                                    return res.redirect(sails.config.base_url + 'bin/add');
                                } else {
                                    var ref = db.ref("bins");
                                    var data = {
                                        alert_level: req.param('alert_level'),
                                        area_id: req.param('area'),
                                        area_name: req.param('area_name'),
                                        ward_id: req.param('ward'),
                                        city_id: req.param('city'),
                                        country_id: req.param('country'),
                                        created_date: Date.now(),
                                        id: req.param('id'),
                                        is_deleted: false,
                                        latitude: req.param('latitude'),
                                        location: req.param('location'),
                                        longitude: req.param('longitude'),
                                        modified_date: Date.now(),
                                        circle_id: req.param('circle'),
                                        name: req.param('name'),
                                        state_id: req.param('state'),
                                    }
                                    ref.push(data).then(function () {
                                        req.flash('flashMessage', '<div class="alert alert-success">Bin Added Successfully.</div>');
                                        return res.redirect(sails.config.base_url + 'bin');
                                    }, function (error) {
                                        req.flash('flashMessage', '<div class="alert alert-danger">Error In Adding Bin.</div>');
                                        return res.redirect(sails.config.base_url + 'bin');
                                    });
                                }
                            }
                        });
                }).catch(function (err) {
                    req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
                    return res.redirect(sails.config.base_url + 'bin');
                });
            }
        } else {
            addBinCollection(req, res, errors);
        }
    },


    /*
   * Name: view
   * Created By: A-SIPL
   * Created Date: 08-feb-2018
   * Purpose: get bin detail
   * @param  req
   */
   view: function (req, res) {
    /* user detail */
    var errors = {};
    var ref = db.ref("bins/" + req.params.id);
    ref.once("value", function (snapshot) {
        var bin = snapshot.val();
        /* city listing*/
        if (bin != null) {
            /* country listing*/
            var ref = db.ref("countries");
            ref.once("value", function (snapshot) {
                var countries = snapshot.val();
                /* bin detail */
                var ref = db.ref("bins/" + req.params.id);
                ref.once("value", function (snapshot) {
                    var bin = snapshot.val();
                    /* city name */
                    ref.once("value", function (snapshot) {
                        var refState = db.ref("states/" + bin.country_id);
                        refState.once("value", function (snapshotState) {
                            var states = snapshotState.val();
                            var refCity = db.ref("cities/" + bin.state_id);
                            refCity.once("value", function (snapshotCity) {
                                var cities = snapshotCity.val();
                                var refCircle = db.ref("circles/" + bin.city_id);
                                refCircle.once("value", function (snapshotCircle) {
                                    var circles = snapshotCircle.val();
                                    var refWards = db.ref("circlewards/" + bin.circle_id);
                                    refWards.once("value", function (snapshotWards) {
                                        var wards = snapshotWards.val();
                                        var refAreas = db.ref("areas/" + bin.ward_id);
                                        refAreas.once("value", function (snapshotAreas) {
                                            var areas = snapshotAreas.val();
                                            return res.view('view-bin', {
                                                title: sails.config.title.view_bin,
                                                'bin': bin,
                                                "countries": countries,
                                                "states": states,
                                                "cities": cities,
                                                'wards': wards,
                                                'circles': circles,
                                                'areas': areas,
                                                "errors": errors
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
                                /* Get Areas */
                            }, function (errorObject) {
                                return res.serverError(errorObject.code);
                            });
                            /* Get Cities */
                        }, function (errorObject) {
                            return res.serverError(errorObject.code);
                        });
                    }, function (errorObject) {
                        return res.serverError(errorObject.code);
                    });
                    /* Get States */
                }, function (errorObject) {
                    return res.serverError(errorObject.code);
                });
            }, function (errorObject) {
                return res.serverError(errorObject.code);
            });
        } else {
            req.flash('flashMessage', '<div class="flash-message alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
            res.redirect(sails.config.base_url + 'bin');
        }
    }, function (errorObject) {
        return res.serverError(errorObject.code);
    });
},

    /*
       * Name: edit
       * Created By: A-SIPL
       * Created Date: 8-dec-2017
       * Purpose: add new supplier
       * @param  req
       */
       edit: function (req, res) {
        var bin = countries = cities = states = errors = wards = circles = areas = {};
        var isFormError = false;
        if (req.method == "POST") {
            errors = ValidationService.validate(req);
            if (Object.keys(errors).length) {
                editBinCollection(req, res, errors)
            } else {
                var allowExts = ['image/png', 'image/jpg', 'image/jpeg'];
                req.file('image').upload({
                    // don't allow the total upload size to exceed ~4MB
                    maxBytes: sails.config.length.max_file_upload
                }, function whenDone(err, uploadedFiles) {
                    if (err) {
                        errors['image'] = {message: err}
                        editBinCollection(req, res, errors)
                    } else {
                        if ((Object.keys(uploadedFiles).length) && (allowExts.indexOf(uploadedFiles[0].type) == -1)) {
                            errors['image'] = {message: Bin.message.invalid_file}
                            editBinCollection(req, res, errors)
                        } else {
                            var ref = db.ref();
                            db.ref('bins/' + req.params.id)
                            .update({
                                alert_level: req.param('alert_level'),
                                area_id: req.param('area'),
                                area_name: req.param('area_name'),
                                ward_id: req.param('ward'),
                                city_id: req.param('city'),
                                country_id: req.param('country'),
                                is_deleted: false,
                                latitude: req.param('latitude'),
                                location: req.param('location'),
                                longitude: req.param('longitude'),
                                modified_date: Date.now(),
                                circle_id: req.param('circle'),
                                name: req.param('name'),
                                state_id: req.param('state'),
                            })
                            .then(function () {
                                req.flash('flashMessage', '<div class="alert alert-success">' + sails.config.flash.bin_updated_success + '</div>');
                                return res.redirect(sails.config.base_url + 'bin');
                            })
                            .catch(function (err) {
                                req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.bin_add_error + '</div>');
                                return res.redirect(sails.config.base_url + 'bin/edit/' + req.params.id);
                            });
                        }
                    }
                });
            }
        } else {
            editBinCollection(req, res, errors)
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
        var ref = db.ref('bins/' + id);
        ref.once("value", function (snapshot) {
            if (snapshot.val()) {
                db.ref('bins/' + id)
                .update({
                    'is_deleted': (status == 'true' || status == true) ? true : false,
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
        }, function (errorObject) {
            return res.json({'status': false, message: sails.config.flash.something_went_wronge});
        });
    },


    /*
       * Name: filterbins
       * Created By: A-SIPL
       * Created Date: 8-dec-2017
       * Purpose: show listing of the supplier
       * @param  int  $id
       */
       filterbins: function (req, res) {
        bins = [];
        var selected_ward = req.body.selected_ward;
        var select_driver = req.body.select_driver;
        var bin_type = req.body.bin_type;
        if (selected_ward || (select_driver && select_driver != 'all')) {
            if (selected_ward && select_driver && select_driver != 'all') {
                var ref = db.ref("drivers/" + select_driver);
                ref.once("value", function (snapshot) {
                    driverDetail = snapshot.val();
                    if (driverDetail.area_id != undefined) {
                        db.ref('/bins').orderByChild("ward_id").equalTo(selected_ward).once('value')
                        .then(function (snapshot) {
                            var binsList = snapshot.val();
                            if (binsList != null) {
                                for (var i in binsList) {
                                    if (bin_type == 'true') {
                                        if (binsList[i]['area_id'] == undefined || binsList[i]['area_id'] == driverDetail.area_id || binsList[i]['is_deleted'] == undefined || binsList[i]['is_deleted'] == true || binsList[i]['alert_level'] == undefined || binsList[i]['alert_level'] == '' || binsList[i]['latest_dust_level'] == undefined || binsList[i]['latest_dust_level'] == '' || (parseInt((((parseInt(bins[i]['alert_level']) - parseInt(bins[i]['latest_dust_level']))) * 100) / parseInt(bins[i]['alert_level']))) < sails.config.length.avrage_fill_level) {
                                            delete binsList[i];
                                        }
                                    } else {
                                        if (binsList[i]['area_id'] == undefined || binsList[i]['area_id'] == driverDetail.area_id || binsList[i]['is_deleted'] == undefined || binsList[i]['is_deleted'] == true) {
                                            delete binsList[i];
                                        }
                                    }

                                }
                            }
                            console.log(Object.keys(binsList).length);
                            return res.json({'bins': binsList});
                        }).catch(function (err) {
                            return res.json({'bins': {}});
                        });
                    } else {
                        db.ref('/bins').orderByChild("ward_id").equalTo(selected_ward).once('value')
                        .then(function (snapshot) {
                            var bins = snapshot.val();
                            if (bins != null) {
                                for (var i in bins) {
                                    if (bin_type == 'true') {
                                        if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true || bins[i]['alert_level'] == undefined || bins[i]['alert_level'] == '' || bins[i]['latest_dust_level'] == undefined || bins[i]['latest_dust_level'] == '' || (parseInt((((parseInt(bins[i]['alert_level']) - parseInt(bins[i]['latest_dust_level']))) * 100) / parseInt(bins[i]['alert_level']))) < sails.config.length.avrage_fill_level) {
                                            delete bins[i];
                                        }
                                    } else {
                                        if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true) {
                                            delete bins[i];
                                        }
                                    }
                                }
                            }
                            console.log(Object.keys(bins).length);
                            return res.json({'bins': bins});
                        }).catch(function (err) {
                            return res.json({'bins': {}});
                        });
                    }
                }, function (errorObject) {
                    return res.serverError(errorObject.code);
                });
            } else if (select_driver && select_driver != 'all') {
                var ref = db.ref("drivers/" + select_driver);
                ref.once("value", function (snapshot) {
                    driverDetail = snapshot.val();
                    if (driverDetail.area_id != undefined) {
                        var ref = db.ref("bins").orderByChild('area_id').equalTo(driverDetail.area_id);
                        ref.once("value", function (snapshot) {
                            var bins = snapshot.val();
                            if (bins != null) {
                                for (var i in bins) {
                                    if (bin_type == 'true') {
                                        if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true || bins[i]['alert_level'] == undefined || bins[i]['alert_level'] == '' || bins[i]['latest_dust_level'] == undefined || bins[i]['latest_dust_level'] == '' || (parseInt((((parseInt(bins[i]['alert_level']) - parseInt(bins[i]['latest_dust_level']))) * 100) / parseInt(bins[i]['alert_level']))) < sails.config.length.avrage_fill_level) {
                                            delete bins[i];
                                        }
                                    } else {
                                        if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true) {
                                            delete bins[i];
                                        }
                                    }
                                }
                            }
                            return res.json({'bins': bins});
                        }, function (errorObject) {
                            return res.serverError(errorObject.code);
                        });
                    } else {
                        db.ref('/bins').once('value')
                        .then(function (snapshot) {
                            var bins = snapshot.val();
                            if (bins != null) {
                                for (var i in bins) {
                                    if (bin_type == 'true') {
                                        if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true || bins[i]['alert_level'] == undefined || bins[i]['alert_level'] == '' || bins[i]['latest_dust_level'] == undefined || bins[i]['latest_dust_level'] == '' || (parseInt((((parseInt(bins[i]['alert_level']) - parseInt(bins[i]['latest_dust_level']))) * 100) / parseInt(bins[i]['alert_level']))) < sails.config.length.avrage_fill_level) {
                                            delete bins[i];
                                        }
                                    } else {
                                        if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true) {
                                            delete bins[i];
                                        }
                                    }
                                }
                            }
                            console.log(Object.keys(bins).length);
                            return res.json({'bins': bins});
                        }).catch(function (err) {
                            return res.json({'bins': {}});
                        });
                    }
                }, function (errorObject) {
                    return res.serverError(errorObject.code);
                });
            } else {
                db.ref('/bins').orderByChild("ward_id").equalTo(selected_ward)
                .once('value')
                .then(function (snapshot) {
                    var bins = snapshot.val();
                    if (bins != null) {
                        for (var i in bins) {
                            if (bin_type == 'true') {
                                if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true || bins[i]['alert_level'] == undefined || bins[i]['alert_level'] == '' || bins[i]['latest_dust_level'] == undefined || bins[i]['latest_dust_level'] == '' || (parseInt((((parseInt(bins[i]['alert_level']) - parseInt(bins[i]['latest_dust_level']))) * 100) / parseInt(bins[i]['alert_level']))) < sails.config.length.avrage_fill_level) {
                                    delete bins[i];
                                }
                            } else {
                                if (bins[i]['is_deleted'] == undefined || bins[i]['is_deleted'] == true) {
                                    delete bins[i];
                                }
                            }
                        }
                    }
                    return res.json({'bins': bins});
                }).catch(function (err) {
                    return res.json({'bins': {}});
                });
            }
        } else {
            db.ref('bins').orderByChild("is_deleted").equalTo(false).once('value')
            .then(function (snapshot) {
                if(snapshot.val() != null){
                    var bins = snapshot.val();
                    if (bin_type == 'true') {
                        if (bins != null) {
                            for (var i in bins) {
                                if (bins[i]['alert_level'] == undefined || bins[i]['alert_level'] == '' || bins[i]['latest_dust_level'] == undefined || bins[i]['latest_dust_level'] == '' || (parseInt((((parseInt(bins[i]['alert_level']) - parseInt(bins[i]['latest_dust_level']))) * 100) / parseInt(bins[i]['alert_level']))) < sails.config.length.avrage_fill_level) {
                                    delete bins[i];
                                }
                            }
                        }
                    }
                    return res.json({'bins': bins});
                }else{
                    return res.json({'bins': {}});
                }
                
            }).catch(function (err) {
                return res.json({'bins': {}});
            });
        }
    },
};

/*
   * Name: getBinList
   * Created By: A-SIPL
   * Created Date: 20-dec-2017
   * Purpose: sget the user grid dat
   * @param  req
   */
   function getBinsList(snap) {
    if (Object.keys(snap).length) {
        var i = 0;
        snap.forEach(function (childSnap) {
            bindetails = childSnap.val();
            updateBin = {};
            updateBin.bin_key = childSnap.key;
            updateBin = bindetails;
            bins.push(updateBin);
        });
        return bins;
    } else {
        bins = {};
        return bins;
    }
}


function addBinCollection(req, res, errors) {
    /* country listing*/
    var ref = db.ref("countries");
    ref.orderByChild("name")
    .once("value", function (snapshot) {
        var countries = CountryService.snapshotToArray(snapshot);
        countries = countries.sort(function (a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        /* ward listing*/
        var ref = db.ref("wards");
        ref.once("value", function (wardSnapshot) {
            var wards = wardSnapshot.val();
            return res.view('add-update-bin', {
                'title': sails.config.title.add_bin,
                'bin': bin,
                'countries': countries,
                'states': states,
                'cities': cities,
                'wards': wards,
                'errors': errors,
                'req': req
            });
        }, function (errorObject) {
            return res.serverError(errorObject.code);
        });
    }, function (errorObject) {
        return res.serverError(errorObject.code);
    });
}


function editBinCollection(req, res, errors) {
    areas = {}
    /* bin detail */
    var ref = db.ref("bins/" + req.params.id);
    ref.once("value", function (snapshot) {
        var bin = snapshot.val();
        if (bin != null) {
            /* country listing*/
            var ref = db.ref("countries");
            ref.once("value", function (snapshot) {
                var countries = CountryService.snapshotToArray(snapshot);
                countries = countries.sort(function (a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                /* city name */
                ref.once("value", function (snapshot) {
                    var refState = db.ref("states/" + bin.country_id);
                    refState.once("value", function (snapshotState) {
                        var states = CountryService.snapshotToArray(snapshotState);
                        states = states.sort(function (a, b) {
                            var textA = a.name.toUpperCase();
                            var textB = b.name.toUpperCase();
                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                        });
                        var refCity = db.ref("cities/" + bin.state_id);
                        refCity.once("value", function (snapshotCity) {
                            var cities = CountryService.snapshotToArray(snapshotCity);
                            cities = cities.sort(function (a, b) {
                                var textA = a.name.toUpperCase();
                                var textB = b.name.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
                            var refCircle = db.ref("circles/" + bin.city_id);
                            refCircle.once("value", function (snapshotCircle) {
                                var circles = CountryService.snapshotToArray(snapshotCircle);
                                circles = circles.sort(function (a, b) {
                                    var textA = parseInt(a.name);
                                    var textB = parseInt(b.name);
                                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                });
                                var refWards = db.ref("circlewards/" + bin.circle_id);
                                refWards.once("value", function (snapshotWards) {
                                    var wards = CountryService.snapshotToArray(snapshotWards);
                                    wards = wards.sort(function (a, b) {
                                        var textA = a.name.toUpperCase();
                                        var textB = b.name.toUpperCase();
                                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                    })
                                    var refAreas = db.ref("areas/" + bin.ward_id);
                                    refAreas.once("value", function (snapshotAreas) {
                                        var areas = CountryService.snapshotToArray(snapshotAreas);
                                        areas = areas.sort(function (a, b) {
                                            var textA = a.name.toUpperCase();
                                            var textB = b.name.toUpperCase();
                                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                        });
                                        return res.view('add-update-bin', {
                                            title: sails.config.title.edit_bin,
                                            'bin': bin,
                                            "countries": countries,
                                            "states": states,
                                            "cities": cities,
                                            'wards': wards,
                                            'circles': circles,
                                            'areas': areas,
                                            "errors": errors
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
                            /* Get Areas */
                        }, function (errorObject) {
                            return res.serverError(errorObject.code);
                        });
                        /* Get Cities */
                    }, function (errorObject) {
                        return res.serverError(errorObject.code);
                    });
}, function (errorObject) {
    return res.serverError(errorObject.code);
});
/* Get States */
}, function (errorObject) {
    return res.serverError(errorObject.code);
});
} else {
    req.flash('flashMessage', '<div class="alert alert-danger">' + sails.config.flash.something_went_wronge + '</div>');
    return res.redirect(sails.config.base_url + 'bin');
}
}, function (errorObject) {
    return res.serverError(errorObject.code);
});
}
