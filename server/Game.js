const grabWords=require('./words')
module.exports=class Game {
	constructor(player) {
		this.players=[]
		this.drawer=null;
		this.word='';
		this.drawerId=0;
		this.closed=false;
		this.interval='';
		this.addPlayer(player)
	}
	addPlayer(player) {
		player.score=0;
		if(this.drawer) {
			player.close(4321,'game al gestart!')
			return
		}
		this.players.push(player)
		player.send({id:this.players.indexOf(player)})
		this.sendPlayerStats();
		player.on('message',message=>{
			message=JSON.parse(message)
			if(message.name) {
				player.name=message.name;
				this.sendPlayerStats();
			}
			if(message.chat) {
				if(message.chat==this.word) {
					if(player.correct) player.send({chat:{from:'GAME',message:'nope. geen gratis punten :)'}})
					else {
						this.sendAll({chat:{from:'GAME',message:player.name+' heeft het juiste woord geraden!'}})
						player.score+=this.timer;
						player.correct=true;
						player.send({word:this.word})
						this.sendPlayerStats();
						if(this.players.every(player=>player.correct)) this.endDraw()
					}
				} else this.sendAll({chat:{from:player.name,message:message.chat}})
			}
			if(message.draw&&this.drawer==player) this.sendAll({draw:message.draw})
			if(message.word&&this.drawer==player) {
				this.word=message.word;
				this.sendAll({action:'clear',word:this.word.split('').map(char=>'_').join(' ')})
				this.drawer.send({word:this.word})
				this.interval=setInterval(()=>{
					this.timer--;
					this.sendAll({timer:this.timer})
					if(this.timer==0) this.endDraw();
				},1000)
			}
			switch(message.gameAction) {
				case 'start':
					if(this.drawer) return;
					this.sendAll({action:'start'})
					this.nextDrawer();
					break;
				case 'clear':
					if(this.drawer!=player) return
					this.sendAll({action:'clear'})
					break;
			}
		})
		player.on('close',()=>{
			this.players.splice(this.players.indexOf(player), 1);
			if(this.closed) return;
			this.closed=true;
			this.players.forEach(sendTo=>sendTo.close(4322,player.name+' left!'));
			clearTimeout(this.interval);
			this.delete();
		})
	}
	nextDrawer() {
		this.drawerId++;
		if(!this.players[this.drawerId]) this.drawerId=0;
		this.drawer=this.players[this.drawerId]
		this.drawer.send({words:grabWords(3)})
		this.players.forEach(player=>player.correct=false)
		this.drawer.correct=true;
		this.timer=60;
		this.sendAll({timer:this.drawer.name+' Kiest een woord...'})
		this.sendPlayerStats();
	}
	endDraw() {
		clearInterval(this.interval);
		this.sendAll({action:'endDraw',word:this.word})
		this.nextDrawer()
	}
	sendPlayerStats() {
		this.sendAll({players:this.players.map(player=>{
			return {
				name:player.name,
				score:player.score,
				correct:player.correct,
				drawer:player==this.drawer
			}
		})})
	}
	sendAll(message) {
		this.players.forEach(player=>player.send(message))
	}
}
