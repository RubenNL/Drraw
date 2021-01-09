document.querySelector('#color').innerHTML=['red','blue','green','yellow'].map(color=>`<option value="${color}">${color}</option>`).join('')
document.querySelector('#width').innerHTML=[1,2,3,4,5,10,20].map(width=>`<option value="${width}">${width}</option>`).join('')
document.querySelector('#start').onclick=()=>ws.send({gameAction:'start'})
document.querySelector('#chatInput').onkeydown=event=>{
	if(event.key!='Enter') return;
	ws.send({chat:document.querySelector('#chatInput').value})
	document.querySelector('#chatInput').value='';
}
const ws=new WebSocket((location.protocol=="http:"?'ws://':'wss://')+(location+'').split('/')[2]+'/?game='+location.hash.split('#')[1]);
ws.oldSend=ws.send;
ws.send=message=>ws.oldSend(JSON.stringify(message))
ws.addEventListener('open', function (event) {
	console.log('connected!')
	ws.send({name:"testname"})
});
ws.addEventListener('close',event=>{
	if(event.reason) alert('verbinding verbroken:\n'+event.reason)
	else alert('verbinding verbroken, geen reason opgegeven.')
})
ws.addEventListener('message',event=>{
	console.log('Message from server ', event.data);
	data=JSON.parse(event.data)
	if(data.draw) draw(data.draw)
	if(data.clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
	if(data.words) ws.send({word:prompt('welk woord?\n'+data.words.join('/'))})
	if(data.word) document.querySelector('#word').innerText=data.word
	if(data.chat) document.querySelector('#chat').innerHTML+=`<span><b>${data.chat.from}</b>${data.chat.message}</b></span><br>`
});

document.body.style.margin = 0;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let pos = { x: 0, y: 0 };
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
	ws.send({draw:{
		first:first,
		second:second,
		color:document.querySelector('#color').value,
		width:document.querySelector('#width').value
	}})
}
function draw({first,second,color,width}) {
	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.lineCap = 'round';
	ctx.strokeStyle = color;
	ctx.moveTo(first.x, first.y);
	ctx.lineTo(second.x, second.y);
	ctx.stroke();
}
