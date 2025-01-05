import Module from './Module';
import { Events, States, StateKeys } from '../app/Constants';

import createDOM from '../app/utils/createDOM';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import LoadingManager from './LoadingManager';
import Scene from './Scene';
import SceneController from './SceneController';
import SoundPlayer from './SoundPlayer';
import { Howler } from 'howler';
import getQuery from '../app/utils/getQuery';

import ScrollController from './ScrollController';
import ScrollBooster from 'scrollbooster';
import Splitting from 'splitting';
import Choices from 'choices.js';
import Form from './Form';
import Nav from './Nav';
import Popup from './Popup';
import SmartProgress from '../app/utils/SmartProgress';
import StateSwitcher from './StateSwitcher';
import type { StateEvent } from './StateSwitcher';
import { debounce } from 'lodash';
import UniversalDebugger from '../app/utils/universalDebugger.js';


/*
TODO: на ресайз не должно происходить перехода из прелоадера в интро
*/

type Vector2 = {
	x: number;
	y: number;
}

const version = 4;

// Медиатор - управляет взаимодействием между модулями на основе событий
class Index extends Module {
	mouse: Vector2;
	DOM: {
		[key: string]: any
	};
	lastTime: number;
	sceneInstance: Scene;
	sceneController: SceneController;
	stats?: Stats;
	debugMode: boolean;
	state: {
		key: States,
		headerFooterVisible: boolean,
		enableUserActions: boolean
	};

	analyser?: any;
	dataArray?: any;
	averageFrequency: number = 0;
	prevAverage: number = 0;

	nav: Nav;
	popup: Popup;

	smartProgress: SmartProgress;

	loadingManager: LoadingManager;
	formConstraints: any;
	width: number;
	height: number;

	form: any;
	scrollController: ScrollController;
	progress: any;
	scroll: number = 0;
	enableScroll: boolean = false;

	startState: number = 0;

	enableAnimation: boolean = true;

	stateSwitcher: StateSwitcher;

	newsDistanceY?: number;

	stopLoop: boolean = false;
	currentIntroSrc?: string;

	/*wheelSpeed: number = 0.55;
	wheelStepsCount: number = 0;

	useWheelPause: boolean = true;
	wheelPaused: boolean = false;
	wheelPauseTimer: number = 2500;
	wheelPauseTimeout?: ReturnType<typeof setTimeout>;*/
	clock: THREE.Clock = new THREE.Clock(false);
	debugger: any;
	startSoundTM?: ReturnType<typeof setTimeout>;
	userActionTimeout?: ReturnType<typeof setTimeout>;
	userActionTimer: number = 3000;
	prevStateID: number = -1;
	guestListPlayed: boolean = false;
	keyframesDesktop: number[] = [
		0,
		0,
		0,
		// 0,	// фокус близкий
		3, 	// камера смотрит на узел
		6, 	// руку разрезанная
		9, 	// голова
		12, 	// верхняя рука
		15, 	// сердце
		18, 	// общий вид
		21, 	// перекрытие большим кольцом
		22.9, 	// черный экран
	];

	wpPath: string = ''; //(location.host == 'pixelynx.io' || location.host == 'www.pixelynx.io') ? '/elynxir/' : '/';

	/* old
	keyframesDesktop: number[] = [
		0,
		0,
		0,
		// 0,	// фокус близкий
		3.5, 	// камера смотрит на узел
		10, 	// руку разрезанная
		15.5, 	// голова
		22.0, 	// верхняя рука
		28.0, 	// сердце
		35.0, 	// общий вид
		44.0, 	// перекрытие большим кольцом
		49.9, 	// черный экран
	];*/

	soundPlayer: SoundPlayer;
	scrollBooster: any;


