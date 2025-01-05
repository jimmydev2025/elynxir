import Module from './Module';
import { Events } from '../app/Constants';

import * as THREE from 'three';
import getQuery from '../app/utils/getQuery';
import loaderVert from '../shaders/loaderVert.glsl';
import loaderFrag from '../shaders/loaderFrag.glsl';
import CameraStateController from '../app/utils/CameraUtils';
import SmartProgress from '../app/utils/SmartProgress';
import GUI from 'lil-gui';
import Scene from './Scene';
import { interpolateClamp } from '../app/utils/interpolate';

/*
Все что связано с динамическим наполнением сцены и весь интерактив
*/

interface MousePosition {
	x: number,
	y: number
}

class SceneController extends Module {
	sceneInstance: Scene;
	debugMode: boolean;
	cameraControls?: CameraStateController;
	backupCamera?: THREE.PerspectiveCamera;
	mousePosition: MousePosition;
	mousePositionNormalized: MousePosition;
	gltfDesktopCamera?: THREE.PerspectiveCamera;
	gltfMobileCamera?: THREE.PerspectiveCamera;
	preloaderScene?: THREE.Scene;
	preloader?: any;
	assets?: any;
	dataArray?: any;
	averageFrequency?: any;
	mixer?: any;
	action?: any;
	envMap?: any;
	playStopState: boolean = true;
	gltf?: any;
	width: number = window.innerWidth;
	height: number = window.innerHeight;

	materials: any;
	sceneLight: any;
	movingLight: any;
	movingLight2: any;

	smartProgress: SmartProgress;

	cameraHelper?: THREE.CameraHelper;
	cameraHelperMobile?: THREE.CameraHelper;
	cameraProgress?: number;
	cameraMixer?: any;

	DOM: any;

	cameraKey?: THREE.Object3D;

	cameraPCDuration?: number;
	cameraMobileDuration?: number;
	root: any;
	keyframesDesktop: any;
	keyframesMobile: any;
	keyframes?: {
		position: THREE.Vector3
		rotation: THREE.Quaternion
	}[];
	avatarRomb: any;
	started: boolean = false;

