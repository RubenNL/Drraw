import dialogPolyfill from 'dialog-polyfill'
import flood from './flood.js'
import 'fa-icons'
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
document.querySelector('#color').innerHTML = ['red', 'blue', 'green', 'yellow', 'black', 'brown', 'white'].map(color => `<label style="background-color: ${color}"><input name="color" type="radio" value="${color}"></label>`).join('')
document.querySelector('#width').innerHTML = [1, 2, 3, 4, 5, 10, 20, 50, 100, 200, 400].map(width => `<option ${width == 20 ? 'selected' : ''} value="${width}">${width}</option>`).join('')
document.querySelector('#start').onclick = () => {
	const timer = parseInt(prompt('seconde per beurt?'))
	if (!timer || timer < 5) {
		alert('Ongeldige tijd!')
		return
	}
	ws.send({start: {timer}})
}
document.querySelector('#clear').onclick = () => ws.send({gameAction: 'clear'})
document.querySelector('#chatInput').onkeydown = event => {
	if (event.key != 'Enter') return
	ws.send({chat: document.querySelector('#chatInput').value})
	document.querySelector('#chatInput').value = ''
}
let id = 0
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
let drawer = false
function stripHtml(html) {
	let tmp = document.createElement('DIV')
	tmp.innerHTML = html
	return tmp.textContent || tmp.innerText || ''
}
ws.addEventListener('message', event => {
	const data = JSON.parse(event.data)
	if (data.id) id = data.id
	if (data.draw) draw(data.draw)
	if (data.words) {
		dialog.innerHTML = data.words.map(word => `<button onclick="wordClick('${word}')">${word}</button>`).join('')
		dialog.showModal()
	}
	if (data.word) document.querySelector('#word').innerText = data.word
	if (data.timer) document.querySelector('#timer').innerText = data.timer
	if (data.chat) {
		const chatDiv = document.querySelector('#chat')
		chatDiv.innerHTML += `<span><b>${data.chat.from}</b>: ${stripHtml(data.chat.message)}</b></span><br>`
		chatDiv.scrollTop = chatDiv.scrollHeight
	}
	if (data.players) {
		document.querySelector('#players').innerHTML = data.players
			.map(
				(player, playerId) => `
			<div class="player ${playerId == id ? 'me' : 'other'} ${player.correct ? 'correct' : 'incorrect'} ${player.drawer ? 'drawer' : 'notdrawing'}">
				name: ${player.name}<br>
				score: ${player.score}<br>
			</div>
		`
			)
			.join('')
	}
	if (data.drawer) drawer = data.drawer.status
	switch (data.action) {
		case 'start':
			document.querySelector('#start').disabled = true
			break
		case 'clear':
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			break
		case 'endDraw':
			break
	}
})
window.wordClick = word => {
	ws.send({word})
	dialog.close()
}
document.querySelector('#chat').style.height = document.querySelector('canvas').height - document.querySelector('#chatInput').offsetHeight
document.querySelector('#players').style.height = document.querySelector('canvas').height
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
let pos = {x: 0, y: 0}
canvas.addEventListener('mousemove', send)
canvas.addEventListener('touchmove', e => send({buttons: 1, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}))
canvas.addEventListener('touchstart', e => setPosition({clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}))
canvas.addEventListener('mousedown', setPosition)
canvas.addEventListener('mouseenter', setPosition)
canvas.addEventListener('click', click)
function setPosition(evt) {
	if (evt.buttons !== 1) return
	const rect = canvas.getBoundingClientRect()
	const scaleX = canvas.width / rect.width
	const scaleY = canvas.height / rect.height
	pos = {
		x: (evt.clientX - rect.left) * scaleX,
		y: (evt.clientY - rect.top) * scaleY,
	}
}
function click(evt) {
	if (!drawer) return
	setPosition(evt)
	let color = document.querySelector('[name="color"]:checked').value
	if (document.querySelector('#erase').checked) color = 'white'
	if (document.querySelector('#flood').checked)
		ws.send({
			draw: {
				action: 'flood',
				color,
				pos,
			},
		})
	else
		ws.send({
			draw: {
				action: 'dot',
				color,
				width: document.querySelector('#width').value,
				pos,
			},
		})
}
function send(e) {
	if (!drawer) return
	if (e.buttons !== 1) return
	if (document.querySelector('#flood').checked) return
	let color = document.querySelector('[name="color"]:checked').value
	if (document.querySelector('#erase').checked) color = 'white'
	const first = JSON.parse(JSON.stringify(pos))
	setPosition(e)
	const second = pos
	ws.send({
		draw: {
			action: 'line',
			first: first,
			second: second,
			color: color,
			width: document.querySelector('#width').value,
		},
	})
}
function draw({action, ...data}) {
	if (action == 'flood') flood(data, canvas)
	if (action == 'line') drawLine(data)
	if (action == 'dot') drawDot(data)
}
function drawLine({first, second, color, width}) {
	ctx.beginPath()
	ctx.lineWidth = width
	ctx.lineCap = 'round'
	ctx.strokeStyle = color
	ctx.moveTo(first.x, first.y)
	ctx.lineTo(second.x, second.y)
	ctx.stroke()
}
function drawDot({pos, width, color}) {
	ctx.beginPath()
	ctx.arc(pos.x, pos.y, width / 2, 2 * Math.PI, false)
	ctx.fillStyle = color
	ctx.fill()
}
