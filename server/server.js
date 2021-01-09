const Game=require('./Game');
games={}
module.exports=(app,wss)=>{
	wss.on('connection',(ws,req)=>{
		ws.oldSend=ws.send;
		ws.send=message=>ws.oldSend(JSON.stringify(message))
		ws.gameId=req.url.split('=')[1];
		if(!games[ws.gameId]) {
			games[ws.gameId]=new Game(ws)
			games[ws.gameId].delete=()=>delete games[ws.gameId]
		} else games[ws.gameId].addPlayer(ws)
		ws.game=games[ws.gameId]
	});
	return Promise.resolve();
}