	constructor(sceneInstance: Scene, debugMode: boolean, mouse: MousePosition, dom: any, root: any) {
		super();
		this.root = root;
		this.DOM = dom;
		this.sceneInstance = sceneInstance;
		this.debugMode = debugMode;
		this.mousePosition = mouse;
		this.mousePositionNormalized = {
			x: 0.5,
			y: 0.5
		};
		this.materials = {
			maneken: 'glass',
			hand: 'hand',
			rings_small004: 'smallrings',
			Abstract_big_high: 'Knot',
			hand001: 'glass',
			central_rings: 'Knot',
			Side_rings: 'Knot',
			top_hand: "tophand",
			head: "head",
			rings_small006 : "smallrings2",
			top_hand001 : "tophand2"
		};

		this.smartProgress = new SmartProgress();
		this.smartProgress.add('mouseX', 0, 1, 0.03);
		this.smartProgress.add('mouseY', 0, 1, 0.03);
		this.smartProgress.add('cameraProgress', 0, 1, 0.007, 0.0001);

		/*
			Vector3(X Z -Y)
			Quaternion(X Z -Y W)
		*/

		this.keyframesDesktop = [{
			position: new THREE.Vector3(-0.301291, 1.38661, 0.36189),
			rotation: new THREE.Quaternion(0.476706, 0.461749, -0.475942, 0.517774)
		}, {
			position: new THREE.Vector3(-0.083264, 1.12669, 0.347974),
			rotation: new THREE.Quaternion(0.5850147604942322, 0.345205157995224, -0.6521335244178772, 0.33661991357803345)
		}, {
			position: new THREE.Vector3(0.3501283526420593, 1.5531058311462402, 0.1683593988418579),
			rotation: new THREE.Quaternion(0.3575432598590851, 0.5623123049736023, -0.675763726234436, 0.315136581659317)
		}, {
			position: new THREE.Vector3(0.8673082590103149, 1.6773840188980103, 0.09765250980854034),
			rotation: new THREE.Quaternion(0.5795077085494995, 0.3620088994503021, -0.6417559385299683, 0.3482382297515869)
		}, {
			position: new THREE.Vector3(0.9840108156204224, 2.0574990272521973, -0.37297892570495605),
			rotation: new THREE.Quaternion(0.4835517406463623, 0.4157703220844269, -0.7088793516159058, 0.30133524537086487)
		}, {
			position: new THREE.Vector3(0.4439517855644226, 1.8161253929138184, -0.02450253814458847),
			rotation: new THREE.Quaternion(0.4656097264665581, 0.4982657083416028, -0.6116277742965167, 0.40106150677878194)
		}, {
			position: new THREE.Vector3(2.8470494747161865, 0.6176000833511353, 0.030315671116113663),
			rotation: new THREE.Quaternion(0.6089611053466797, 0.35747987031936646, -0.6069525480270386, 0.3646685481071472)
		}, {
			position: new THREE.Vector3(2.8470494747161865, -0.7428929805755615, 0.030315671116113663),
			rotation: new THREE.Quaternion(0.5674980282783508, 0.4218745827674866, -0.5650919079780579, 0.4250164330005646)
		}, {
			position: new THREE.Vector3(2.8470494747161865, -1.5728273424564165, 0.030315671116113663),
			rotation: new THREE.Quaternion(0.5674456263759762, 0.42239131633412136, -0.5650416280505183, 0.4246398421749002)
		}];

		this.keyframesMobile = [{
			position: new THREE.Vector3(-0.413896, 1.51727, 0.369636 ),
			rotation: new THREE.Quaternion(0.434914, 0.526743, -0.39881, 0.610741)
		}, {
			position: new THREE.Vector3(-0.291378, 1.25878, 0.361895),
			rotation: new THREE.Quaternion(0.588204, 0.339755, -0.6521335244178772, 0.335227)
		}, {
			position: new THREE.Vector3(0.351029, 1.59418, 0.172874 ),
			rotation: new THREE.Quaternion(0.3575432598590851, 0.5623123049736023, -0.669199, 0.315136581659317)
		}, {
			position: new THREE.Vector3(0.529824, 1.9241, 0.102014 ),
			rotation: new THREE.Quaternion(0.574602, 0.358604, -0.636605, 0.34687)
		}, {
			position: new THREE.Vector3(0.807551, 2.19176, -0.342357),
			rotation: new THREE.Quaternion(0.4835517406463623, 0.4157703220844269, -0.7088793516159058, 0.30133524537086487)
		}, {
			position: new THREE.Vector3(0.357769, 1.8337, -0.041888),
			rotation: new THREE.Quaternion(0.4656097264665581, 0.4982657083416028, -0.6116277742965167, 0.40106150677878194)
		}, {
			position: new THREE.Vector3(1.97883, 0.967289, 0.070204),
			rotation: new THREE.Quaternion(0.6089611053466797, 0.35747987031936646, -0.6069525480270386, 0.3646685481071472)
		}, {
			position: new THREE.Vector3(2.84063, -0.742893, 0.029679),
			rotation: new THREE.Quaternion(0.5674980282783508, 0.4218745827674866, -0.5650919079780579, 0.4250164330005646)
		}, {
			position: new THREE.Vector3(2.71921, -1.56583, 0.012937),
			rotation: new THREE.Quaternion(0.5674456263759762, 0.42239131633412136, -0.5650416280505183, 0.4246398421749002)
		}];

		// this.keyframes = this.keyframesDesktop;

		this.setSceneCamera();
		this.init();
	}

	init = () => {
		this.subscribe([Events.allAssetsLoaded, Events.texturesLoaded, Events.startPreloader]);
	}

