const grabWords = require('./words')
module.exports = class Game {
	constructor(player) {
		this.players = []
		this.drawer = null
		this.word = ''
		this.interval = ''
		this.addPlayer(player)
		this.replay = []
		this.startTimer = 0
	}
	addPlayer(player) {
		player.score = 0
		this.players.push(player)
		player.send({id: this.players.indexOf(player)})
		this.sendPlayerStats()
		if (this.drawer) this.replay.forEach(action => player.send({draw: action}))
		player.on('message', message => {
			message = JSON.parse(message)
			if (message.name) {
				player.name = message.name
				this.sendAll({chat: {from: 'GAME', message: player.name + ' joined the game!'}})
				this.sendPlayerStats()
			}
			if (message.chat) {
				if (message.chat == this.word) {
					if (player.correct) player.send({chat: {from: 'GAME', message: 'nope. geen gratis punten :)'}})
					else {
						this.sendAll({chat: {from: 'GAME', message: player.name + ' heeft het juiste woord geraden!'}})
						player.score += this.timer
						player.correct = true
						player.send({word: this.word})
						this.sendPlayerStats()
						if (this.players.every(player => player.correct)) this.endDraw()
					}
				} else this.sendAll({chat: {from: player.name, message: message.chat}})
			}
			if (message.draw && this.drawer == player) {
				this.replay.push(message.draw)
				this.sendAll({draw: message.draw})
			}
			if (message.word && this.drawer == player) {
				this.replay = []
				this.word = message.word
				this.players.forEach(player => (player.correct = false))
				this.drawer.correct = true
				this.sendAll({
					action: 'clear',
					word: this.word
						.split('')
						.map(() => '_')
						.join(' '),
					chat: {from: 'GAME', message: player.name + ' heeft een woord gekozen!'},
				})
				this.drawer.send({word: this.word})
				this.interval = setInterval(() => {
					this.timer--
					this.sendAll({timer: this.timer})
					if (this.timer == 0) this.endDraw()
				}, 1000)
			}
			if (message.start && !this.drawer) {
				this.startTimer = message.start.timer
				this.sendAll({action: 'start'})
				this.nextDrawer()
			}
			switch (message.gameAction) {
				case 'clear':
					if (this.drawer != player) return
					this.sendAll({action: 'clear'})
					this.replay = []
					break
			}
		})
		player.on('close', () => {
			this.players.splice(this.players.indexOf(player), 1)
			this.sendAll({chat: {from: 'GAME', message: player.name + ' left the game!'}})
			this.sendPlayerStats()
			if (player == this.drawer) this.nextDrawer()
		})
	}
	nextDrawer() {
		clearTimeout(this.interval)
		if (this.players.length == 0) {
			this.delete()
			return
		}
		let drawerId = this.players.indexOf(this.drawer) + 1
		if (!this.players[drawerId]) drawerId = 0
		this.drawer = this.players[drawerId]
		this.drawer.send({words: grabWords(3)})
		this.timer = this.startTimer
		this.sendAll({timer: this.drawer.name + ' Kiest een woord...', chat: {from: 'GAME', message: this.drawer.name + ' Kiest een woord...'}})
		this.sendPlayerStats()
	}
	endDraw() {
		clearInterval(this.interval)
		this.sendAll({action: 'endDraw', word: this.word})
		this.nextDrawer()
	}
	sendPlayerStats() {
		this.sendAll({
			players: this.players.map(player => {
				return {
					name: player.name,
					score: player.score,
					correct: player.correct,
					drawer: player == this.drawer,
				}
			}),
		})
	}
	sendAll(message) {
		this.players.forEach(player => player.send(message))
	}
}
