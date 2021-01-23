import {LitElement, html, css} from 'lit-element'

export class AppPlayerlist extends LitElement {
	constructor() {
		super()
		this.id = 0
	}
	render() {
		return html`<div id="players" />`
	}
	onMessage(data) {
		if (data.id) this.id = data.id
		if (data.players) {
			this.shadowRoot.querySelector('#players').innerHTML = data.players
				.map(
					(player, playerId) => `
						<div class="player ${playerId == this.id ? 'me' : 'other'} ${player.correct ? 'correct' : 'incorrect'} ${player.drawer ? 'drawer' : 'notdrawing'}">
							name: ${player.name}<br>
							score: ${player.score}<br>
						</div>`
				)
				.join('')
		}
	}
	static get styles() {
		return css`
			.correct {
				background-color: green;
			}
			.drawer {
				background-color: yellow !important;
			}
		`
	}
}
customElements.define('app-playerlist', AppPlayerlist)