	onEvent = (eventName: Events, payload: any) => {
		switch (eventName) {
			case Events.startPreloader:
				this.startPreloader(payload);
				break;

			case Events.allAssetsLoaded:
				this.assets = payload.assets;
				this.createScene(payload);
				this.publish(Events.prestart, {});
				
				// this.publish(Events.start, {});
				// this.publish(Events.sceneStarted, {});
				break;
		}
	}

	onMouseMove = (mouse: MousePosition) => {
		this.mousePosition = mouse;
		this.smartProgress.updateProgress('mouseX', mouse.x / this.width);
		this.smartProgress.updateProgress('mouseY', 1 - mouse.y / this.height);
	}

	resetCameraPosition = () => {
		if (this.cameraKey && this.keyframes) {
			this.cameraKey.position.copy(this.keyframes[0].position);
			this.cameraKey.quaternion.copy(this.keyframes[0].rotation);
		}
	}

	setAllCulled = (obj: any, culled: boolean) => {
		obj.frustumCulled = culled;
		obj.children.forEach((child: any) => this.setAllCulled(child, culled));
	}

	startPreloader = (payload: any) => {
		// this.DOM.introVideo.play();
		// this.DOM.introVideo.muted = true;

		return;

		/*// this.setAllCulled(this.sceneInstance.preloaderScene, false);
		console.log('start preloader');
		//if (this.debugMode) {
		//	this.setDebugMode();
		//}

		this.preloaderScene = this.sceneInstance.preloaderScene;

		const viewportSize = this.sceneInstance.getCameraViewportSize();
		const geometry = new THREE.PlaneBufferGeometry(viewportSize.width, viewportSize.height, 64, 64);
		const loader = new THREE.TextureLoader();
		const texture = payload.data.preloaderAssets.preloaderTexture.texture;
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		const material = new THREE.ShaderMaterial({
			wireframe: false,
			uniforms: {
				iAmp: {
					value: 3.0,
				},
				iDataArr: {
					value: this.averageFrequency,
				},
				iAverage: {
					value: this.averageFrequency,
				},
				iTime: { value: 0 },
				iMouse: { value: {x: 0, y: 0} },
				iResolution:  { value: new THREE.Vector3(this.width, this.height, 1) },
				iChannel0: { value: texture },
			},
			vertexShader:   loaderVert,
			fragmentShader: loaderFrag,
			transparent: false
		});

		let mesh = new THREE.Mesh(geometry, material);

		this.preloader = mesh;
		this.preloaderScene.add(mesh);
		// this.sceneInstance.renderer.render(this.sceneInstance.preloaderScene, this.sceneInstance.preloaderCamera);
		// this.setAllCulled(this.sceneInstance.preloaderScene, true);

		this.sceneInstance.renderPreloaderState = true;*/
	}

	disposePreloader = () => {
		// this.DOM.introVideo.pause();
		// this.DOM.introVideo.muted = true;

		// add animations for preloader hide?
		// this.preloader.geometry.dispose();
		// this.preloader.material.dispose();
		// this.sceneInstance.scene.remove(this.preloader);
		// this.preloader = null;
	}

