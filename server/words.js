const woorden=JSON.parse(require('fs').readFileSync('woorden.json','utf8'))
module.exports=aantal=>{
	let response=[]
	for(i=0;i<aantal;i++) response.push(woorden[Math.floor(Math.random()*woorden.length)])
	return response
}