	constructor(debugMode: boolean) {
		super();

		this.debugMode = debugMode;

		this.state = {
			key: States.waitPreloader,
			headerFooterVisible: false,
			enableUserActions: false
		};

		/*this.debugger = new UniversalDebugger({
			forceEnabled: true
		});*/

		this.mouse = {
			x: 0,
			y: 0
		};

		if (this.debugMode) {
			this.stats = Stats();
			this.setDebugMode();
		}

		this.smartProgress = new SmartProgress();
		this.smartProgress.add('newsScroll', 0, 1, 0.06);
		this.smartProgress.add('newsBlock', 0, 1, 0.06);



		this.lastTime = 0;
		this.subscribe([Events.start, Events.runPreloader, Events.sceneStarted, Events.prestart]);
		this.DOM = createDOM();
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.DOM.scrollSections = {};
		
		Array.from(document.querySelectorAll<HTMLElement>('[data-scroll]')).forEach((item: HTMLElement) => {
			if (!item) {
				return;
			}

			if (item.dataset.scroll) {
				this.DOM.scrollSections[item.dataset.scroll] = item;
			}
		});

		this.stateSwitcher = new StateSwitcher({
			startFrom: this.startState,
			keyframes: 7,
			wheelDebounceTime: 1500,
			onEvent: this.switchCameraAnimation,
			onMove: this.moveNews,
			onMoveNewsBlock: this.moveNewsBlock
		});

		this.nav = new Nav();
		this.form = new Form();
		this.popup = new Popup();

		this.soundPlayer = new SoundPlayer();
		this.sceneInstance = new Scene({ canvas: this.DOM.canvas });
		this.sceneController = new SceneController(this.sceneInstance, this.debugMode, this.mouse, this.DOM, this);

		this.loadingManager = new LoadingManager();

		this.scrollController = new ScrollController({
			sections: this.DOM.scrollSections,
			height: this.height
		});

		this.progress = this.scrollController.getSectionBounds(0, this.height);

		this.DOM.smoothScroll?.forEach((el: any) => {
			let viewport = el,
				content = el.querySelector('[data-elements="smoothScrollContent"]'),
				items = el.querySelectorAll('[data-elements="newsCard"]');

			el.scrollBooster = new ScrollBooster({
				viewport,
				content,
				scrollMode: 'transform',
				// scrollMode: 'native',
				direction: 'horizontal',
				onPointerMove: (state: any) => {
					this.stateSwitcher.newsXPosition = state.position.x / -this.scrollBooster.edgeX.from;
				}
				/*
				onUpdate: (state: any) => {
					items.forEach((el: HTMLElement) => {
						let visibleItems: HTMLElement[] = [];

						items.forEach((el: HTMLElement) => {
							if (this.isInViewport(el)) {
								visibleItems.push(el)
							};

							el.classList.toggle('is-active', el == visibleItems[0])
						});
					});
				},
				onPointerDown: (state: any) => {
					viewport.classList.add('is-dragged')
				},
				onPointerUp: (state: any) => {
					viewport.classList.remove('is-dragged')
				}*/
			});
		});


		// this.createSoundAnalyzer();
		this.loop(0);
		this.attachEvents();

		this.DOM.formSelect?.forEach((el: any) => {
			let elPlaceholder = el.dataset.placeholder;

			el.Choices = new Choices(el);
		});

		Splitting({
			target: "[data-splitting]",
			by: 'words'
		});

		this.scrollBooster = this.DOM.smoothScroll[0].scrollBooster;
	}

	onEvent = (event: Events, payload: object) => {
		switch (event) {
			case Events.runPreloader:
				this.runPreloader();
				//
				// this.setIntroVideo();
				// getQuery('skipButton') == '1' && this.runPreloader(); // WARN: for debug only
				break;

			case Events.prestart:
				this.handleResizeEvent();
				this.setKeyState(States.prestart);
				if (getQuery('skipButton') == '1') {
					this.publish(Events.start, {});
				}
				break;

			case Events.start:
				const tm = +(getQuery('timeout') || '3000');

				if (getQuery('skipButton') !== '1') {
					this.showIntroVideo();
				}

				if (getQuery('mute') === '1') {
					this.muteSounds();
				}

				this.toggleHeaderFooter(true);


				this.animate(0, 0);

				setTimeout(() => {
					this.start();
					this.sceneController.started = true;
					this.publish(Events.playSound, { data: '0_1_Start_to_landing_page' });

					setTimeout(() => {
						this.state.enableUserActions = true;
						this.toggleHeaderFooter(false);
					}, 6000);
				}, tm);
				break;

			case Events.sceneStarted:
				break;
		}
	}