	createLights = () => {
		this.sceneLight = new THREE.Group();
		this.sceneLight.name = 'Lights';

		const topLight = new THREE.PointLight("#371B0B", 0.7, 5, 0.504);
		topLight.name = 'topLight';
		topLight.position.set(0.4 , 0.24 , 0.56);
		this.sceneLight.add(topLight);

		const topLight2 = new THREE.PointLight("#381500", 0.995, 34.0959 , 0.903);
		topLight2.name = 'topLight2';
		topLight2.position.set(-1.5 , 2.52 , -0.88);
		this.sceneLight.add(topLight2);

		const rightLight = new THREE.PointLight("#000000", 3.54, 12.8, 2.781);
		rightLight.name = 'rightLight';
		rightLight.position.set(2.74, 2.44, -9.3);
		this.sceneLight.add(rightLight);

		const leftLight = new THREE.PointLight("#00FFEE", 0.16 , 18.3, 3);
		leftLight.name = 'leftLight';
		leftLight.position.set(3.68, 5.56, -1);
		this.sceneLight.add(leftLight);

		/*const androidLight = new THREE.PointLight("#050307", 1.475 , 18.3, 3);
		androidLight.name = 'androidLight';
		androidLight.position.set(-0.58, 1.58, 0.82);
		this.sceneLight.add(androidLight);
		this.sceneLight.add(new THREE.PointLightHelper(androidLight, 0.3));*/

		// const keyLight = new THREE.SpotLight("#6349A2", 2.86 , 66.4335, 0.582);
		// keyLight.name = 'keyLight';
		// keyLight.position.set(6.36, 6.52, 0.2);
		// keyLight.lookAt(new THREE.Vector3(6.36, 8.52, 0.2));
		// this.sceneLight.add(keyLight);

		const ambientLight = new THREE.AmbientLight("#A17878", 1.76);
		ambientLight.name = 'ambient';
		this.sceneLight.add(ambientLight);

		this.movingLight = leftLight;
		this.movingLight2 = topLight;
		/*
		this.movingLight = new THREE.PointLight(0xFF0059, 32, 50, 2);
		this.movingLight.name = 'Moving light';
		this.movingLight.position.set(0, 1, 0);
		this.sceneLight.add(this.movingLight);*/

		/*
		const light0 = new THREE.PointLight(0x7B24FF, 430, 50, 2);
		light0.name = 'light0';
		light0.position.set(1, 2.5, -1);
		this.sceneLight.add(light0);

		const light1 = new THREE.PointLight(0xffffffff, 10, 50, 2);
		light1.name = 'light1';
		light1.position.set(0.0, 0.25, 1.0);
		this.sceneLight.add(light1);

		const light2 = new THREE.PointLight(0x6524FF, 40, 50, 2);
		light2.name = 'light2';
		light2.position.set(-0.26, 1.28, 1.12);
		this.sceneLight.add(light2);

		// const ambientLight = new THREE.AmbientLight('white', 0.3);
		// this.sceneLight.add(ambientLight);

		this.movingLight = new THREE.PointLight(0xFF0059, 32, 50, 2);
		this.movingLight.name = 'Moving light';
		this.movingLight.position.set(0, 1, 0);
		this.sceneLight.add(this.movingLight);
		*/
		this.sceneLight.layers.toggle(1);
		this.sceneInstance.scene.add(this.sceneLight);
	}

