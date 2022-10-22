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

const waterTile = {
	isWater: true,
	owner: -1,
	troopCount: 0
}
const landTile = {
	isWater: false,
	owner: -1,
	troopCount: 0
}
const player1Tile = {
	isWater: false,
	owner: 1,
	troopCount: 1
}
const player2Tile = {
	isWater: false,
	owner: 2,
	troopCount: 1
}

const twoPlayerBoard = [
	[ 1, 1,-1, 0, 0, 0,-1, 0, 0, 0],
	[ 1, 1,-1, 0, 0, 0, 0,-1, 0, 0],
	[-1,-1,-1,-1,-1,-1,-1,-1,-1, 0],
	[ 0, 0,-1,-1, 0, 0,-1,-1, 0,-1],
	[ 0, 0,-1, 0, 0, 0, 0,-1, 0, 0],
	[ 0, 0,-1, 0, 0, 0, 0,-1, 0, 0],
	[-1, 0,-1,-1, 0, 0,-1,-1, 0, 0],
	[ 0,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	[ 0, 0,-1, 0, 0, 0, 0,-1, 2, 2],
	[ 0, 0, 0,-1, 0, 0, 0,-1, 2, 2],
]

function generateBoard(){
	const board = [];
	const boardLen = twoPlayerBoard.length
	for (var i=0; i< boardLen; i++){
		for (var j=0; j< boardLen; j++){
			var newTile;
			switch (twoPlayerBoard[i][j]){
				case -1:
					newTile = {...waterTile};
					break;
				case 0:
					newTile = {...landTile};
					break;
				case 1:
					newTile = {...player1Tile};
					break;
				case 2:
					newTile = {...player2Tile};
					break;					
			}
			board[i][j] = newTile;
		}
	}
}

var isOdd
function newMove(moves, curBoard){
	
}