const Game=require('./Game');
games={}
module.exports=(app,wss)=>{
	wss.on('connection',(ws,req)=>{
		ws.oldSend=ws.send;
		ws.send=message=>ws.oldSend(JSON.stringify(message))
		ws.gameId=req.url.split('=')[1];
		if(!games[ws.gameId]) games[ws.gameId]=new Game(ws)
		else games[ws.gameId].addPlayer(ws)
		ws.game=games[ws.gameId]
		ws.on('message',message=>{
			message=JSON.parse(message)
			if(message.name) ws.name=message.name;
		})
	});
	return Promise.resolve();
}
