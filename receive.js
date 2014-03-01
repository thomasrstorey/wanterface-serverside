//receive.js

var net = require('net'),
	converter = require('./converter.js'),
	fs = require('node-fs'),
	gm = require('gm');

///////////////////////////////////////
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {       
      var reg = new RegExp("\\{" + i + "\\}", "gm");             
      s = s.replace(reg, arguments[i + 1]);
  }
  return s;
}
///////////////////////////////////////
	
var clients = [];
var HOST = '128.227.217.26';
var PORT = 8124;



net.createServer(function (socket){

	socket.name = socket.remoteAddress + ":" + socket.remotePort;
	clients.push(socket);

	socket.on('data', function(data){
		bufferString = data.toString('utf8', 0, data.length);

		var array = bufferString.split(",");
		var lat = parseFloat(array[0]);
		var lon = parseFloat(array[1]);
		console.log("received data\n");
		console.log("lat = " + lat + "\n");
		console.log("lon = " + lon + "\n");
		makeDirectories(lat, lon);
		if(socket.write('done', function(){

			console.log('finished');
			var now = new Date();
			console.log("time: "+now.getUTCHours()+":"+now.getUTCMinutes()+":"+now.getUTCSeconds());

		})){
			console.log('responded');
		} else{
			console.log('failed');
		}
	});

	socket.on('end', function(){
		clients.splice(clients.indexOf(socket), 1);
	});

	socket.on('error', function(exc){
		console.log('ignoring exception: ' + exc);
	});

}).listen(PORT, HOST);

function makeDirectories(lat, lon){

	for(var z = 0; z <= 21; z++){
			(function(z){
				var tile = converter.convert({
					lon: lon,
					lat: lat
					}, z);
				var rtile = converter.tmsconvert({
					lon: lon,
					lat: lat
				}, 21);
				var revealed = converter.revealedZone(rtile, z);
				var path = String.format('../Sites/unkn_own/tiles/{0}/{1}/{2}',
				z.toString(), tile.tx.toString(), tile.ty.toString());
				//console.log(path + "\n");

				fs.mkdir(path, 0777, true, function(e){
					if(!e){
						var filepath = path + "/" + tile.tx + "_" + tile.ty + ".png";
						console.log(filepath);
						fs.exists(filepath, function(exists){

							if(exists){
								
								gm(filepath)
								.fill("#FFF")
								.drawRectangle(revealed.pixelMin.px%256, 256-(revealed.pixelMin.py%256),
									(revealed.pixelMax.px-1)%256, 256-((revealed.pixelMax.py-1)%256))
								.transparent("#FFF")
								.write(filepath, function(e){
									if(!e){ 
											//console.log(path + '\n');
											//console.log('modified old file' + z);
									} else console.log(e);
								});
							} 

							else{
								gm(256, 256, "#0000")
								.write(filepath, function(e){
									if(!e){ 
											//console.log(path + '\n');
											console.log('made new file' + z);
											gm(filepath)
											.fill("#FFF")
											.drawRectangle(revealed.pixelMin.px%256, 256-(revealed.pixelMin.py%256),
												(revealed.pixelMax.px-1)%256, 256-((revealed.pixelMax.py-1)%256))
											.transparent("#FFF")
											.write(filepath, function(e){
												if(!e){ 
														//console.log(path + '\n');
														//console.log('modified old file');
												} else console.log(e);
											});
									} else console.log(e);
								});
							}

						});
						//console.log(path + '\n');
						
					} else{
						console.log(e);
					}
				});
			}(z));
		}

}

console.log("gps coord receiver server running on port " + PORT + "\n");