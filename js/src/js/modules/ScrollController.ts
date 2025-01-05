export default class ScrollController {
	options?: any;
	height?: any;
	sections?: any;
	newBounds?: any;
	sectionBounds?: any;
	inited?: any;
	elementBounds?: any;

	constructor(options: any = {}) {
		this.options = options;
		
		this.height = options.height || window.innerHeight;
		this.sections = options.sections;
		this.newBounds = {};
		this.sectionBounds = {};
		this.inited = false;
		this.elementBounds = {};

		this.init();
	}

	init() {
		this.updateRects(0, window.innerHeight);
		this.getSectionBounds(0, this.height);
	}

	updateRect(item: HTMLElement, windowHeight: number) {
		const bounds = item.getBoundingClientRect();
		
		return {
			elt: item,
			top: bounds.top - windowHeight,
			bottom: bounds.top + windowHeight,
			height: bounds.height
		};
	}
	
	updateRects(scroll: number, windowHeight: number) {
		Object.entries(this.sections).forEach((item: any) => {
			const 
				name: string = item[0],
				elt: HTMLElement = item[1],
				bounds = elt.getBoundingClientRect();
				
			/*if (name == 'caseItem6') {
			console.log(bounds);
			}*/
			
			this.elementBounds[name] = {
				elt, 
				top: bounds.top - windowHeight + scroll,
				bottom: bounds.top + windowHeight,
				height: bounds.height
			};
		})
	}

	getSectionBounds(scroll: number, windowHeight: number) {
		let height = windowHeight;

		// scroll = 0;
		
		if (!height) {
			height = this.height;
			console.error('Window height should be passed. Current height:', height);
		}
		
		Object.entries(this.sections).forEach((item, i, arr) => {
			const 
				key = item[0],
				// bounds = this.updateRect(item[1], windowHeight);
				bounds = this.elementBounds[key];
			
			if (!this.newBounds[key]) {
				this.newBounds[key] = {};
			}


			// Появление элемента снизу 0 - 1
			this.newBounds[key].in = (bounds.top - scroll) / -bounds.height;
			this.newBounds[key].inClamp = Math.max(0, Math.min(1, this.newBounds[key].in));
			
			// Появление элемента снизу 0 - 1 до тех пор, пока он не начнет уезжать
			this.newBounds[key].inFull = (bounds.top - scroll + windowHeight) / (-bounds.height + windowHeight);
			this.newBounds[key].inFullClamp = Math.max(0, Math.min(1, this.newBounds[key].inFull));
			
			// исчезновение элемента сверху 0 - 1
			this.newBounds[key].out = (bounds.top - scroll + windowHeight) / -bounds.height;
			this.newBounds[key].outClamp = Math.max(0, Math.min(1, (this.newBounds[key].out)));
			
			// появление элемента снизу 0 и исчезновение до косания верхней границы элемента верхнего края браузера 1
			this.newBounds[key].inOut = (bounds.top - scroll) / -(windowHeight + bounds.height);
			this.newBounds[key].inOutClamp = Math.max(0, Math.min(1, this.newBounds[key].inOut));
			
			// появление снизу 0 и касание верхней частью элемента края браузера 1
			this.newBounds[key].screen = (bounds.top - scroll) / -windowHeight;
			this.newBounds[key].screenClamp = Math.max(0, Math.min(1, this.newBounds[key].screen));
		});

		return this.newBounds;
	}
}