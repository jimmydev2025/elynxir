import App from './index';
import Module from './Module';
import { Events } from '../app/Constants';
import Materials from './Materials';

import { Howl, Howler } from 'howler';

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import getQuery from '../app/utils/getQuery';

interface SoundsPaths {
	path: string;
	name: string;
	loop?: boolean;
}

interface Sound {
	[name: string]: Howl
}

interface TexturePaths {
	type: string;
	name: string;
	path: string;
	options?: any;
}

interface Texture {
	type: string;
	name: string;
	texture: any;
}

interface ModelPaths {
	name: string;
	path: string;
}

// Возвращает ресурсы и отправляет события загрузки
export default class LoadingManager extends Module {
	options: object;
	soundsPaths: SoundsPaths[];
	texturePaths: TexturePaths[];
	modelPaths: ModelPaths[];

	assets: {
		sounds: Sound;
		textures: Texture[];
		models: any[];
		preloaderAssets: any[];
		materials: any;
	};

	tm?: ReturnType<typeof setTimeout>;
	allAssetsLoaded: boolean = false;
	timeout: number = getQuery('timeout') != undefined ? +getQuery('timeout') : 0;
	timeoutValue: boolean = false;
	loadingCount: number = 0;
	allAssetsLoadingCount: number = 3; // sounds, textures, models. Except preloader

	preloaderPaths: any[];
	wpPath: string;

	constructor(options = {}) {
		super();
		this.options = options;

		this.wpPath = ''; //(location.host == 'pixelynx.io' || location.host == 'www.pixelynx.io') ? '/elynxir/' : '/';

		this.soundsPaths = [{
			path: 'sounds/0_1_Start_to_landing_page.mp3',
			name: '0_1_Start_to_landing_page',
			loop: false
		}, {
			path: 'sounds/1_Landing_Page.mp3',
			name: '1_Landing_Page',
			loop: false
		}, {
			path: 'sounds/2_Swipe_Down_1.mp3',
			name: '2_Swipe_Down_1',
			loop: false
		}, {
			path: 'sounds/3_Swipe_Up_2.mp3',
			name: '3_Swipe_Up_2',
			loop: false
		}, {
			path: 'sounds/4_Swipe_Up_3.mp3',
			name: '4_Swipe_Up_3',
			loop: false
		}, {
			path: 'sounds/5_Swipe_Down_2.mp3',
			name: '5_Swipe_Down_2',
			loop: false
		}, {
			path: 'sounds/6_Zoom_Out_1.mp3',
			name: '6_Zoom_Out_1',
			loop: false
		}, {
			path: 'sounds/7_Zoom_Out_2_discord.mp3',
			name: '7_Zoom_Out_2_discord',
			loop: false
		}, {
			path: 'sounds/8_Zoom_Out_3_latestnews.mp3',
			name: '8_Zoom_Out_3_latestnews',
			loop: false
		}, {
			path: 'sounds/9_Swipe_Down_3_guestlist.mp3',
			name: '9_Swipe_Down_3_guestlist',
			loop: false
		}, {
			path: 'sounds/HeartBeat_Loop_120bpm.mp3',
			name: 'HeartBeat_Loop_120bpm',
			loop: false
		}, {
			path: 'sounds/HeartBeat_single.mp3',
			name: 'HeartBeat_single',
			loop: false
		}, {
			path: 'sounds/MuteMusic_Switch.mp3',
			name: 'MuteMusic_Switch',
			loop: false
		}, {
			path: 'sounds/TextTypeOut_Display.mp3',
			name: 'TextTypeOut_Display',
			loop: false
		},{
			path: 'sounds/0_Start_Button_long.mp3',
			name: '0_Start_Button_long',
			loop: false
		}, {
			path: 'sounds/MouseClick_Button.mp3',
			name: 'MouseClick_Button',
			loop: false
		}, {
			path: 'sounds/MouseOver_Button.mp3',
			name: 'MouseOver_Button',
			loop: false
		}];

		this.texturePaths = [{
			type: 'env',
			name: 'envMap',
			// path: '3d/env/moonless_golf_4k_purple.hdr'
			// path: '3d/env/empty_warehouse_01_2k.hdr'
			path: '3d/env/StudioGlow_BW_orange.hdr'
		}];

		this.modelPaths = [{
			name: 'scene',
			path: '3d/full_scene_u2.glb'
		}/*, {
			name: 'basement',
			path: '3d/basement.glb'
		}*/];

		this.preloaderPaths = [];

		this.assets = {
			sounds: {},
			textures: [],
			models: [],
			preloaderAssets: [],
			materials: {}
		};

		this.subscribe([Events.startPreloader, Events.playSound])
		this.init();
	}

	onEvent = (eventName: Events, payload: object) => {
		switch (eventName) {
		    case Events.startPreloader:
				this.loadAll();
		        break;
		}
	}

	init = async () => {
		this.publish(Events.loadingManagerInited, { data: 'loading manager inited' });
		this.publish(Events.runPreloader, { preloaderAssets: this.assets.preloaderAssets });
		// this.assets.preloaderAssets = await this.loadPreloaderAssets();
		// this.publish(Events.preloaderAssetsLoaded, { preloaderAssets: this.assets.preloaderAssets });
	}

