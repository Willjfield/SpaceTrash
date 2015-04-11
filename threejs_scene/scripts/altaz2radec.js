//var RA;
//var DEC;
//http://bado-shanai.net/Astrogation/astrogCoordConvEqns.htm
//https://casper.berkeley.edu/astrobaki/index.php/Coordinates#2.3_EQUATORIAL_to_GALACTIC.
//http://idlastro.gsfc.nasa.gov/ftp/pro/astro/

//http://vfacstaff.ltu.edu/lshamir/


//http://www.robertmartinayers.org/tools/coordinates.html


function altaz2radec(latitude,alt, az,RA, DEC)

{  var cosRA,sinDEC,sidereal;

    //sidereal = 10.66666666;
    if (az==180) az=180.1;
    sinDEC=Math.cos(Math.radians(az))*Math.cos(Math.radians(alt))*Math.cos(Math.radians(latitude))+Math.sin(Math.radians(alt))*Math.sin(Math.radians(latitude));
    DEC=Math.asin(sinDEC);
    cosRA=(Math.sin(Math.radians(alt))-Math.sin(DEC)*Math.sin(Math.radians(latitude)))/(Math.cos(DEC)*Math.cos(Math.radians(latitude)));
    RA=Math.degrees(Math.acos(cosRA));
    if (Math.sin(Math.radians(az))>0) RA=360-RA;
    //RA = sidereal;
    //RA=julian2sidereal(current_date,location)-(RA/15);
    RA= (15+(41.5/60))-(RA/15);
    if (RA<0) RA=RA+24;
    DEC=(Math.degrees((DEC)));
    
    //RETURN RA DEC AS ARRAY FORMATTED SAME AS XRADEC
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

 var galac = Transform (xradec, JtoG);

 console.log(galac);

/*****************************************************************************/
/*           **************** julian2sidereal ****************               */
/* purpose: get the sidereal time in a specific location at a specific time
   input: tjd - julian date.
          location - the specific location.
   output: the sidereal time (in hours).
*/
/*
double julian2sidereal(double tjd,site_info *location)
{  double mobl,tobl,eq,dpsi,deps,gst;
   // get the greenwich sidereal time 
   earthtilt(tjd,&mobl,&tobl,&eq,&dpsi,&deps);
   sidereal_time(0,tjd,eq,&gst);
   // compute and return the sidereal time of the location 
   gst+=(((double)location->longitude)/360.0)*24.0;
   if (gst<0) gst=24+gst;
   if (gst>=24) gst=gst-24;
   return(gst);
}

/*