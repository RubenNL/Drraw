import {LitElement, html, css} from 'lit-element'

export class AppChat extends LitElement {
	static get properties() {
		return {
			items: {type: Array},
		}
	}

	constructor() {
		super()
		this.items = []
	}
	render() {
		return html`<div id="chat">${this.items.map(item => html`<span><b>${item.from}</b>: ${item.message}</b></span><br>`)}</div>
			<input id="chatInput" @keydown="${this.keydown}" />`
	}
	onMessage(data) {
		if (data.chat) {
			this.items.push(data.chat)
			this.requestUpdate()
		}
	}
	updated() {
		const chatDiv = this.shadowRoot.querySelector('#chat')
		chatDiv.scrollTop = chatDiv.scrollHeight
	}
	firstUpdated() {
		this.shadowRoot.querySelector('#chat').style.height = window.canvassize - this.shadowRoot.querySelector('#chatInput').offsetHeight
	}
	keydown(event) {
		if (event.key != 'Enter') return
		this.dispatchEvent(new CustomEvent('ws-send', {detail: {chat: event.target.value}}))
		event.target.value = ''
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
