//converter.js

var mathjs = require('mathjs'),
	math = mathjs();
var tileSize = 256;
var initialResolution = 2*math.pi*6378137/tileSize;
var originShift = 2*math.pi*6378137/2.0;

function latLonToMeters(ltln){
	//Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
	var mx = ltln.lon*originShift/180.0;
	var my = math.log(math.tan((90+ltln.lat)*math.pi/360.0))/(math.pi/180.0);
	my = my*originShift/180.0;
	return {
		mx: mx,
		my: my
	};
}
function pixelsToMeters(pxpy, zoom){
	var res = resolution(zoom);
	var mx = pxpy.pbx*res-originShift;
	var my = pxpy.pby*res-originShift;
	return {
		mx: mx,
		my: my
	};
}

function metersToPixels(mxmy, zoom){
	//Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
	var res = resolution(zoom);
	var mx = mxmy.mx;
	var px = (mx + originShift)/res;
	var my = mxmy.my;
	var py = (my + originShift)/res;
	return {
		px: px,
		py: py
	};
}

function pixelsToTile(pxpy){
	//Returns a tile covering region in given pixel coordinates
	var tx = math.ceil(pxpy.px/tileSize)-1;
	var ty = math.ceil(pxpy.py/tileSize)-1;
	return{
		tx: tx,
		ty: ty
	};
}

function tileBounds(txty, zoom){
	//Returns bounds of the given tile in EPSG:900913 coordinates
	var pixelBoundsMin = {
		pbx: txty.tx*tileSize,
		pby: txty.ty*tileSize
	};
	//console.log("pbx = " +pixelBoundsMin.pbx);
	//console.log("pby = " + pixelBoundsMin.pby);
	var minx = pixelsToMeters(pixelBoundsMin, zoom).mx,
		miny = pixelsToMeters(pixelBoundsMin, zoom).my;
	//console.log("minx = " + minx);
	//console.log("miny = " + miny);
	var	pixelBoundsMax = {
		pbx: (txty.tx+1)*tileSize,
		pby: (txty.ty+1)*tileSize
	};
	var maxx = pixelsToMeters(pixelBoundsMax, zoom).mx,
		maxy = pixelsToMeters(pixelBoundsMax, zoom).my;

	return {
		minx: minx,
		miny: miny,
		maxx: maxx,
		maxy: maxy
	};
}

function googleTile(txty, zoom){
	//Converts TMS tile coordinates to Google Tile coordinates
	return {
		tx: txty.tx,
		ty: (math.pow(2, zoom) - 1) - txty.ty
	};
}

function resolution(zoom){
	//Resolution (meters/pixel) for given zoom level (measured at Equator)
	return initialResolution/math.pow(2, zoom);
}

function convert(ltln, zoom){
	var gtile = googleTile(pixelsToTile(metersToPixels(latLonToMeters(ltln),zoom)),zoom);
	//console.log("x = " + gtile.tx + "\n" );
	//console.log("y = " + gtile.ty + "\n" );
	//console.log("z = " + zoom + "\n" );
	return {
		tx: gtile.tx,
		ty: gtile.ty
	}
}

function tmsconvert(ltln, zoom){
	var tmstile = pixelsToTile(metersToPixels(latLonToMeters(ltln),zoom));
	//console.log("x = " + gtile.tx + "\n" );
	//console.log("y = " + gtile.ty + "\n" );
	//console.log("z = " + zoom + "\n" );
	return {
		tx: tmstile.tx,
		ty: tmstile.ty
	}
}

function revealedZone(txty, zoom){
	var bounds = tileBounds(txty, 21); 
	//console.log(bounds.minx + " " + bounds.miny + " " + bounds.maxx + " " + bounds.maxy + "\n");
	var min = {
		mx: bounds.minx,
		my: bounds.miny
	};
	var max = {
		mx: bounds.maxx,
		my: bounds.maxy
	};
	var pixelMin = metersToPixels(min, zoom);
	var pixelMax = metersToPixels(max, zoom);
	return {
		pixelMin: pixelMin,
		pixelMax: pixelMax
	};
}

exports.convert = convert;
exports.revealedZone = revealedZone;
exports.tmsconvert = tmsconvert;