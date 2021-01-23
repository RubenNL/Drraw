import {LitElement, html, css} from 'lit-element'

export class AppPlayerlist extends LitElement {
	static get properties() {
		return {
			players: {type: Array},
		}
	}

	constructor() {
		super()
		this.id = 0
		this.players = []
	}
	render() {
		return html`<div id="players">
			${this.players.map(
				(player, playerId) => html` <div class="player ${playerId == this.id ? 'me' : 'other'} ${player.correct ? 'correct' : 'incorrect'} ${player.drawer ? 'drawer' : 'notdrawing'}">
					name: ${player.name}<br />
					score: ${player.score}<br />
				</div>`
			)}
		</div>`
	}
	onMessage(data) {
		if (data.id) this.id = data.id
		if (data.players) this.players = data.players
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
