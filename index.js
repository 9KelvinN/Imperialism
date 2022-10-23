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
	troopCount: 0,
	isCapitol: false
}
const landTile = {
	isWater: false,
	owner: -1,
	troopCount: 0,
	isCapitol: false
}
const player1Tile = {
	isWater: false,
	owner: 0,
	troopCount: 1,
	isCapitol: false
}
const player1Capitol = {
	isWater: false,
	owner: 0,
	troopCount: 1,
	isCapitol: true
}
const player2Tile = {
	isWater: false,
	owner: 1,
	troopCount: 1,
	isCapitol: false
}
const player2Capitol = {
	isWater: false,
	owner: 1,
	troopCount: 1,
	isCapitol: true
}

const twoPlayerBoard = [
	[10, 1,-1, 0, 0, 0,-1, 0, 0, 0],
	[ 1, 1,-1, 0, 0, 0, 0,-1, 0, 0],
	[-1,-1,-1,-1,-1,-1,-1,-1,-1, 0],
	[ 0, 0,-1,-1, 0, 0,-1,-1, 0,-1],
	[ 0, 0,-1, 0, 0,-1, 0,-1, 0, 0],
	[ 0, 0,-1, 0,-1, 0, 0,-1, 0, 0],
	[-1, 0,-1,-1, 0, 0,-1,-1, 0, 0],
	[ 0,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	[ 0, 0,-1, 0, 0, 0, 0,-1, 2, 2],
	[ 0, 0, 0,-1, 0, 0, 0,-1, 2,20],
]

var moveCount = 0;
var board = [];
const playerCount = 2;
var deployableTroops = [];
var completedIslands = [];
var troopsPerCompletedIsland = 3;

function generateBoard(){
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
				case 10:
					newTile = {...player1Capitol};
					break;	
				case 20:
					newTile = {...player2Capitol};
					break;				
			}
			board[i][j] = newTile;
		}
	}
	for (var i = 0; i < playerCount; i++){
		deployableTroops[i] = 5;
	}
	for (var i = 0; i < playerCount; i++){
		completedIslands[i] = 1;
	}
}


// Move {type: (nothing =0, deploy=1, move=2, update deployable), originTile, destTile, troopCount:0}
function processMoves(moves){
	moveCount++;
	var differences = [];
	if (moveCount %2 ==0){
		for (var i = 0; i < playerCount; i++){
			processMove(moves[i], i, differences);
		}
	} else {
		for (var i = playerCount-1; i >= 0; i--){
			processMove(moves[i], i, differences);
		}
	}
	for (var i = 0; i < playerCount; i++){
		deployableTroops[i]+= 2 + 3 * completedIslands[i];
	}
	differences.push(deployableTroops);
	// last param will be updated deployables. rest will be List of moves.
	return differences; 
}

function processMove(move, curPlayer, differences){
	// If the move is a deploy, the player has enough troops to deploy, and the player owns the tile (another player could've captured the tile in the previous move)
	if (move.type == 1 && move.troopCount <= deployableTroops[curPlayer] && board[move.destTile.x][move.destTile.y].owner == curPlayer){
		deployableTroops[curPlayer]-= move.troopCount;
		board[move.destTile.x][move.destTile.y].troopCount += move.troopCount;
		differences.push(board[move.destTile.x][move.destTile.y]);
	} else if(move.type == 2 && board[move.originTile.x][move.originTile.y].owner == curPlayer){
		var troopsToMove = Math.min(move.troopCount, board[move.originTile.x][move.originTile.y].troopCount -1);
		if (board[move.destTile.x][move.destTile.y].owner == curPlayer){
			board[move.originTile.x][move.originTile.y].troopCount-= troopsToMove;
			board[move.destTile.x][move.destTile.y].troopCount += troopsToMove;
		} else {
			board[move.originTile.x][move.originTile.y].troopCount-= troopsToMove;
			if (troopsToMove > board[move.destTile.x][move.destTile.y].troopCount){
				
				if (!board[move.destTile.x][move.destTile.y].isWater){
					var oldOwner = board[move.destTile.x][move.destTile.y].owner;
					if (isCompletedIsland({x: move.destTile.x, y:move.destTile.y}, oldOwner)){
						completedIslands[oldOwner]--;
					}
					board[move.destTile.x][move.destTile.y].troopCount = troopsToMove - board[move.destTile.x][move.destTile.y].troopCount;
					board[move.destTile.x][move.destTile.y].owner = curPlayer;
					if (isCompletedIsland({x: move.destTile.x, y:move.destTile.y}, curPlayer)){
						completedIslands[curPlayer]++;
					}
					if(board[move.destTile.x][move.destTile.y].isCapitol){
						gameOver(curPlayer);
					}
				} else {
					board[move.destTile.x][move.destTile.y].troopCount = troopsToMove - board[move.destTile.x][move.destTile.y].troopCount;
					board[move.destTile.x][move.destTile.y].owner = curPlayer;
				}
				
			} else {
				board[move.destTile.x][move.destTile.y].troopCount -= troopsToMove;
			}
		}
		differences.push(board[move.originTile.x][move.originTile.y]);
		differences.push(board[move.destTile.x][move.destTile.y]);
	} // Else skip

}

// function coalesce(eliminee, eliminator){
	
// }

function isCompletedIsland(coord, curPlayer){
	const boardLen = board.length
	var visited = []
	for (var i=0; i< boardLen; i++){
		for (var j=0; j< boardLen; j++){
			visited[i][j] = false;
		}
	}
	return dfs(coord, curPlayer, visited)
}

const dx = [-1,1,0,0];
const dy = [0,0,-1,1];

function dfs(coord, curPlayer, visited){
	if (isOutOfBounds(coord) || board[coord.x][coord.y].isWater || visited[coord.x][coord.y]){
		return true;
	} else if(board[coord.x][coord.y].owner != curPlayer){
		return false;
	} else {
		visited[coord.x][coord.y] = true;
		for (var i =0; i< dx.length; i++){
			if(!dfs({x: coord.x + dx[i], y: coord.y + dy[i]}, curPlayer, visited)){
				return false;
			}
		}
		return true;
	}
}

function isOutOfBounds(coord){
	if (coord.x >= board.length || coord.x < 0 || coord.y >= board.length || coord.y < 0){
		return true;
	}
	return false;
}

function gameOver(winner){

}