	attachEvents = () => {
		document.addEventListener('visibilitychange', (event) => {
			const hidden = document.visibilityState != 'visible';
			// this.debugger.log(document.visibilityState);
			this.stopLoop = hidden;

			this.lastTime = performance.now();
			this.sceneController.smartProgress.updateProgress('mouseX', 0.5, true);
			this.sceneController.smartProgress.updateProgress('mouseY', 0.5, true);

			this.publish(Events.toggleMute, {force: hidden});
		});

		window.addEventListener('mousemove', this.handleMouseMoveEvent);
		window.addEventListener('mouseover', this.handleMouseOverEvent);
		window.addEventListener('resize', this.handleResizeEvent);
		// window.addEventListener('wheel', this.handleWheelEvent);
		// window.addEventListener('touchstart', this.handleWheelEvent);
		window.addEventListener('touchmove', this.handleTouchEvent);
		document.addEventListener('click', this.handleDocumentClick);
		document.querySelector('.copy-settings__close')?.addEventListener('click', (event: any) => {
			event.currentTarget.parentElement.classList.remove('is-visible');
		});;

		this.DOM.start.addEventListener('click', (event: MouseEvent) => {
			this.publish(Events.start, {});
		});

		this.DOM.startMuted.addEventListener('click', (event: MouseEvent) => {
			this.publish(Events.start, {});
			this.muteSounds();
		});

		this.DOM.mute.addEventListener('click', (event: any) => {
			// const s: any = event.currentTarget?.classList.toggle('is-muted');
			this.muteSounds();
		});

		document.addEventListener('mouseenter', this.showCursor);
        document.addEventListener('mouseleave', this.hideCursor);

        document.querySelectorAll('a, button')?.forEach((el) => {
        	el.addEventListener('mouseenter', (e) => {
	        	this.addHoverCursor();
	        });

	        el.addEventListener('mouseleave', (e) => {
	        	this.removeHoverCursor();
	        });
        });
	}

	showVersion = () => {
		this.DOM.version.innerHTML = `v${version}`;
	}

	handleDocumentClick = (e: any) => {
		this.userAction();

		if (e.target?.closest('.header__logo')) {
			this.showVersion();
		}

		/*nav*/
		if (e.target?.closest('[data-element ~="navToggle"]') && this.width <= 1024) {
			this.nav.toggleNav(this.DOM.body);
			this.stateSwitcher.enable();
		}

		if (e.target?.closest('[data-elements ~="navLink"]')) {
			let link = e.target?.closest('[data-elements ~="navLink"]'),
				target: HTMLElement | null = document.querySelector('[data-scroll ="'+ link.dataset.href +'"]');

			e.preventDefault();

			if (target) {
				// this.nav.scrollTo(target);
				this.closePopup(document.querySelectorAll('[data-elements ~="popup"]'));
				const stateID: number = StateKeys.indexOf(link.dataset.href) - 3;
				this.stateSwitcher.setState(stateID);
				this.stateSwitcher.wheelScrollPosition = 0;
				this.switchCameraAnimation(stateID);


				if (this.width <= 1024) {
					this.nav.toggleNav(this.DOM.body);
				}
			}
		}

		if (e.target?.closest('a, button:not([data-element="mute"], .intro__button)')) {
			this.publish(Events.playSound, { data: 'MouseClick_Button' });
		}

		if (e.target?.closest('.intro__button')) {
			this.publish(Events.playSound, { data: '0_Start_Button_long' });
		}
	}

	handleTouchEvent = (e: any) => {
		this.userAction();
	}

	handleResizeEvent = (event?: any) => {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.scrollController.updateRects(this.scroll, window.innerHeight);
		this.sceneInstance && this.sceneInstance.onWindowResize(this.width, this.height);
		this.sceneController && this.sceneController.resize(this.width, this.height);
		this.newsDistanceY = this.DOM.newsContainer.getBoundingClientRect().height - this.DOM.newsBox.getBoundingClientRect().height;

		this.userActionTimer = this.width < 1024 ? 5000 : 3000;

		this.userAction();

		/*if (this.width < 1024) {
			this.state.enableUserActions = false;
			this.toggleHeaderFooter(true);
		}*/

		// this.setIntroVideo();
	}

	userAction = () => {
		if (!this.state.enableUserActions) {
			return;
		}

		this.toggleHeaderFooter(false);

		if (this.userActionTimeout) {
			clearTimeout(this.userActionTimeout);
		}

		this.userActionTimeout = setTimeout(() => {
			this.toggleHeaderFooter(true);
		}, this.userActionTimer);
	}

	toggleHeaderFooter = (state: boolean) => {
		if (this.state.headerFooterVisible === state) {
			return;
		}

		this.state.headerFooterVisible = state;

		this.DOM.headerLogo.classList.toggle('is-active', state);
		this.DOM.footerLogo.classList.toggle('is-active', state);
	}

