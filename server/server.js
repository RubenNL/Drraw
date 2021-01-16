const Game=require('./Game');
const AutoDisconnect=require('./AutoDisconnect')
let games={}
module.exports=(app,wss)=>{
	wss.on('connection',(ws,req)=>{
		ws.autoDisconnect=new AutoDisconnect(ws)
		ws.send=(_super=>{ //rewrite to always JSON stringify(source: https://stackoverflow.com/a/49862009)
			return function() {
				arguments[0]=JSON.stringify(arguments[0])
				return _super.apply(this, arguments);
			}
		})(ws.send);
		ws.gameId=req.url.split('=')[1];
		if(!games[ws.gameId]) {
			games[ws.gameId]=new Game(ws)
			games[ws.gameId].delete=()=>delete games[ws.gameId]
		} else games[ws.gameId].addPlayer(ws)
		ws.game=games[ws.gameId]
	});
	return Promise.resolve();
}
