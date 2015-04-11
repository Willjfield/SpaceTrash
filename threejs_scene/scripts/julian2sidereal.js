var epochHour = 262980;     // 1.Jan.2000 12:00 UT as Unix time in hours.
var epochST = 6.697374558   // GMST at epoch Time
var deltaT = 0.002737909350795;
function getLAST(d,l){
     // Local Apparent Sidereal Time (for Date 'd' at Longitude 'l')
     // ref: http://aa.usno.navy.mil/faq/docs/GAST.php
     //
     // Given below is a simple algorithm for computing apparent sidereal time
     // to an accuracy of about 0.1 second, equivalent to about 1.5 arcseconds of sky.
     //
     // The algorithm uses an epoch of Jan 1, 2000 12:00 UT
     //
     // It derives two values representing the current time
     //      epDays  is the number of (mean solar) days from the epoch to 0000 UT of the current day
     //              (always has a fraction of .5)
     //      utHours is the number of hours since 0000 UT
     //
     // Then the Greenwich mean sidereal time in hours is
     //      GMST = 6.697374558 + 0.06570982441908 x epDays + 1.00273790935 x utHours
     // Local Apparent Sidereal Time is found by adding 4 minutes per degree of East longitude (1 hour per 15 degrees)
     //      LAST = GMST + longitude / 15
     // A modulus operation is applied to yield : 0.0 <= LAST < 24.0
     //
     // In simple terms,
     //      epochHour = 262980;         // Epoch time (1.Jan.2000 12:00 UT) as Unix time in hours.
     //      epochST = 6.697374558       // GMST at epoch Time
     //      deltaT = 0.002737909350795; // ( Sidereal hour - Solar Hour) (as Sidereal hours)
     // then
     //      let nowHour be the current UT time in hours
     //      GMST = epochST + (nowHour-epochHour)*deltaT + nowHour modulo 24
     //      LAST = (GMST + longitude/15) modulo 24
     //nowHour = d.getTime()/3600000;     // current Unix UT time in hours
     nowHour = Date.now()/3600000;     // current Unix UT time in hours
     LAST = ( epochST + deltaT*(nowHour - epochHour) + nowHour + l/15 ) % 24;
     // Format this as HH:MM:SS
     r = new Date(LAST*3600000);
     //return r;
     var hr = parseInt(r.toUTCString().substr(17,2));
     console.log(hr);
     var min = parseInt(r.toUTCString().substr(20,2))/60;
     console.log(min);
     var sec = parseInt(r.toUTCString().substr(23,2))/60/60;
     console.log(sec);

     return hr+min+sec;
     //return r.toUTCString().substr(17,8);
}

console.log(getLAST(Date.now(),-74.0059700));