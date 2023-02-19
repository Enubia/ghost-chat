function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
	return new Promise((resolve) => {
		if (condition.includes(document.readyState)) {
			resolve(true);
		} else {
			document.addEventListener('readystatechange', () => {
				if (condition.includes(document.readyState)) {
					resolve(true);
				}
			});
		}
	});
}

const safeDOM = {
	append(parent: HTMLElement, child: HTMLElement) {
		if (!Array.from(parent.children).find((e) => e === child)) {
			return parent.appendChild(child);
		}
	},
	remove(parent: HTMLElement, child: HTMLElement) {
		if (Array.from(parent.children).find((e) => e === child)) {
			return parent.removeChild(child);
		}
	},
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
	const styleContent = `
		.loading-wrapper {
			position: fixed;
			width: 100%;
			height: 95%;
			left: 0;
			top: 0;
			background-color: #6e479d;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.loading-wrapper > .loading-text {
			display: block;
			position: absolute;
			top: 45%;
			left: 49%;
			color: white;
			width: 100px;
			height: 30px;
			margin: -7px 0 0 -45px;
			text-align: center;
			font-family: 'PT Sans Narrow', sans-serif;
			font-size: 18px;
		}
		.loading-wrapper > .loading-content {
			display: block;
			position: absolute;
			left: 50%;
			top: 46%;
			width: 170px;
			height: 170px;
			margin: -85px 0 0 -85px;
			border: 3px solid transparent;
			border-top-color: #8d41e6;
			border-bottom-color: #8d41e6;
			border-radius: 50%;
			-webkit-animation: loader 2s linear infinite;
			-moz-animation: loader 2s linear infinite;
			-o-animation: loader 2s linear infinite;
			animation: loader 2s linear infinite;
		}
		@keyframes loader {
			0% {
				-webkit-transform: rotate(0deg);
				-ms-transform: rotate(0deg);
				transform: rotate(0deg);
			}
			100% {
				-webkit-transform: rotate(360deg);
				-ms-transform: rotate(360deg);
				transform: rotate(360deg);
			}
		}
    `;
	const oStyle = document.createElement('style');
	const oDiv = document.createElement('div');

	oStyle.id = 'app-loading-style';
	oStyle.innerHTML = styleContent;
	oDiv.className = 'loading-wrapper';
	oDiv.innerHTML = `
		<div class="loading-text">Loading</div>
		<div class="loading-content"></div>
	`;

	return {
		appendLoading() {
			safeDOM.append(document.head, oStyle);
			safeDOM.append(document.body, oDiv);
		},
		removeLoading() {
			safeDOM.remove(document.head, oStyle);
			safeDOM.remove(document.body, oDiv);
		},
	};
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
	ev.data.payload === 'removeLoading' && removeLoading();
};
