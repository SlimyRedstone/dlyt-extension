const contexts = { link: 'Link', video: 'Video', audio: 'Audio', page: 'Page' }

function openURL(url) {
	/*
	document.body.innerText = 'Close this window, if it didn\'t close itself down'
	document.body.style.color = 'white'
	document.body.style.fontSize = 'xx-large'
	document.body.style.display = 'flex'
	document.body.style.justifyContent = 'center'
	document.body.style.alignItems = 'center'
	*/
	console.log(`%cYoutube Downloader%c → Openning a prompt to download this url: %c${url}`, '')
	location.replace(url)
}

function downloadImage(urlElement,tab) {
	const now = new Date()
	const url = new URL(urlElement)
	var filename = `unknown-${ now.getTime() }`
	if (url.host == 'pbs.twimg.com') {
		url.searchParams.set('name','orig')
		console.log(`New Twitter picture → ${url.href}`)
		filename = `${url.pathname.substring( url.pathname.lastIndexOf('/')+1)}.${url.searchParams.get('format')}`
	}

	// const filename = `${url.pathname.substring( url.pathname.lastIndexOf('/')+1)}.${url.searchParams.get('format')}` 

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: function(){
			let f = fetch(url.href).then(r=>{
				const blob = r.blob()

				
				var dl = document.createElement('a')
				dl.style.display = 'none'
				dl.setAttribute('href', URL.createObjectURL(blob))
				dl.setAttribute('download',filename)
				document.body.appendChild(dl)
				dl.click()
				document.body.removeChild(dl)
			})
		}
	})

}

chrome.runtime.onInstalled.addListener(function () {
	console.log('App has started !')
	for (context in contexts) {
		chrome.contextMenus.create({
			title: 'Download with yt-dlp',
			contexts: [context],
			id: `dlyt#${context}`
		})
	}

	chrome.contextMenus.create({
		title: 'Download as Twitter image',
		contexts: ['link'],
		id: 'dltw#pic'
	})
})

chrome.contextMenus.onClicked.addListener((data, tab) => {
	if (typeof data != 'object') return
	if (!data.hasOwnProperty('menuItemId')) return

	// Check if it's a link, then check for the element's src url, then check for page's url, else null
	var selectedData = data?.srcUrl ?? data?.linkUrl ?? data?.pageUrl ?? null
	if (selectedData === null) return

	const pageURL = new URL('https://www.google.com/')

	if (data.hasOwnProperty('mediaType')) {
		//  Process as video or audio
		console.log(`From mediaType → ${data['mediaType']} with data: %O`,data)
		pageURL.href = data['srcUrl']

		if (data['mediaType'] == 'image') {
			downloadImage(pageURL,tab)
			return
		}
	} else if (data.hasOwnProperty('linkUrl')) {
		//  Process as a link
		console.log(`From linkUrl → ${selectedData}`)
		pageURL.href = selectedData
	} else if (data.hasOwnProperty('srcUrl')) {
		//  Process as an element's src
		console.log(`From srcUrl → ${data['srcUrl']}`)
	} else if (data.hasOwnProperty('pageUrl')) {
		//  Process from the page's url
		console.log(`From pageUrl → ${data['pageUrl']}`)
		pageURL.href = data['pageUrl']
	}

	if (pageURL.href.match('(^(http)|^(https))') === null) {
		console.log('Unknown protocol, very likely a not downloadable website')
		return
	}
	// pageURL.protocol = 'dl'
	
	pageURL.href = pageURL.href.replace('https://', 'dl://')

	console.log(`Opening a new tab with this url → ${pageURL.href}`)
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: openURL,
		args: [pageURL.href]
	}).then(()=>{
		console.log('Successfully injected script !')
	})
	// chrome.tabs.create({ url: pageURL.href, index: tab.index + 1, active: true })
	/*
	var selectedId = data.menuItemId.replace('mso#', '')
	var breakForEach = false */

	/* chrome.runtime.sendMessage(chrome.runtime.id, {
		type: 'request',
		data: {
			url: pageURL.href,
			tabID: tab.index
		}
	}) */

	// var pageURL = new URL()
})

/* chrome.runtime.onMessage.addListener((message, origin, response_cb) => {
	console.log(`Received %O${message} from %O${origin}`)
}) */
