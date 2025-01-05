interface Dom {
	[key: string]: any
}

export default function createDOM(): Dom {
	const DOM: Dom = {};
	
	Array.from(document.querySelectorAll<HTMLElement>('[data-elements]')).forEach((item: HTMLElement) => {
		let key: string[] = item.dataset.elements?.split(' ') || [''];

		key.forEach((el) => {
			if (Array.isArray(DOM[el])) {
				DOM[el].push(item);
			} else {
				DOM[el] = [item];
			}
		})
	});

	Array.from(document.querySelectorAll<HTMLElement>('[data-element]')).forEach((item: HTMLElement) => {
		let key: string[] = item.dataset.element?.split(' ') || [''];

		key.forEach((el) => {
			DOM[el] = item;
		})
	});

	return DOM;
}
