/*************************************
//
// procurifypix app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

var runningPortNumber = process.env.PORT || 1337;


// app.configure(function(){
// 	app.use(device.capture());
// });


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
	res.render('index', {});
});

app.get("/provider", function(req, res){
	res.render('provider', {});
});

io.on('connection', function (socket) {

});

var ProcurifyPIX = {
	check_ready : function(room){
		var providers_room = io.of('/provider').in(room);
		var receivers_room = io.of('/receiver').in(room);

		if(providers_room.clients().length > 0 && receivers_room.clients().length > 0){
			for (var i = 0; i < providers_room.clients().length; i++) {
				var provider = providers_room.clients()[i];

				provider.emit('ready', {});
			};

			for (var i = 0; i < receivers_room.clients().length; i++) {
				var recceiver = receivers_room.clients()[i];

				recceiver.emit('ready', {});
			};
		}
	}
}

io.of('/receiver').on('connection', function(socket){
	socket.emit('log', 'Reciever Connected: ' + socket.id);

	socket.on('subscribe', function(data, fn){
		socket.emit('log', 'Reciever Joined Room: ' + data.user);
		socket.join(data.user);

		ProcurifyPIX.check_ready(data.user);
	});
});

io.of('/provider').on('connection', function(socket){
	socket.emit('log', 'Provider Connected: ' + socket.id);

	socket.on('provide', function(data, fn){
		socket.emit('log', 'Provider Joined Room: ' + data.user);
		socket.join(data.user);

		ProcurifyPIX.check_ready(data.user);
	});
});


server.listen(runningPortNumber);