	createScene = (assets: any) => {
		console.time('create scene');

		this.gltf = assets.assets.models.filter((model: any) => {
			return model.userData.name == 'scene';
		})[0];

		// console.log('this.gltf', this.gltf);

		// assets
		// TODO: переключать камеры и обновлять прелоадер под новую камеру
		this.gltfDesktopCamera = this.gltf.cameras.filter((camera: any) => {
			return camera.name === 'Camera_PC_Orientation';
		})[0];

		this.gltfMobileCamera = this.gltf.cameras.filter((camera: any) => {
			return camera.name === 'Camera_Mobile_Orientation';
		})[0];

		this.avatarRomb = this.gltf.scene.children.filter((mesh: any) => {
			return mesh.name === 'rombs012';
		})[0];

		this.createLights();
		this.setAllCulled(this.gltf.scene, false);

		const back = this.gltf.scene.getObjectByName("Sphere")
		back.material.envMapIntensity = 0
		
		this.gltf.scene.traverse((child: any) => {
			if (child.name == 'Camera_PC') {
				this.cameraKey = child;
				this.resetCameraPosition();
			}

			/*if (
				child.name == 'maneken' || 
				child.name == 'head' || 
				child.name == 'hand' || 
				child.name == 'top_hand' || 
				child.name == 'sound_heart001' || 
				child.name == 'blobs' || 
				child.name == 'Sphere' || 
				child.name == 'star' || 
				child.name == 'Abstract_big_high' || 
				child.name == 'char'||
				child.name == 'keys002' || 
				child.name == 'keys003' || 
				child.name == 'keys004' ||
				child.name == 'keys' ||
				child.name == 'keys' ||
				child.name == 'EyeLeft001' ||
				child.name == 'EyeRight001' ||
				child.name == 'hands_Wolf3D_Body' ||
				child.name == 'Wolf3D_Head002' ||
				child.name == 'Wolf3D_Outfit_Bottom' ||
				child.name == 'Womens_Sneakers_6_004001_Mesh004' ||
				child.name == 'Womens_Sneakers_6_004003_Mesh002' || 
				child.name == 'rings_small' || 
				child.name == 'top_hand001' || 
				child.name == 'rings_small002' || 
				child.name == 'rings_small003' ||
				child.name == 'top'||
				child.name == 'disk' 

				) {
				// this.sceneInstance.selectiveBloomEffect.selection.add(child);
				// child.layers.toggle(1);
			} else {
				child.layers.toggle(1);
			}*/

			if (child.isMesh) {
				const customMaterialName = this.materials[child.name];
				
				if (customMaterialName) {
					child.material = this.assets.materials[customMaterialName];
				}

				if (child.name == 'BG_rings') {
					child.material.side = THREE.DoubleSide;
				}
			}
		});

		if (getQuery('debug') != '1' && this.gltfDesktopCamera) {
			this.setSceneCamera();
		}

		this.envMap = assets.assets.textures.filter((item: any) => item.name == 'envMap')[0].texture;
		// this.sceneInstance.scene.background = this.envMap;
		this.sceneInstance.scene.environment = this.envMap;

		// Animations
		const clips = this.gltf.animations;
		this.mixer = new THREE.AnimationMixer(this.gltf.scene);
		this.cameraMixer = new THREE.AnimationMixer(this.gltf.scene);

		clips.forEach((clip: any) => {
			// Camera1Action - desktop
			// Camera1Action.001 - mobile

			if (clip.name == 'CameraPCAction') {
				/*const action = this.cameraMixer.clipAction(clip);
				action.clampWhenFinished = true;
				action.stop();
				
				this.cameraPCDuration = clip.duration - 0.01;
				console.log('this.cameraPCDuration', this.cameraPCDuration);*/

				return;
			}

			if (clip.name == 'CameraMobileAction') {
				/*const action = this.cameraMixer.clipAction(clip);
				action.clampWhenFinished = true;
				action.stop();
				
				this.cameraMobileDuration = clip.duration - 0.01;*/

				return;
			}

			const action = this.mixer.clipAction(clip);
			action.play();
		});

		this.sceneInstance.scene.add(this.gltf.scene);
		this.sceneInstance.renderer.render(this.sceneInstance.scene, this.sceneInstance.camera);

		this.disposePreloader();

		this.sceneInstance.renderSceneState = true;

		this.setAllCulled(this.gltf.scene, true);
		this.sceneInstance.renderPreloaderState = false;

		if (this.debugMode) {
			this.setDebugMode();
		}

		console.timeEnd('create scene');
	}

	setCameraAnimation = (keyframeTime: number, instant: boolean) => {
		this.smartProgress.updateProgress('cameraProgress', 0, true);
		
		if (this.cameraPCDuration) {
			// this.smartProgress.updateProgress('cameraProgress', keyframeTime / this.cameraPCDuration, instant);
			this.smartProgress.updateProgress('cameraProgress', 1, instant);
		}
		// this.cameraMobileDuration
	}

	/*updateCameraPosition = (cameraProgress: number) => {
		this.cameraProgress = cameraProgress;

		if (this.cameraProgress) {
			this.smartProgress.updateProgress('cameraProgress', this.cameraProgress);
		}
	}*/

	resize = (width: number, height: number) => {
		this.width = width;
		this.height = height;
		this.setSceneCamera();
	}

