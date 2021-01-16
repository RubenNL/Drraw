let timeout = setTimeout(() => {}, 0)
self.addEventListener('fetch', function (event) {
	clearTimeout(timeout)
	timeout = setTimeout(() => caches.keys().then(names => names.map(name => caches.delete(name))), 5000)
	if (event.request.mode == 'navigate' && !navigator.onLine) {
		let headers = new Headers()
		headers.append('Content-Type', 'text/html')
		event.respondWith(new Response('<h1>Browser is offline.</h1>', {headers: headers}))
		return
	}
	if (event.request.destination !== '') {
		event.respondWith(
			caches.open('drraw').then(function (cache) {
				return cache.match(event.request).then(function (response) {
					return (
						response ||
						fetch(event.request).then(function (response) {
							cache.put(event.request, response.clone())
							return response
						})
					)
				})
			})
		)
	}
})
