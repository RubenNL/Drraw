const grabWords=require('./words')
module.exports=class Game {
	constructor(player) {
		this.players=[]
		this.addPlayer(player)
		this.drawer=null;
		this.word='';
	}
	addPlayer(player) {
		if(this.drawer) {
			player.close(4321,'game al gestart!')
			return
		}
		this.players.push(player)
		player.on('message',message=>{
			message=JSON.parse(message)
			if(message.chat) {
				if(message.chat==this.word) this.sendAll({chat:{from:'GAME',message:player.name+' guessed correct!'}})
				else this.sendAll({chat:{from:player.name,message:message.chat}})
			}
			if(message.draw&&this.drawer==player) this.sendAll({draw:message.draw})
			if(message.word&&this.drawer==player) {
				this.word=message.word;
				this.sendAll({word:this.word.split('').map(char=>'_').join(' ')})
				this.drawer.send({word:this.word})
			}
			switch(message.gameAction) {
				case 'start':
					if(this.drawer) return;
					this.sendAll({action:'start'})
					this.nextDrawer();
					break;
			}
		})
	}
	nextDrawer() {
		this.drawer=this.players[0]
		this.drawer.send({words:grabWords(3)})
		this.sendAll({drawer:this.drawer.name})
	}
	sendAll(message) {
		this.players.forEach(player=>player.send(message))
	}
}