	/*updateSoundWave(wave: any, averageFrequency: any) {
		this.dataArray = wave;
		this.averageFrequency = averageFrequency;
	}*/

	update = (delta: number, time: number) => {
		if (!this.started) {
			return;
		}

		this.smartProgress && this.smartProgress.updateDelta(delta);

		if (this.playStopState && this.mixer) {
			this.mixer.update(delta);
		}

		if (this.avatarRomb) {
			this.avatarRomb.rotation.z += delta;
		}

		const mouseNormalized = {
			x: 1 - this.smartProgress.getProgress('mouseX'),
			y: this.smartProgress.getProgress('mouseY')
		};

		/*const mouseYNormalized = this.mousePosition.y / this.height;
		const showNewHeaderFooter = mouseYNormalized > 0.8 || mouseYNormalized < 0.2;

		this.DOM.headerLogo.classList.toggle('is-active', showNewHeaderFooter);
		this.DOM.footerLogo.classList.toggle('is-active', showNewHeaderFooter);*/

		/*
		// Distance example
		const headerDistance = interpolateClamp(mouseNormalized.y, 0.65, 0.9, 0, 1);
		const footerDistance = interpolateClamp(mouseNormalized.y, 0.35, 0.1, 0, 1);
		const distanceValue = Math.max(headerDistance, footerDistance);
		this.DOM.headerLogo.style.setProperty(`transform`, `translateY(${-100 + distanceValue * 100}%)`);
		this.DOM.footerLogo.style.setProperty(`transform`, `translateY(${100 - distanceValue * 100}%)`);
		*/


		// Moving eye
		const property = `translate(${10 - mouseNormalized.x * 20}px, ${2.5 - mouseNormalized.y * 5}px)`;

		if (this.root.state.key > 3) {
			this.DOM.eyeCircle1 && this.DOM.eyeCircle1.style.setProperty('transform', property);
		} else {
			this.DOM.eyeCircle0 && this.DOM.eyeCircle0.style.setProperty('transform', property);
		}

		if (this.playStopState) {
			const p = delta; //Math.min(delta * 1.2, 0.016);//this.smartProgress.getProgress('cameraProgress') * (delta * 2.0);

			if (p != undefined) {
				if (this.cameraKey && this.keyframes) {
					const fromKey = this.root.state.key - 3;
					const toKey = this.root.state.key - 3 + 1;

					this.cameraKey.position.lerp(this.keyframes[toKey].position, p);
					this.cameraKey.quaternion.slerp(this.keyframes[toKey].rotation, p);
				}

				if (this.width > 1024) {
					this.sceneInstance.camera.rotation.set(-1.5707962925663537 - (0.5 - mouseNormalized.y) * 0.02, mouseNormalized.x * 0.02, 0);
				}
			}
		}

		if (this.movingLight) {
			this.mousePositionNormalized = {
				x: (0.25 + mouseNormalized.x) * 1,
				y: mouseNormalized.y * 1
			};

			this.movingLight.position.set(0.5, this.mousePositionNormalized.y, this.mousePositionNormalized.x);
			this.movingLight2.position.set(0.5, this.mousePositionNormalized.y * 3 , this.mousePositionNormalized.x * 2);
		}
	}

	setSceneCamera = () => {
		// this.width
		// this.height
		// const camera = this.width < 768 ? this.gltfMobileCamera : this.gltfDesktopCamera;
		const camera = this.gltfDesktopCamera;
		const isMobile: boolean = this.width < 768;
		
		this.keyframes = isMobile ? this.keyframesMobile : this.keyframesDesktop;

		/*if (this.cameraKey && this.keyframes) {
			if (this.keyframes[this.root.state.key - 3]) {
				this.cameraKey.position.copy(this.keyframes[this.root.state.key - 3].position);
				this.cameraKey.quaternion.copy(this.keyframes[this.root.state.key - 3].rotation);
			}
		}*/
		
		if (camera) {
			camera.fov = isMobile ? 55 : 22;
			// camera.zoom = isMobile ? 2: 1
			// this.sceneInstance.camera = this.sceneInstance.newCamera;
			this.sceneInstance.camera = camera;
			this.sceneInstance.camera.aspect = this.width / this.height;
			this.sceneInstance.camera.updateProjectionMatrix();
			// this.sceneInstance.composer.passes.forEach((pass: any) => {
			// 	if (pass.camera) {
			// 		pass.camera = camera;
			// 		pass.camera.aspect = this.width / this.height;
			// 		pass.camera.updateProjectionMatrix();
			// 	}

			// 	// console.log('pass', pass);
			// });
		}
	}