	setIntroVideo = () => {
		if (typeof this.state.key == 'number' && this.state.key < 3) {
			const videos = [this.wpPath + 'images/mobile_1920.mp4', this.wpPath + 'images/1920.mp4'];
			const url = this.width < 768 ? videos[0] : videos[1];

			if (this.currentIntroSrc != url) {
				this.currentIntroSrc = url;
				this.DOM.introVideo.src = url;
				this.DOM.introVideo.autoplay = true;
			}
		}
	}

	handleMouseMoveEvent = (event: MouseEvent) => {
		if (this.width < 1024) {
			return;
		}

		this.mouse = {
			x: event.clientX,
			y: event.clientY
		};

		this.userAction();

		this.sceneController.onMouseMove(this.mouse);

        this.updateCursorPosition(event);
	}

	handleMouseOverEvent = (event: MouseEvent) => {
		const target = event.target as HTMLElement;

		if (target?.closest('a, button:not([data-element="mute"])')) {
			if (this.width > 1024) {
				this.publish(Events.playSound, { data: 'MouseOver_Button' });
			}
		}

		/*if(target.closest('[data-elements ~="newsCard"]')){
			this.setNewsCardClasses(event);
		} else {
			this.unsetNewsCardClasses();
		}*/
	}

	openPopup = (targetPopup: any, popups: any) => {
		this.DOM.body.classList.add('is-popup');
		this.stateSwitcher.disable();
		this.popup.openPopup(targetPopup, popups);
	}

	closePopup = (popups: any) => {
		this.DOM.body.classList.remove('is-popup');
		this.stateSwitcher.enable();
		this.popup.closePopup(popups);
	}

	moveNews = (position: number) => {
		this.smartProgress.updateProgress('newsScroll', position);

		if (position > 0.5 && !this.guestListPlayed) {
			this.publish(Events.playSound, { data: '9_Swipe_Down_3_guestlist' });
			this.guestListPlayed = true;
		}
	}

	moveNewsBlock = (position: number) => {
		console.log('position', position);

		this.scrollBooster.scrollTo({
		    x: position * -this.scrollBooster.edgeX.from
		});

		// this.smartProgress.updateProgress('newsBlock', position);
	}

	switchCameraAnimation = (state: StateEvent | number, instant: boolean = false) => {
		let stateValue: number;

		if (typeof state === 'number') {
			stateValue = state;
		} else {
			stateValue = state.state;
		}

		this.playStateSwitchSound(stateValue);
		this.setNumberState(stateValue + 3);
		this.setCameraAnimation(stateValue + 3, instant);
	}

	playStateSwitchSound = (stateID: number) => {
		console.log('stateID', stateID);

		this.guestListPlayed = false;

		if (stateID != 0 && this.startSoundTM != undefined) {
			clearTimeout(this.startSoundTM);
		}

		if (stateID == 4) {
			this.publish(Events.toggleHeartbeat, { data: true });
		} else {
			this.publish(Events.toggleHeartbeat, { data: false });
		}

		switch (stateID) {
			case 0:
				if (this.prevStateID > stateID) {
					console.log('play back');
					this.publish(Events.playSound, { data: '1_Landing_Page' });
				}

				break;

			case 1:
				this.publish(Events.playSound, { data: '2_Swipe_Down_1' });

				setTimeout(() => {
					this.publish(Events.playSound, { data: 'TextTypeOut_Display' });
				}, 1000);

				break;

			case 2:
				this.publish(Events.playSound, { data: '3_Swipe_Up_2' });

				setTimeout(() => {
					this.publish(Events.playSound, { data: 'HeartBeat_Loop_120bpm' });
				}, 250);

				setTimeout(() => {
					this.publish(Events.playSound, { data: 'TextTypeOut_Display' });
				}, 1000);

				break;

			case 3:
				this.publish(Events.playSound, { data: '4_Swipe_Up_3' });

				setTimeout(() => {
					this.publish(Events.playSound, { data: 'TextTypeOut_Display' });
				}, 1000);

				break;

			case 4:
				this.publish(Events.playSound, { data: '5_Swipe_Down_2' });

				setTimeout(() => {
					this.publish(Events.playSound, { data: 'TextTypeOut_Display' });
				}, 1000);

				break;

			case 5:
				this.publish(Events.playSound, { data: '6_Zoom_Out_1' });

				setTimeout(() => {
					this.publish(Events.playSound, { data: 'TextTypeOut_Display' });
				}, 1000);

				break;

			case 6:
				this.publish(Events.playSound, { data: '7_Zoom_Out_2_discord' });

				break;

			case 7:
				this.publish(Events.playSound, { data: '8_Zoom_Out_3_latestnews' });
				break;
		}

		this.prevStateID = stateID;
	}

