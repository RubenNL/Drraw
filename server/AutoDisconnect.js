module.exports=class AutoDisconnect {
	constructor(ws) {
		this.ws=ws;
		const resetTimeout=this.resetTimeout
		this.ws.send=(_super=>{
			return function() {
				resetTimeout();
				return _super.apply(this, arguments);
			}
		})(this.ws.send);
		this.disconnectTimeout='';
		this.resetTimeout();
		this.ws.on('message',message=>{
			if(message.length>0) this.resetTimeout()
		})
		this.ws.on('close',()=>clearTimeout(this.resetTimeout))
	}
	resetTimeout=()=>{
		clearTimeout(this.disconnectTimeout)
		this.disconnectTimeout=setTimeout(()=>this.ws.close(4321,'Te lang inactief!'),1000*60*3);
	}
}