	playStop = () => {
		this.playStopState = !this.playStopState;
	}

	restartCameraAnimation = () => {
		this.mixer.setTime(0);
		// this.cameraMixer.setTime(0);
	}

	// Debug mode
	setDebugMode = () => {
		this.cameraControls = new CameraStateController(this.sceneInstance.newCamera, this.sceneInstance.renderer.domElement, this.sceneInstance.cameraProps.position.clone());

		// this.sceneInstance.camera = this.sceneInstance.newCamera;

		const gui = new GUI();

		const options = {
			// resetCamera: this.cameraControls.cameraHardReset,
			restartCameraAnimation: this.restartCameraAnimation,
			playStop: this.playStop,
			gridHelper: false,
			lightHelper: true,
			axesHelper: false,
			EnvMap: true,
			EnvMapBackground: false,
			switchCamera: false,
			cameraHelper: false,
			cameraHelperMobile: false,
			toneMapping: 'ACESFilmicToneMapping',
			resetSettings: () => this.resetSettings(),
			saveSettings: () => this.saveSettings(gui),
			exportSettings: () => this.exportSettings(gui),
		};

		const commonControlsFolder = gui.addFolder('Common controls');

		commonControlsFolder.add(options, 'restartCameraAnimation').name('Restart camera animation'); // Button
		commonControlsFolder.add(options, 'playStop').name('Play/Pause'); // Button
		// commonControlsFolder.add(options, 'resetCamera').name('Reset debug camera'); // Button

		commonControlsFolder.add(options, 'gridHelper').onChange((value: boolean) => {
			gridHelper.visible = value;
		});

		if (this.gltfDesktopCamera) {
			this.cameraHelper = new THREE.CameraHelper(this.gltfDesktopCamera);
			this.cameraHelper.visible = false;
			this.sceneInstance.scene.add(this.cameraHelper);
		}

		/*if (this.gltfMobileCamera) {
			this.cameraHelperMobile = new THREE.CameraHelper(this.gltfMobileCamera);
			this.sceneInstance.scene.add(this.cameraHelperMobile);
		}*/

		// Camera helper
		commonControlsFolder.add(options, 'cameraHelper').onChange((value: boolean) => {
			if (this.cameraHelper) {
				this.cameraHelper.visible = value;
			}
		});

		/*commonControlsFolder.add(options, 'cameraHelperMobile').onChange((value: boolean) => {
			if (this.cameraHelperMobile) {
				this.cameraHelperMobile.visible = value;
			}
		});*/


		// Axes helper
		const axesHelper = new THREE.AxesHelper(200);
		this.sceneInstance.scene.add(axesHelper);
		commonControlsFolder.add(options, 'axesHelper').onChange((value: boolean) => {
			axesHelper.visible = value;
		});

		/*commonControlsFolder.add(options, 'switchCamera').onChange((value: boolean) => {
			if (this.gltfDesktopCamera && this.backupCamera) {
				this.sceneInstance.camera = value ? this.gltfDesktopCamera : this.backupCamera;
				this.sceneInstance.camera.aspect = this.width / this.height;
				this.sceneInstance.camera.updateProjectionMatrix();
			}
		});*/


		// Grid helper
		const size = 100;
		const divisions = 100;
		const gridHelper = new THREE.GridHelper(size, divisions);
		gridHelper.visible = options.gridHelper;
		this.sceneInstance.scene.add(gridHelper);

		/*
		const debugCamera = {
			position: new THREE.Vector3(0, 0, 5),
			target: new THREE.Vector3(0, 0, 0),
			fov: 75,
			clipDistance: 0.001
		};

		this.backupCamera = new THREE.PerspectiveCamera(debugCamera.fov, window.innerWidth / window.innerHeight, debugCamera.clipDistance, 10000);
		*/
		// this.backupCamera = this.sceneInstance.camera;

		const sceneFolder = gui.addFolder('Scene visual options');

		sceneFolder.add(options, 'EnvMapBackground').onChange((value: boolean) => {
			this.sceneInstance.scene.background = value ? this.envMap : new THREE.Color('#000000');
		});

		sceneFolder.add(options, 'EnvMap').onChange((value: boolean) => {
			this.sceneInstance.scene.environment = value ? this.envMap : null;
		});

		sceneFolder.add(options, 'toneMapping', ['NoToneMapping', 'LinearToneMapping', 'ReinhardToneMapping', 'CineonToneMapping', 'ACESFilmicToneMapping'])
			.name('Tone mapping')
			.onChange((tone: any) => {
				const value: any = {
					NoToneMapping: THREE.NoToneMapping,
					LinearToneMapping: THREE.LinearToneMapping,
					ReinhardToneMapping: THREE.ReinhardToneMapping,
					CineonToneMapping: THREE.CineonToneMapping,
					ACESFilmicToneMapping: THREE.ACESFilmicToneMapping
				};

				this.sceneInstance.renderer.toneMapping = value[tone];
			});

		// Lights
		this.sceneLight.traverse((light: any) => {
			if (light.type != 'PointLight') {
				return;
			}

			light.add(new THREE.PointLightHelper(light, 0.3));
		});

		const lightsFolder = gui.addFolder('Lights');
		const ambientLight = this.sceneLight.getObjectByName('ambient');
		lightsFolder.add(ambientLight, 'intensity', 0, 10);
		lightsFolder.addColor(ambientLight, 'color');

		lightsFolder.add(this.sceneInstance.renderer, 'toneMappingExposure', 0, 10);
		lightsFolder.add(this.sceneInstance.renderer, 'physicallyCorrectLights');


		this.sceneLight.traverse((light: any) => {
			if (light.type != 'PointLight') {
				return;
			}

			const subFolder = lightsFolder.addFolder(light.name);
			subFolder.addColor(light, 'color');
			subFolder.add(light, 'intensity', 0, 5);
			subFolder.add(light, 'distance', 0.1, 100);
			subFolder.add(light, 'decay', 0, 3);

			if (light.name == 'Moving light') {

			} else {
				subFolder.add(light.position, 'x', -10, 10).name('x');
				subFolder.add(light.position, 'y', -10, 10).name('y');
				subFolder.add(light.position, 'z', -10, 10).name('z');
			}

			subFolder.close();
		});

		gui.add(options, 'saveSettings').name('Save settings'); // Button
		gui.add(options, 'exportSettings').name('Export settings'); // Button
		gui.add(options, 'resetSettings').name('Reset saved settings and reload'); // Button
		// commonControlsFolder.close();

		const savedSettings = localStorage.getItem('settings');
		if (savedSettings) {
			gui.load(JSON.parse(savedSettings));
		}
	}

	resetSettings = () => {
		localStorage.setItem('settings', '');
		location.reload();
	}

	saveSettings = (gui: any) => {
		const settings = JSON.stringify(gui.save());
		localStorage.setItem('settings', settings);
	}

	exportSettings = (gui: any) => {
		const settings = JSON.stringify(gui.save(), null, '\t');

		document.querySelector('.copy-settings')?.classList.add('is-visible');

		if (document.querySelector('.copy-settings__content')) {
			document.querySelector('.copy-settings__content')?.insertAdjacentHTML('beforeend', settings);
		}
	}
}

export default SceneController;