	updateCameraPosition = (cameraProgress: number) => {
		// this.sceneController.updateCameraPosition(cameraProgress);
	}

	setCameraAnimation = (keyframeID: number, instant: boolean) => {
		const time = this.keyframesDesktop[keyframeID];
		if (time === undefined) {
			return;
		}

		this.sceneController.setCameraAnimation(time, instant);
	}

	setNumberState = (state: number) => {
		/*const value: number = this.state.key + direction;
		// console.log('value', value, direction, this.state.key);
		if (value > (StateKeys.length - 1) || value < 3) {
			return this.state.key;
		}

		if (this.state.key == value) {
			return this.state.key;
		}

		this.useWheelPause = true;

		// console.log('value', value);*/
		const key: string = StateKeys[state];
		this.state.key = States[key as keyof typeof States];
		document.body.dataset.state = key;


		return state;
	}

	setKeyState = (value: States) => {
		if (this.state.key == value) {
			return;
		}

		const key: string = StateKeys[value];

		this.state.key = value;
		document.body.dataset.state = key;

		if (key == 'news') {
			this.sceneInstance.renderSceneState = false;
			// this.sceneInstance.renderBasementState = true;
		} else if (key != 'waitPreloader' && key != 'prestart' && key != 'preloader') {
			this.sceneInstance.renderSceneState = true;
			// this.sceneInstance.renderBasementState = false;
		}
	}

	start = () => {
		this.deleteIntroVideo();
		this.clock.start();
		this.stateSwitcher.init();
		this.setKeyState(States.showIntro);
		// this.setCameraAnimation(3);
		this.switchCameraAnimation(this.startState, false);
		console.log('Start');

		// FOR DEV ONLY
		// this.stateSwitcher.setState(6);

		this.startSoundTM = setTimeout(() => {
			this.publish(Events.playSound, {data: '1_Landing_Page'});
		}, 2000);
	}

	hideIntroBlock = () => {
		this.DOM.intro.classList.add('is-hidden');
	}

	showIntroVideo = () => {
		this.DOM.intro?.remove();
		this.DOM.introVideoContainer.classList.add('is-active');
		this.DOM.introVideo.play();
	}

	deleteIntroVideo = () => {
		this.DOM.introVideoContainer.remove();
		// this.DOM.introVideoContainer.classList.remove('is-active');
		// this.DOM.introVideo.pause();
	}

	runPreloader = () => {
		// console.log('this.loadingManager.assets', this.loadingManager.assets);
		this.setKeyState(States.preloader);
		this.publish(Events.startPreloader, { data: {} });
		// this.publish(Events.playPreloaderMusic, { data: this.loadingManager.assets });
	}

	muteSounds = () => {
		this.publish(Events.playSound, {data: 'MuteMusic_Switch'});
		this.DOM.mute.classList.toggle('is-muted');
		this.publish(Events.toggleMute, {user: true});
	}

	updateCursorPosition = (e: MouseEvent) => {
        let coord = {
                x: e.clientX,
                y: e.clientY
            };

        if (this.width > 1024) {
        	this.DOM.cursor?.style.setProperty('transform', `translate(${coord.x}px, ${coord.y}px)`);
        	this.showCursor();
        }
    }

    showCursor = () => {
    	this.DOM.cursor?.style.setProperty('opacity', `1`);
    	this.DOM.cursorOuter?.style.setProperty('opacity', `1`);
    }

    hideCursor = () => {
    	this.DOM.cursor?.style.setProperty('opacity', `0`);
    	this.DOM.cursorOuter?.style.setProperty('opacity', `0`);
    }

    addHoverCursor = () => {
    	this.DOM.cursor?.classList.add('is-hover');
    	this.DOM.cursorOuter?.classList.add('is-hover');
    }

    removeHoverCursor = () => {
    	this.DOM.cursor?.classList.remove('is-hover');
    	this.DOM.cursorOuter?.classList.remove('is-hover');
    }

