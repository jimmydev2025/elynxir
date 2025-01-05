export let overflow = {
	elements: Array.from(document.querySelectorAll<HTMLElement>('body, .header, .sound')),
	on: () => {
		const scrollWidth: number = window.innerWidth - document.documentElement.clientWidth;
		const body: HTMLElement | null = document.querySelector<HTMLElement>('body');
		
        if (scrollWidth > 0) {
            body?.classList.add('is-fake-scroll');

            overflow.elements.forEach((el: HTMLElement) => {
            	let elPaddingRight: number = +window.getComputedStyle(el).getPropertyValue('padding-right').slice(0, -2);
            	el.style.paddingRight = elPaddingRight + scrollWidth + "px";
            });
        }

        body?.classList.add('is-overflow');
	},
	off: () => {
		setTimeout(() => {
			const body: HTMLElement | null = document.querySelector<HTMLElement>('body');

			if (body?.classList.contains('is-fake-scroll')) {
	            body?.classList.remove('is-fake-scroll');

	            overflow.elements.forEach((el: HTMLElement) => {
            		el.style.paddingRight = "";
	            });
	        }

	        body?.classList.remove('is-overflow');
		}, 300);
	}
}
