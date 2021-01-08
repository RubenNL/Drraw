const http=require('http')
const express = require('express')
const WebSocket=require('ws')
const app = express()
app.use(express.json());
const server = http.createServer(app);
const wss=new WebSocket.Server({server});
const compression = require('compression')
const serveIndex = require('serve-index');
const url = require('url');
app.use(compression({filter:shouldCompress}))
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) return false
  return compression.filter(req, res)
}

app.use(express.static('output'))

require('./server/server.js')(app,wss).then(()=>{
	app.use('/code',(req,res,next)=>{
		filename=url.parse(req.url).pathname.split('/').pop()
		if(['data.db','vapidKeys.json'].includes(filename)) res.send('No access to that file! This file contains secrets used for sending notifications, or contains the server data.')
		else next()
	})
	app.use('/code',express.static(__dirname,{index:false}))
	app.use('/code', serveIndex(__dirname));
})

server.listen(process.env.PORT||8000)