	loop = (time: number) => {
		/*if (this.stopLoop) {
			this.lastTime = 0;
			return;
		} else if (this.lastTime == 0) {
			this.lastTime = time;
		}*/

		requestAnimationFrame(this.loop);
		const delta = (time - this.lastTime) * 0.001;
		this.stats && this.stats.begin();
		this.animate(delta, time / 1000);
		this.stats && this.stats.end();
		this.lastTime = time;
	}

	createSoundAnalyzer = () => {
		this.analyser = Howler.ctx.createAnalyser();
		Howler.masterGain.connect(this.analyser);
		this.analyser.fftSize = 1024;
		/*this.analyser.minDecibels = -90;
		this.analyser.maxDecibels = -10;
		this.analyser.smoothingTimeConstant = 0.55;*/
		this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.connect(Howler.ctx.destination);
	}

	getAverageFrequency = (data: any, crop: number = 0) => {
		let value = 0;
		let len = data.length - crop;

		for (let i = crop; i < len; i++) {
			value += data[i];
		}

		return value / len;
	}

	animate = (delta: number, time: number) => {
		if (!this.enableAnimation) {
			return;
		}

		this.smartProgress && this.smartProgress.updateDelta(delta);

		/*if (this.analyser) {
			this.analyser.getByteFrequencyData(this.dataArray);
			const av = this.getAverageFrequency(this.dataArray, 100);
			this.averageFrequency = (this.prevAverage + av) / 4;
			this.prevAverage = av;
		}*/
		
		/*if (this.scrollBooster) {
			const value = this.smartProgress.getProgress('newsBlock') * -this.scrollBooster.edgeX.from;
			console.log('value', value);
			
			this.scrollBooster.setPosition({
				x: value
			});
		}*/

		if (this.newsDistanceY !== undefined) {
			const value = this.newsDistanceY * this.smartProgress.getProgress('newsScroll');
			this.DOM.newsBox.style.setProperty('transform', `translateY(${value}px)`)
		}

		// this.sceneController.updateSoundWave(this.dataArray, this.averageFrequency);
		this.sceneController.update(delta, time);
		this.sceneInstance.render();
	}

	setDebugMode = () => {
		if (getQuery('hideContent') == '1') {
			document.body.classList.add('is-debug');
		}

		if (this.stats) {
			this.stats.dom.style.setProperty('top', 'auto');
			this.stats.dom.style.setProperty('bottom', '0');

			this.stats.dom.style.setProperty('left', 'auto');
			this.stats.dom.style.setProperty('right', '0');

			document.body.appendChild(this.stats.dom);
		}
	}

	setNewsCardClasses = (event: any) => {
		this.unsetNewsCardClasses();

		let currentCard = event.target.closest('[data-elements ~="newsCard"]'),
			currentCardIndex = [...document.querySelectorAll('[data-elements ~="newsCard"]')].indexOf(currentCard),
			prevCardIndex = (currentCardIndex - 1) <= 0 ? 0 : (currentCardIndex - 1),
			nextCardIndex = (currentCardIndex + 1) >= [...document.querySelectorAll('[data-elements ~="newsCard"]')].length ? [...document.querySelectorAll('[data-elements ~="newsCard"]')].length : (currentCardIndex + 1),
			prevCard = [...document.querySelectorAll('[data-elements ~="newsCard"]')][prevCardIndex],
			nextCard = [...document.querySelectorAll('[data-elements ~="newsCard"]')][nextCardIndex];

			prevCard.classList.add('is-prev');
			currentCard.classList.add('is-current');

			nextCard && nextCard.classList.add('is-next');
	}

	unsetNewsCardClasses = () => {
		[...document.querySelectorAll('[data-elements ~="newsCard"]')].forEach((el) => {
			el.classList.remove('is-prev');
			el.classList.remove('is-current');
			el.classList.remove('is-next');
		});
	}

	/*scrollSpy = (progress: any) => {
		let state: string | undefined;

		Object.keys(progress)?.forEach((key: string) => {
			if (progress[key].inClamp > 0.5) {
				state = key;
			}
		});

		if (state) {
			const s: States = States[state];
			this.setKeyState(s);
		}
	}*/

	isInViewport = (el: HTMLElement, offset: number = 0) => {
		let distance = el.getBoundingClientRect();

		return (
			distance.left >= 0 + offset && distance.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}
}

export default Index;