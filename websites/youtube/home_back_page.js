var self_delete = false

Element.prototype.addDownloadButton = function (generatedOnBoot = false) {
	if (generatedOnBoot) {
		console.log(`Node added on startup`)
	}
	console.log(this)
	if (!this.hasAttribute('ytdl-check')) {
		this.setAttribute('ytdl-check',true)
	}
}



const mainObs = new MutationObserver((mutList, obs) => {
	for (const mut of mutList) {
		if (mut.type === 'childList') {
			//	An element has changed
			mut.addedNodes.forEach((added_node, index) => {
				// New row added
				if (added_node.nodeName == 'YTD-RICH-GRID-ROW') {
					added_node.querySelectorAll('ytd-rich-item-renderer', (video_node) => {
						video_node.addDownloadButton()
					})
					console.log('Row element modified !')
				}
			})
		}
	}
})



// Only active on page loading until videos starts to be displayed
const primaryObs = new MutationObserver((mutList, obs) => {
	const div_content = document.querySelector('div#primary > ytd-rich-grid-renderer div#contents')
	if (div_content !== null) {
		console.log('Starting main observer...')
		mainObs.observe(div_content, {
			characterData: false,
			attributes: false,
			childList: true,
			subtree: false
		})
		for (const mut of mutList) {
			if (mut.type === 'childList') {
				//	An element has changed
				div_content.querySelectorAll('ytd-rich-item-renderer').forEach((node, index) => {
					node.addDownloadButton(true)
				})
			}
		}
		obs.disconnect()
	}
})

window.onload = () => {
	primaryObs.observe(document, {
		characterData: false,
		attributes: false,
		childList: true,
		subtree: true
	})
}
