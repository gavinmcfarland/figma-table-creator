export const clientStorage = {
	setItem: function (key, value) {

		new Promise((resolve, reject) => {

			parent.postMessage(
				{
					pluginMessage: {
						type: "set-client-storage",
						key,
						value
					},
					pluginId: "885838970710285271"
				},
				"https://www.figma.com"
			)

			window.addEventListener("message", (event) => {

				let message = event.data.pluginMessage;

				if (message.type === "client-storage-set") {
					resolve()
				}

			});
		})
	},
	getItem: function (key) {
		return new Promise((resolve, reject) => {

			parent.postMessage(
				{
					pluginMessage: {
						type: "get-client-storage",
						key,
					},
					pluginId: "885838970710285271"
				},
				"https://www.figma.com"
			)

			window.addEventListener("message", (event) => {
				let message = event.data.pluginMessage;

				if (message.type === "post-client-storage") {
					if (message.key === key) {
						resolve(message.value)
					}
				}

			});
		})
	},
	removeItem: function (key) {
		new Promise((resolve, reject) => {
			parent.postMessage(
				{
					pluginMessage: {
						type: "remove-client-storage",
						key
					},
					pluginId: "885838970710285271"
				},
				"https://www.figma.com"
			)

			window.addEventListener("message", (event) => {

				let message = event.data.pluginMessage;

				if (message.type === "client-storage-removed") {
					resolve()
				}

			});
		})
	},
}
