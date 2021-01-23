import {LitElement, html, css} from 'lit-element'

export class AppChat extends LitElement {
	render() {
		return html`<div id="chat"></div>
			<input id="chatInput" />`
	}
	stripHtml(html) {
		let tmp = document.createElement('DIV')
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText || ''
	}
	onMessage(data) {
		if (data.chat) {
			const chatDiv = this.shadowRoot.querySelector('#chat')
			chatDiv.innerHTML += `<span><b>${data.chat.from}</b>: ${this.stripHtml(data.chat.message)}</b></span><br>`
			chatDiv.scrollTop = chatDiv.scrollHeight
		}
	}
	firstUpdated() {
		this.shadowRoot.querySelector('#chat').style.height = document.querySelector('canvas').height - this.shadowRoot.querySelector('#chatInput').offsetHeight
		this.shadowRoot.querySelector('#chatInput').onkeydown = event => {
			if (event.key != 'Enter') return
			this.dispatchEvent(new CustomEvent('ws-send', {detail: {chat: this.shadowRoot.querySelector('#chatInput').value}}))
			this.shadowRoot.querySelector('#chatInput').value = ''
		}
	}
	static get styles() {
		return css`
			#chat {
				overflow-y: scroll;
			}
		`
	}
}
customElements.define('app-chat', AppChat)
