const express = require('express');

const app = express();
app.use(express.static('public'));

const server = require('http').createServer(app);
const io     = require('socket.io')(server);

io.on("connection", (socket) => {
		// send a message to the client
		socket.emit("hello from server", { whatever: "some data" });

		// receive a message from the client
		socket.on("hello from client", (...args) => {
				console.log(`got hello from client ${args}`);
		});
});

server.listen(3000);
