//gemaakt met behulp van https://css-tricks.com/converting-color-spaces-in-javascript/ en https://codepen.io/Geeyoam/pen/vLGZzG
function getColorAtPixel(imageData, x, y) {
	const {width, data} = imageData
	return {
		r: data[4 * (width * y + x) + 0],
		g: data[4 * (width * y + x) + 1],
		b: data[4 * (width * y + x) + 2],
		a: data[4 * (width * y + x) + 3],
	}
}
function colorStringToHexRGB(name) {
	let fakeDiv = document.createElement('div')
	fakeDiv.style.color = name
	document.body.appendChild(fakeDiv)
	let cs = window.getComputedStyle(fakeDiv),
		rgb = cs.getPropertyValue('color')
	document.body.removeChild(fakeDiv)
	let sep = rgb.indexOf(',') > -1 ? ',' : ' '
	rgb = rgb.substr(4).split(')')[0].split(sep)
	let r = (+rgb[0]).toString(16),
		g = (+rgb[1]).toString(16),
		b = (+rgb[2]).toString(16)
	if (r.length == 1) r = '0' + r
	if (g.length == 1) g = '0' + g
	if (b.length == 1) b = '0' + b

	return {r, g, b}
}
function setColorAtPixel(imageData, color, x, y) {
	const {width, data} = imageData
	data[4 * (width * y + x) + 0] = color.r & 0xff
	data[4 * (width * y + x) + 1] = color.g & 0xff
	data[4 * (width * y + x) + 2] = color.b & 0xff
	data[4 * (width * y + x) + 3] = color.a & 0xff
}
function colorMatch(a, b) {
	return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}

function floodFill(imageData, newColor, x, y) {
	const {width, height} = imageData
	const stack = []
	const baseColor = getColorAtPixel(imageData, x, y)
	let operator = {x, y}

	// Check if base color and new color are the same
	if (colorMatch(baseColor, newColor)) return

	// Add the clicked location to stack
	stack.push({x: operator.x, y: operator.y})

	while (stack.length) {
		operator = stack.pop()
		let contiguousDown = true // Vertical is assumed to be true
		let contiguousUp = true // Vertical is assumed to be true
		let contiguousLeft = false
		let contiguousRight = false

		// Move to top most contiguousDown pixel
		while (contiguousUp && operator.y >= 0) {
			operator.y--
			contiguousUp = colorMatch(getColorAtPixel(imageData, operator.x, operator.y), baseColor)
		}

		// Move downward
		while (contiguousDown && operator.y < height) {
			setColorAtPixel(imageData, newColor, operator.x, operator.y)

			// Check left
			if (operator.x - 1 >= 0 && colorMatch(getColorAtPixel(imageData, operator.x - 1, operator.y), baseColor)) {
				if (!contiguousLeft) {
					contiguousLeft = true
					stack.push({x: operator.x - 1, y: operator.y})
				}
			} else contiguousLeft = false

			// Check right
			if (operator.x + 1 < width && colorMatch(getColorAtPixel(imageData, operator.x + 1, operator.y), baseColor)) {
				if (!contiguousRight) {
					stack.push({x: operator.x + 1, y: operator.y})
					contiguousRight = true
				}
			} else contiguousRight = false
			operator.y++
			contiguousDown = colorMatch(getColorAtPixel(imageData, operator.x, operator.y), baseColor)
		}
	}
}

export default function ({pos, color}, canvas) {
	const ctx = canvas.getContext('2d')
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
	color = colorStringToHexRGB(color)
	const col = {r: parseInt(color.r, 16), g: parseInt(color.g, 16), b: parseInt(color.b, 16), a: 0xff}
	floodFill(imageData, col, Math.round(pos.x), Math.round(pos.y))
	ctx.putImageData(imageData, 0, 0)
}
