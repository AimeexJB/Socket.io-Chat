// server.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('server running..')

app.use(express.static(__dirname + '/public')); 

app.get('/', function(req, res, next) {
	res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	io.emit(socket.username, 'Connected');
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data) {
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		io.emit(socket.username, 'Disconnected');
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	//Send Message
	socket.on('send message', function(data){
		io.sockets.emit('new message', {msg: data, user:socket.username});
	});

	// socket.on('user typing', function(data){
	// 	socket.broadcast.emit(socket.username, 'is typing' );
	// });

	//New User
	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	})

	function updateUsernames(){
		io.emit('get users', users)
	}
	

});