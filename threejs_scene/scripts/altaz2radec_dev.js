//http://bado-shanai.net/Astrogation/astrogCoordConvEqns.htm
//https://casper.berkeley.edu/astrobaki/index.php/Coordinates#2.3_EQUATORIAL_to_GALACTIC.
//http://idlastro.gsfc.nasa.gov/ftp/pro/astro/
//STELLARIUM
//http://vfacstaff.ltu.edu/lshamir/


//http://www.robertmartinayers.org/tools/coordinates.html

//Lat long for nyc
//var latitude = 40.7142700;
//var longitude = -74.0059700;



function altaz2galac(lat, long, altitude, azimuth){
///////////////////////////////////////////////////
//        Get Sidereal Time         //
///////////////////////////////////////////////////
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
     //console.log(hr);
     var min = parseInt(r.toUTCString().substr(20,2))/60;
     //console.log(min);
     var sec = parseInt(r.toUTCString().substr(23,2))/60/60;
     //console.log(sec);

     return hr+min+sec;
     //return r.toUTCString().substr(17,8);
}
//calculate sidreal time
var sidereal = getLAST(Date.now(),longitude);
//console.log("sidereal "+sidereal);
///////////////////////////////////////////////////

var pi = Math.PI;
var toDegrees = 180.0/pi;

function altaz2radec(latitude,alt, az)

