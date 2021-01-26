window.canvassize = 800
import 'js/app-chat.js'
import 'js/app-playerlist.js'
import 'js/app-canvas.js'
import dialogPolyfill from 'dialog-polyfill'
const dialog = document.querySelector('dialog')
dialogPolyfill.registerDialog(dialog)
const gameId = location.hash.split('#')[1] || prompt('gameId?', Math.random().toString(36).substring(7))
if (!gameId) {
	alert('geen game ID!')
	throw new Error()
}
location.hash = '#' + gameId
const name = window.sessionStorage.getItem('name') || prompt('naam?')
if (!name) {
	alert('geen naam!')
	throw new Error()
}
window.sessionStorage.setItem('name', name)
document.querySelector('#start').onclick = () => {
	const timer = parseInt(prompt('seconde per beurt?'))
	if (!timer || timer < 5) {
		alert('Ongeldige tijd!')
		return
	}
	ws.send({start: {timer}})
}
const ws = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + (location + '').split('/')[2] + '/?game=' + gameId)
ws.oldSend = ws.send
ws.send = message => ws.oldSend(JSON.stringify(message))
ws.addEventListener('open', () => {
	ws.send({name})
	setInterval(() => ws.send({}), 45000) //keepalive for heroku: https://devcenter.heroku.com/articles/http-routing#timeouts
})
ws.addEventListener('close', event => {
	if (event.reason) alert('verbinding verbroken:\n' + event.reason)
	else alert('verbinding verbroken, geen reason opgegeven.')
})
ws.addEventListener('message', event => {
	const data = JSON.parse(event.data)
	if (data.words) {
		dialog.innerHTML = '<button style="display:none"></button>' + data.words.map(word => `<button tabindex="-1" onclick="wordClick('${word}')">${word}</button>`).join('')
		dialog.showModal()
	}
	if (data.word) document.querySelector('#word').innerText = data.word
	if (data.timer) document.querySelector('#timer').innerText = data.timer
	switch (data.action) {
		case 'start':
			document.querySelector('#start').disabled = true
			break
		case 'endDraw':
			break
	}
	document.querySelector('app-chat').onMessage(data)
	document.querySelector('app-playerlist').onMessage(data)
	document.querySelector('app-canvas').onMessage(data)
})
window.wordClick = word => {
	ws.send({word})
	dialog.close()
}
document.querySelector('app-chat').addEventListener('ws-send', e => ws.send(e.detail))
document.querySelector('app-canvas').addEventListener('ws-send', e => ws.send(e.detail))
document.querySelector('app-chat').style.height = window.canvassize
document.querySelector('app-playerlist').style.height = window.canvassize
