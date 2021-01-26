import {LitElement, html, css} from 'lit-element'
import flood from './flood.js'
import 'fa-icons'

export class AppCanvas extends LitElement {
	static get properties() {
		return {
			customColor: {type: String},
		}
	}

	constructor() {
		super()
		this.pos = {x: 0, y: 0}
		this.drawer = false
	}
	render() {
		return html`<div id="canvasoptions">
				<button id="clear" @click="${() => this.wssend({gameAction: 'clear'})}">clear screen</button>
				kleur:<span>
					${['red', 'blue', 'green', 'yellow', 'black', 'brown', 'white'].map(color => html`<label style="background-color: ${color}"><input name="color" type="radio" value="${color}" @click=${this.updateCursor} ?checked=${color == 'black'} /></label>`)}
					<input name="color" type="radio" value="${this.customColor}" @click=${this.updateCursor} /><input
						type="color"
						@change="${e => {
							this.customColor = e.target.value
							this.updateCursor()
						}}"
					/>
				</span>
				lijndikte:<select id="width">
					${[1, 2, 3, 4, 5, 10, 20, 50, 100, 200, 400].map(width => html`<option @click=${this.updateCursor} ?selected=${width == 20} value="${width}">${width}</option>`)}
				</select>
				<label><input type="radio" id="flood" name="action" /><fa-icon class="fas fa-fill"></fa-icon></label>
				<label><input type="radio" id="draw" name="action" checked /><fa-icon class="fas fa-pencil-alt"></fa-icon></label>
				<label><input type="radio" id="erase" name="action" /><fa-icon class="fas fa-eraser"></fa-icon></label>
			</div>
			<canvas height="${window.canvassize}px" width="${window.canvassize}px" @mousemove="${this.send}" @touchmove="${e => this.send({buttons: 1, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY})}" @touchstart="${e => this.setPosition({clientX: e.touches[0].clientX, clientY: e.touches[0].clientY})}" @mousedown="${this.setPosition}" @mouseenter="${this.setPosition}" @click="${this.click}"></canvas>`
	}
	updateCursor() {
		this.size = this.shadowRoot.querySelector('#width').value
		this.color = this.shadowRoot.querySelector('[name="color"]:checked').value.replace('#', '%23')
		this.shadowRoot.querySelector('canvas').style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='${this.size * 2}' width='${this.size * 2}'%3E%3Ccircle cx='${this.size}' cy='${this.size}' r='${this.size / 2}' fill='${this.color}' /%3E%3C/svg%3E") ${this.size} ${this.size}, default`
	}
	setPosition(evt) {
		if (evt.buttons !== 1) return
		const rect = this.canvas.getBoundingClientRect()
		const scaleX = this.canvas.width / rect.width
		const scaleY = this.canvas.height / rect.height
		this.pos = {
			x: (evt.clientX - rect.left) * scaleX,
			y: (evt.clientY - rect.top) * scaleY,
		}
	}
	click(evt) {
		if (!this.drawer) return
		this.setPosition(evt)
		let color = this.shadowRoot.querySelector('[name="color"]:checked').value
		if (this.shadowRoot.querySelector('#erase').checked) color = 'white'
		const pos = this.pos
		if (this.shadowRoot.querySelector('#flood').checked)
			this.wssend({
				draw: {
					action: 'flood',
					color,
					pos,
				},
			})
		else
			this.wssend({
				draw: {
					action: 'dot',
					color,
					width: this.shadowRoot.querySelector('#width').value,
					pos,
				},
			})
	}
	send(e) {
		if (!this.drawer) return
		if (e.buttons !== 1) return
		if (this.shadowRoot.querySelector('#flood').checked) return
		let color = this.shadowRoot.querySelector('[name="color"]:checked').value
		if (this.shadowRoot.querySelector('#erase').checked) color = 'white'
		const first = JSON.parse(JSON.stringify(this.pos))
		this.setPosition(e)
		const second = this.pos
		this.wssend({
			draw: {
				action: 'line',
				first: first,
				second: second,
				color: color,
				width: this.shadowRoot.querySelector('#width').value,
			},
		})
	}
	wssend(message) {
		this.dispatchEvent(new CustomEvent('ws-send', {detail: message}))
	}
	draw({action, ...data}) {
		if (action == 'flood') flood(data, this.canvas)
		if (action == 'line') this.drawLine(data)
		if (action == 'dot') this.drawDot(data)
	}
	drawLine({first, second, color, width}) {
		const ctx = this.canvas.getContext('2d')
		ctx.beginPath()
		ctx.lineWidth = width
		ctx.lineCap = 'round'
		ctx.strokeStyle = color
		ctx.moveTo(first.x, first.y)
		ctx.lineTo(second.x, second.y)
		ctx.stroke()
	}
	drawDot({pos, width, color}) {
		const ctx = this.canvas.getContext('2d')
		ctx.beginPath()
		ctx.arc(pos.x, pos.y, width / 2, 2 * Math.PI, false)
		ctx.fillStyle = color
		ctx.fill()
	}
	onMessage(data) {
		if (data.drawer) this.drawer = data.drawer.status
		if (data.draw) this.draw(data.draw)
		switch (data.action) {
			case 'clear':
				this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height)
				break
		}
	}
	updated() {}
	firstUpdated() {
		this.canvas = this.shadowRoot.querySelector('canvas')
	}
	static get styles() {
		return css`
			canvas {
				border: 1px solid red;
			}
			[name='action']:checked + fa-icon {
				background-color: red;
			}
			[name='action'] {
				display: none;
			}
		`
	}
}
customElements.define('app-canvas', AppCanvas)
