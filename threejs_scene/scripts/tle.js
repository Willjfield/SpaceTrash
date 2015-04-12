// Tle Object constructor
function tle(line1, line2) {
    this.line1 = line1;
    this.line2 = line2;
    this.update = function() {
        // Initialize a satellite record
        var satrec = satellite.twoline2satrec (this.line1, this.line2);
        // Propagate satellite using current time
        var now = new Date();
        // NOTE: while Javascript Date returns months in range 0-11, all satellite.js methods require months in range 1-12.
        var position_and_velocity = satellite.propagate (satrec,
                                                        now.getUTCFullYear(), 
                                                        now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
                                                        now.getUTCDate(),
                                                        now.getUTCHours(), 
                                                        now.getUTCMinutes(), 
                                                        now.getUTCSeconds());
        // The position_velocity result is a key-value pair of ECI coordinates.
        // These are the base results from which all other coordinates are derived.
        var position_eci = position_and_velocity["position"];
        var velocity_eci = position_and_velocity["velocity"];
        // The coordinates are all stored in key-value pairs.
        // ECI and ECF are accessed by "x", "y", "z".
        this.satellite_x = position_eci["x"];
        this.satellite_y = position_eci["y"];
        this.satellite_z = position_eci["z"];
    };
}
// Holds all tle objects
var tle_data = [];

function init_tle(cb) {
    // Load TLE Data
    $.getJSON("TLE_DATA.json", function(json) {
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                var obj = json[key];
                var tmp = new tle(obj.TLE_LINE1, obj.TLE_LINE2);
                tmp.update();
                tle_data.push(tmp);
           }
        }
        cb();
    });
}
// Call to update data to current time
function tle_update() {
    for (var key in tle_data) {
        if (tle_data.hasOwnProperty(key)) {
            var obj = tle_data[key];
            obj.update();
        }
    }
}