{  var cosRA,sinDEC,RA, DEC;

    //sidereal = 10.66666666;
    if (az==180) az=180.1;
    sinDEC=Math.cos(Math.radians(az))*Math.cos(Math.radians(alt))*Math.cos(Math.radians(latitude))+Math.sin(Math.radians(alt))*Math.sin(Math.radians(latitude));
    DEC=Math.asin(sinDEC);
    cosRA=(Math.sin(Math.radians(alt))-Math.sin(DEC)*Math.sin(Math.radians(latitude)))/(Math.cos(DEC)*Math.cos(Math.radians(latitude)));
    RA=Math.degrees(Math.acos(cosRA));
    if (Math.sin(Math.radians(az))>0) RA=360-RA;
    //RA = sidereal;
    //RA=sidereal-(RA/15);

    //SIDEREAL TIME (15+(41.5/60)) JUST A SAMPLE TO COMPARE WITH STELLARIUM, MUST BE CALCULATED IN REAL TIME
    RA= (sidereal)-(RA/15);
    if (RA<0) RA=RA+24;
    DEC=(Math.degrees((DEC)));
    
    var xradec = new Array (RA, DEC);
    return xradec;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function radec2cbd(ra, dec){
  var AC = 90-dec;
  var AB = 62.8717;
  var CAB = 192.8595-ra;

  Math.cos(BC) = Math.cos(AC)*Math.cos(AB)+Math.sin(AC)*Math.sin(AB)*Math.cos(CAB);

}

//Matrix Transform to get ra/dec to galactic

// From J2000 to "galactic coordinates"
  // Spherical Astronomy by Green, equation 14.55, page 355
    var JtoG = new Array (
    -0.054876, -0.873437, -0.483835,
     0.494109, -0.444830,  0.746982,
    -0.867666, -0.198076,  0.455984 );

      var JtoGapj = new Array (
   -0.054875529,  0.494109454, -0.867666136,
   -0.873437105, -0.444829594, -0.198076390,
   -0.483834992,  0.746982249,  0.455983795 );

      var GtoJ = new Array (
   -0.0548755604,  0.4941094279, -0.8676661490,
   -0.8734370902, -0.4448296300, -0.1980763734,
   -0.4838350155,  0.7469822445,  0.4559837762 );
function RadiansPrintD (rad)
{ 
  var sign2 = "";
  if ( rad < 0.0 ) { sign2 = "-"; rad = 0.0 - rad; }

  var hh = rad * toDegrees;
  hh = hh + 0.00005; // rounding
  var h = Math.floor(hh);
  hh = hh - h; // fraction
  hh = hh * 10;
  var f1 = Math.floor (hh); // Crude but easy way to get leading zeroes in fraction
  hh = hh - f1;
  hh = hh * 10;
  var f2 = Math.floor (hh); 
  hh = hh - f2;
  hh = hh * 10;
  var f3 = Math.floor (hh);
  hh = hh - f3;
  hh = hh * 10;
  var f4 = Math.floor (hh); 
  ret = sign2 + h + "." +f1+f2+f3+f4;
  return ret;
}
function Transform ( radec, matrix ) // returns a radec array of two elements
{
  var r0 = new Array ( 
   Math.cos(radec[0]) * Math.cos(radec[1]),
   Math.sin(radec[0]) * Math.cos(radec[1]),
   Math.sin(radec[1]) );
    
 var s0 = new Array (
   r0[0]*matrix[0] + r0[1]*matrix[1] + r0[2]*matrix[2], 
   r0[0]*matrix[3] + r0[1]*matrix[4] + r0[2]*matrix[5], 
   r0[0]*matrix[6] + r0[1]*matrix[7] + r0[2]*matrix[8] ); 
 
  var r = Math.sqrt ( s0[0]*s0[0] + s0[1]*s0[1] + s0[2]*s0[2] ); 

  var result = new Array ( 0.0, 0.0 );
  result[1] = Math.asin ( s0[2]/r ); // New dec in range -90.0 -- +90.0 
  // or use sin^2 + cos^2 = 1.0  
  var cosaa = ( (s0[0]/r) / Math.cos(result[1] ) );
  var sinaa = ( (s0[1]/r) / Math.cos(result[1] ) );
  result[0] = Math.atan2 (sinaa,cosaa);
  if ( result[0] < 0.0 ) result[0] = result[0] + pi + pi;
  return result;
}
  //CALCULATE ACTUAL LAT and ALT/AZ to PLUG IN BELOW USE TEMP VALUES TO TEST
  //var curRaDec = altaz2radec(latitude,44.5, 260);
  var curRaDec = altaz2radec(latitude,altitude, azimuth);
  //console.log("ra/dec "+curRaDec);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // First, calculate J2000 coords (easy if supplied) and store.
// Then calculate other coords from J2000 -- even if supplied.
// Then fill the calculated values into the output fields.

var xradec = new Array (99.0, 99.0);

function Numberish (char3)
{
  if ( char3 == "0" ) return 1;
  if ( char3 == "1" ) return 1;
  if ( char3 == "2" ) return 1;
  if ( char3 == "3" ) return 1;
  if ( char3 == "4" ) return 1;
  if ( char3 == "5" ) return 1;
  if ( char3 == "6" ) return 1;
  if ( char3 == "7" ) return 1;
  if ( char3 == "8" ) return 1;
  if ( char3 == "9" ) return 1;
  if ( char3 == "." ) return 1;
  return 0;
}

function ParseRA(val)          
 {  
  var answer = 0;  var val2 = 0; var times = 15.0 * 3600.0;  

  // Skip initial blanks
  while ( (val.length > 0) && (val.indexOf(" ") == 0) )
  { val = val.substring(1); } 

  // Special form: initial "+" => degrees, not hours
  if ( (val.length > 0) && (val.indexOf("+") == 0) ) 
  { times = 3600.0; val = val.substring(1); }

  // Special form: degree sign anywhere => degrees not hours
  if ( val.indexOf("?") != -1 ) { times = 3600.0; }

// Don't blame me for the ECMAScript String class ...
  
  while ( val.length > 0 ) // Big loop pulling numbers
  {
  if ( ! Numberish(val.charAt(0)) ) 
    { val = val.substring(1); continue; }
  // val[0] is numberish
  var coun = 0;
  while ( (coun < val.length) && Numberish(val.charAt(coun)) ) { coun = coun + 1; }
  // Have a number in [0..coun)

  val2 = val.substring(0,coun); 
  val = val.substring (coun);
  // Have the number in val2 and the rest of the string in val.
 
  answer = parseFloat (answer) + parseFloat (val2) * times;
  times = times / 60;  
  } // big loop pulling numbers
 
  return answer;
 }

// parseFloat and eval seem to work.  ToNumber fails.
 
function ParseDec(val)          
 { var negative = 0;
  var answer = 0;  var val2 = 0; var times = 3600.0;  

  // Skip initial blanks
  while ( (val.length > 0) && (val.indexOf(" ") == 0) )
  { val = val.substring(1); } 

  if ( (val.length > 0) && (val.indexOf("-") == 0) )
  { negative = 1; val = val.substring(1); } 

 
// Don't blame me for the ECMAScript String class ...
  
  while ( val.length > 0 ) // Big loop pulling numbers
  {
  if ( ! Numberish(val.charAt(0)) ) 
    { val = val.substring(1); continue; }
  // val[0] is numberish
  var coun = 0;
  while ( (coun < val.length) && Numberish(val.charAt(coun)) ) { coun = coun + 1; }
  // Have a number in [0..coun)

  val2 = val.substring(0,coun); 
  val = val.substring (coun);
  // Have the number in val2 and the rest of the string in val.
 
  answer = parseFloat (answer) + parseFloat (val2) * times;
  times = times / 60;  
  } // big loop pulling numbers
 
  if ( negative ) answer = 0.0 - answer;
  return answer; 
 }

globalJRA = ParseRA(curRaDec[0].toString());
globalJDec = ParseDec(curRaDec[1].toString());
  // the above "globals" are in arcseconds. 
  
if ( (globalJRA >= 1296000) || (globalJRA < 0) ) 
{  
    return 0; // Acting like exit 
}
if ( (globalJDec > 324000) || (globalJDec < -324000) ) 
{   
    return 0; // Acting like exit 
}

  var radec1 = new Array ( (globalJRA/3600.0) / toDegrees, 
   (globalJDec/3600.0) / toDegrees );

  xradec = radec1;


////////////////////////////////////////////

  var galac = Transform (xradec, JtoG);
  galac[0] = RadiansPrintD(galac[0]);
  galac[1] = RadiansPrintD(galac[1]);
  return galac;
  //console.log("galac[0] "+RadiansPrintD(galac[0]));
  //console.log("galac[1] "+RadiansPrintD(galac[1]));
}
