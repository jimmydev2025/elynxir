import { Events, States, StateKeys } from '../app/Constants';

import { normClamp } from '../app/utils/interpolate';

interface Options {
	wheelDebounceTime: number;
	keyframes: number;
	startFrom: number;
	onEvent: Function;
	onMove: Function;
	onMoveNewsBlock: Function;
}

export interface StateEvent {
	changed: boolean;
	direction: number;
	value: number;
	state: number;
	outOfBounds: boolean;
}

/*
	SRP
	Вызывает коллбэк с троттлингом и передает кейфрейм
	Возвращает кейфрейм
	
	Интерфейс
	Включение/выключение реакции на события
*/

const minMax = (value: number, min: number, max: number) => {
	return Math.max(Math.min(value, max), min);
}

export default class StateSwitcher {
	options: Options;
	prevState: number = 0;
	enableWheelDebounce: boolean = true;
	wheelPaused: boolean = false;
	wheelPauseTimeout?: ReturnType<typeof setTimeout>;
	state: number = 0;
	startPosition?: number;
	minTouchDistance: number = 50;
	wheelScrollPosition: number = 0;
	wheelScrollSpeed: number = 0.2;
	wheelTouchSpeed: number = 0.06;
	preventMoveNews: boolean = false;
	enabled: boolean = true;
	newsXPosition: number = 0;

	constructor(options?: Partial<Options>) {
		this.options = {
			wheelDebounceTime: 2500,
			keyframes: 1,
			startFrom: 0,
			onEvent: (event: StateEvent) => {
				console.log('Generic callback', event);
			},
			onMove: (position: number) => {
				console.log('Generic move', position);
			},
			onMoveNewsBlock: (position: number) => {
				console.log('Generic move news block', position);
			},
			...options
		};

		this.state = this.options.startFrom;
	}

	init = () => {
		this.addEvents();
	}

	enable = () => {
		this.enabled = true;
	}

	disable = () => {
		this.enabled = false;
	}
 
	addEvents = () => {
		window.addEventListener('wheel', this.handleWheelEvent);
		window.addEventListener('touchstart', this.handleTouchStartEvent);
		window.addEventListener('touchmove', this.handleTouchMoveEvent);
	}

	handleWheelEvent = (event: any) => {
		if (!this.enabled) {
			return;
		}

		const scrollState: StateEvent = this.calcState(event.deltaY);

		const scrollBlock = event.target?.closest('[data-elements="smoothScroll"]');

		if (scrollBlock) {
			this.newsXPosition += Math.sign(event.deltaY) * 0.1;
			this.newsXPosition = normClamp(this.newsXPosition, 0, 1);

			if (this.newsXPosition < 1 && this.newsXPosition > 0) {
				this.options.onMoveNewsBlock(this.newsXPosition);
				return;
			}
		}
		
		if (this.state == 7 && !this.wheelPaused) {
			this.moveScrollEvent(event.deltaY, scrollState);
		}

		if (this.state <= 7 && this.wheelScrollPosition === 0) {
			this.debouncedEvent(scrollState);
		}
	}

	moveScrollEvent = (deltaY: number, scrollState: StateEvent, wheelTouchSpeed?: number) => {
		this.move(deltaY, wheelTouchSpeed);

		if (this.wheelScrollPosition < 0) {
			this.updateState(scrollState);
			this.options.onEvent(scrollState);
			this.wheelScrollPosition = 0;
		}
	}

	move = (deltaY: number, wheelTouchSpeed?: number) => {
		if (this.preventMoveNews) {
			this.options.onMove(0);
			return;
		}
		// 9_Swipe_Down_3_guestlist
		// interpolate
		const speed = wheelTouchSpeed ? wheelTouchSpeed : this.wheelScrollSpeed;
		const value = this.wheelScrollPosition + Math.sign(deltaY) * speed;
		this.wheelScrollPosition = normClamp(value, 0, 1);

		if (this.wheelScrollPosition < 0.1) {
			this.preventMoveNews = true;

			setTimeout(() => {
				this.preventMoveNews = false;
			}, 500);
		}
		
		this.options.onMove(this.wheelScrollPosition);
	}

	debouncedEvent = (scrollState: StateEvent) => {
		if (this.enableWheelDebounce) {
			if (this.wheelPaused) {
				return;
			}

			this.wheelPaused = true;

			this.wheelPauseTimeout = setTimeout(() => {
				this.wheelPaused = false;
			}, this.options.wheelDebounceTime);
		}
		
		this.updateState(scrollState);

		if (!scrollState.changed) {
			return;
		}

		this.options.onEvent(scrollState);
	}

	setState = (stateID: number) => {
		this.state = stateID;
	}

	handleTouchStartEvent = (event: TouchEvent) => {
		if (!this.enabled) {
			return;
		}
		this.startPosition = event.changedTouches[0].clientY;
	}

	handleTouchMoveEvent = (event: TouchEvent) => {
		if (!this.enabled) {
			return;
		}

		if (this.startPosition === undefined) {
			return;
		}

		const currentPosition = event.changedTouches[0].clientY;
		const distanceY = this.startPosition - currentPosition;
		const scrollState: StateEvent = this.calcState(distanceY);

		if (this.state == 7 && !this.wheelPaused) {
			this.moveScrollEvent(distanceY, scrollState, this.wheelTouchSpeed);
		}

		if (this.state <= 7 && this.wheelScrollPosition === 0 && Math.abs(distanceY) > this.minTouchDistance) {
			this.debouncedEvent(scrollState);
		}
	}

	calcState = (deltaY: number): StateEvent => {
		const direction: number = Math.sign(deltaY);
		const stateValue = this.state + direction;

		const result: StateEvent = {
			changed: true,
			direction,
			value: deltaY,
			state: this.state,
			outOfBounds: false
		};
		
		if (stateValue < 0 || stateValue > this.options.keyframes) {
			result.changed = false;
			result.outOfBounds = true;
			return result;
		}

		result.state = stateValue;

		return result;
	}

	updateState = (state: StateEvent) => {
		this.state = state.state;
		return this.state;
	}
}