	loadAll = () => {
		this.tm = setTimeout(() => {
			this.timeoutValue = true;
			// console.log('start by timeout', this.timeoutValue);

			if (this.allAssetsLoaded) {
				// console.log('allAssetsLoaded before timeout');
				this.publish(Events.allAssetsLoaded, { assets: this.assets });
			}
		}, this.timeout);
		this.loadSounds();
		this.loadTextures();
		this.loadModels();
	}

	loadSounds = (): void => {
		let loadingCount = 0;
		const sounds: Sound = {};

		this.soundsPaths.forEach((sound: SoundsPaths) => {
			const soundItem = new Howl({
				src: [this.wpPath + sound.path],
				autoplay: false,
				volume: 0.5,
				loop: sound.loop
			});

			sounds[sound.name] = soundItem;

			soundItem.on('load', () => {
				loadingCount++;

				if (loadingCount === this.soundsPaths.length) {
					this.assets.sounds = sounds;
					this.publish(Events.soundsLoaded, { sounds: this.assets.sounds });
					this.updateLoadingState('sounds');
				}
			});
		});
	}

	loadTextures = (): void => {
		let loadingCount = 0;
		const textures: Texture[] = [];

		this.texturePaths.forEach((texture: TexturePaths) => {
			if (texture.type === 'env') {
				const envMap = new RGBELoader().load(this.wpPath + texture.path, () => {
					envMap.mapping = THREE.EquirectangularReflectionMapping;
					loadingCount++;

					textures.push({
						type: texture.type,
						name: texture.name,
						texture: envMap,
					});

					if (loadingCount === this.texturePaths.length) {
						this.assets.textures = textures;
						this.publish(Events.texturesLoaded, { textures: this.assets.textures });
						this.updateLoadingState('textures');
					}
				});
			}

			if (texture.type === 'normalMap') {
				const normalMapTexture = new THREE.TextureLoader().load(this.wpPath + texture.path, (textureItem) => {
					loadingCount++;

					textures.push({
						type: texture.type,
						name: texture.name,
						texture: textureItem,
					});

					if (loadingCount === this.texturePaths.length) {
						this.assets.textures = textures;
						this.publish(Events.texturesLoaded, { textures: this.assets.textures });
						this.updateLoadingState('textures');
					}
				});

				normalMapTexture.wrapS = THREE.RepeatWrapping;
				normalMapTexture.wrapT = THREE.RepeatWrapping;
				normalMapTexture.repeat.set(9, 9);
			}
		});
	}

	loadModels = (): void => {
		let loadingCount = 0;
		const models: any[] = [];

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(this.wpPath + 'libs/draco/');
		dracoLoader.preload();
		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		this.modelPaths.forEach((model: ModelPaths) => {
			loader.load(this.wpPath + model.path, (modelItem) => {
				modelItem.userData.name = model.name;
				loadingCount++;
				models.push(modelItem);

				if (loadingCount === this.modelPaths.length) {
					this.assets.models = models;
					this.publish(Events.modelsLoaded, { models: this.assets.models });
					this.updateLoadingState('models');
				}
			});
		});
	}

	loadMaterials = (): void => {
		// Pass textures to materials class
		this.assets.materials = new Materials(this.assets);
		this.publish(Events.materialsLoaded, { materials: this.assets.materials });
		// this.updateLoadingState('materials');
	}

	updateLoadingState = (eventType: string) => {
		this.loadingCount++;

		if (eventType == 'textures') {
			this.loadMaterials();
		}

		if (this.loadingCount === this.allAssetsLoadingCount) {
			this.allAssetsLoaded = true;

			if (this.timeoutValue) {
				// console.log('loaded after timeout');
				this.publish(Events.allAssetsLoaded, { assets: this.assets });
			}
		}
	}

	loadPreloaderAssets = async (): Promise<any[]> => {
		let loadingCount = 0;
		const assets: any = {};

		return new Promise<any[]>((resolve) => {
			this.preloaderPaths.forEach((asset: any) => {
				// console.log('asset', asset);

				if (asset.type === 'texture') {
					new THREE.TextureLoader().load(this.wpPath + asset.path, (textureItem) => {
						loadingCount++;

						assets[asset.name] = {
							type: asset.type,
							name: asset.name,
							texture: textureItem,
						};

						textureItem.wrapS = THREE.RepeatWrapping;
						textureItem.wrapT = THREE.RepeatWrapping;
						textureItem.repeat.set(9, 9);

						if (loadingCount === this.preloaderPaths.length) {
							resolve(assets);
						}
					});
				}

				if (asset.type === 'sound') {
					const soundItem = new Howl({
						src: [this.wpPath + asset.path],
						autoplay: false,
						volume: 0.5,
						loop: false
					});

					assets[asset.name] = soundItem;

					soundItem.on('load', () => {
						loadingCount++;

						if (loadingCount === this.preloaderPaths.length) {
							// console.log('assets', assets);
							resolve(assets);
						}
					});
				}
			});
		});
	}
}