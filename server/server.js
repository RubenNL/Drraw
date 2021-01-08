module.exports=(app,wss)=>{
	wss.on('connection', function connection(ws) {
		ws.on('message', function incoming(data) {
			wss.clients.forEach(function each(client) {
				if (client.readyState === client.OPEN) client.send(data);
			});
		});
	});
	return Promise.resolve();
}
