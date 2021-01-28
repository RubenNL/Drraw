const {Sequelize, DataTypes} = require('sequelize')
const sequelize = new Sequelize('sqlite:data.db')
const word = sequelize.define('word', {word: DataTypes.STRING})
sequelize.sync()
let totalWords = 0
function download() {
	return new Promise(resolve => {
		const https = require('https')
		const url = 'https://nl.wiktionary.org/w/api.php?action=query&list=search&srsearch=incategory:%22Prevalentie%20Nederland%2099%20%%22%20incategory:%22Zelfstandig%20naamwoord%20in%20het%20Nederlands%22&format=json&srlimit=500&srsort=create_timestamp_asc'
		let words = []
		function nextDownload() {
			https.get(url + '&sroffset=' + words.length, res => {
				let data = ''
				res.on('data', chunk => (data += chunk))
				res.on('end', () => {
					data = JSON.parse(data).query.search.map(item => item.title)
					words.push(...data)
					if (data.length == 500) nextDownload()
					else resolve(words)
				})
			})
		}
		nextDownload()
	})
}
word.count().then(count => {
	if (count == 0) {
		return download().then(words => {
			words = words.filter(word => word.match(/^[a-z]+$/))
			totalWords = words.length
			return word.bulkCreate(
				words.map(word => {
					return {word}
				})
			)
		})
	} else {
		totalWords = count
		return Promise.resolve()
	}
})
module.exports = aantal => {
	let response = []
	for (let i = 0; i < aantal; i++) response.push(word.findByPk(Math.floor(Math.random() * totalWords)))
	return Promise.all(response).then(words => words.map(word => word.word))
}
