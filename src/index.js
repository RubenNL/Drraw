document.querySelector('#colorSelect').innerHTML=['red','blue','green','yellow'].map(color=>`<option value="${color}">${color}</option>`).join('')
const ws=new WebSocket('ws://localhost:8000');
ws.addEventListener('open', function (event) {
	console.log('connected!')
});
ws.addEventListener('message', function (event) {
	console.log('Message from server ', event.data);
	data=JSON.parse(event.data)
	switch(data.action) {
		case 'draw':
			draw(data.positions.first,data.positions.second);
			break;
		case 'clear':
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			break;
		case 'color':
			line.strokeStyle=data.color;
			break;
	}	
});

document.body.style.margin = 0;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let pos = { x: 0, y: 0 };
let line = {lineWidth: 5,strokeStyle:'red'}
canvas.addEventListener('mousemove', send);
canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mouseenter', setPosition);
const rect = canvas.getBoundingClientRect(),
scaleX = canvas.width / rect.width,
scaleY = canvas.height / rect.height;
function setPosition(evt) {
	pos={
		x: (evt.clientX - rect.left) * scaleX,
		y: (evt.clientY - rect.top) * scaleY
	}
}
function send(e) {
	if (e.buttons !== 1) return;
	first=JSON.parse(JSON.stringify(pos));
	setPosition(e);
	second=pos;
	ws.send(JSON.stringify({action:'draw',positions:{first:first,second:second}}))
}
function draw(first,second) {
	ctx.beginPath();
	ctx.lineWidth = line.lineWidth;
	ctx.lineCap = 'round';
	ctx.strokeStyle = line.strokeStyle;
	ctx.moveTo(first.x, first.y);
	ctx.lineTo(second.x, second.y);
	ctx.stroke();
}
function updateColor(event) {
	ws.send(JSON.stringify({action:'color',color:event.value}))
}
