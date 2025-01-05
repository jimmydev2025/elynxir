import App from './index';
import Module from './Module';
import { Events } from '../app/Constants';

import * as THREE from 'three';
import getQuery from '../app/utils/getQuery';

interface Options {
	canvas: HTMLElement
}


/*
Все что связано с базовым наполнением сцены
Свет, материалы и прочий статичный контент
*/

export default class Scene extends Module {
	options: Options;
	cameraProps: {
		position: THREE.Vector3,
		target: THREE.Vector3,
		clipDistance: number;
		fov: number
	};

	scene:  THREE.Scene;
	camera: THREE.PerspectiveCamera;
	newCamera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	lights: THREE.Group;

	renderPreloaderState: boolean = false;
	renderSceneState: boolean = false;
	renderBasementState: boolean = false;

	preloaderScene: THREE.Scene;
	preloaderCamera: THREE.PerspectiveCamera;

	basementScene: THREE.Scene;
	basementCamera: THREE.PerspectiveCamera;

	materials: any = {};
	width: number;
	height: number;

	constructor(options: Options) {
		super();
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.options = options;

		this.cameraProps = {
			position: new THREE.Vector3(0, 0, 5),
			target: new THREE.Vector3(0, 0, 0),
			fov: 75,
			clipDistance: 0.001
		};

		this.scene = this.initScene();
		this.camera = this.initCamera();
		this.newCamera = this.initCamera();
		this.scene.add(this.newCamera);

		this.preloaderScene  = this.initPreloaderScene();
		this.preloaderCamera = this.initPreloaderCamera();

		this.basementScene  = this.initBasementScene();
		this.basementCamera = this.initBasementCamera();

		this.renderer = this.initRenderer();
		this.lights = this.initLight();

		this.init();
	}

	init() {
		this.publish(Events.sceneInited, { data: 'Scene loaded event' })
	}

	initScene = () => {
		const scene = new THREE.Scene();
		// this.scene.background = new THREE.Color(0xaaaaaa);

		return scene;
	}

	initCamera() {
		const camera = new THREE.PerspectiveCamera(this.cameraProps.fov, this.width / this.height, this.cameraProps.clipDistance, 10000);
		camera.position.copy(this.cameraProps.position);
		camera.lookAt(this.cameraProps.target);

		return camera;
	}

	initPreloaderScene = () => {
		return new THREE.Scene();
	}

	initPreloaderCamera = () => {
		const camera = new THREE.PerspectiveCamera(this.cameraProps.fov, this.width / this.height, this.cameraProps.clipDistance, 10000);
		camera.position.copy(this.cameraProps.position);
		camera.lookAt(this.cameraProps.target);

		return camera;
	}

	initBasementScene = () => {
		return new THREE.Scene();
	}

	initBasementCamera = () => {
		const camera = new THREE.PerspectiveCamera(this.cameraProps.fov, this.width / this.height, this.cameraProps.clipDistance, 10000);
		camera.position.copy(this.cameraProps.position);
		camera.lookAt(this.cameraProps.target);

		return camera;
	}



	initRenderer = () => {
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			// stencil: false,
			// depth: false
			// powerPreference: "high-performance" 
		});

		// Render settings
		renderer.setSize(this.width, this.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		renderer.setClearColor("black");
		renderer.toneMappingExposure = 6.09;
		renderer.toneMapping = THREE.CineonToneMapping;
		renderer.physicallyCorrectLights = true;
		renderer.outputEncoding = THREE.sRGBEncoding;

		// renderer.shadowMap.enabled = true;
		// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.options.canvas.appendChild(renderer.domElement);

		return renderer;
	}

	updateSceneCamera = () => {

	}

	enableBloom = () => {

	}

	initLight = () => {
		const lightGroup = new THREE.Group();
		this.scene.add(lightGroup);

		const lightProps = {
			"x":0,
			"y":5.3,
			"z":30,
			"color":3620169,
			"intensity":5550.8,
			"distance":100.4,
			"angle":0.553,
			"penumbra":1,
			"decay":1.2
		};

		// Spot Light
		const spotLight = new THREE.SpotLight(
			lightProps.color,
			lightProps.intensity,
			lightProps.distance,
			lightProps.angle,
			lightProps.penumbra,
			lightProps.decay
		);

		spotLight.position.set(lightProps.x, lightProps.y, lightProps.z);

		spotLight.castShadow = true;

		spotLight.shadow.mapSize.width = 2048;
		spotLight.shadow.mapSize.height = 2048;

		spotLight.shadow.camera.near = 500;
		spotLight.shadow.camera.far = 4000;
		spotLight.shadow.camera.fov = 60;

		spotLight.lookAt(0, 1, 0);
		// lightGroup.add(spotLight);

		// Spot Light 2
		const spotLight1 = new THREE.SpotLight(
			lightProps.color,
			lightProps.intensity,
			lightProps.distance,
			lightProps.angle,
			lightProps.penumbra,
			lightProps.decay
		);

		spotLight1.position.set(lightProps.x, lightProps.y, -50);
		spotLight1.castShadow = true;

		spotLight1.shadow.mapSize.width = 2048;
		spotLight1.shadow.mapSize.height = 2048;

		spotLight1.shadow.camera.near = 500;
		spotLight1.shadow.camera.far = 4000;
		spotLight1.shadow.camera.fov = 60;

		spotLight1.lookAt(0, 1, 0);
		// lightGroup.add(spotLight1);

		// Ambient
		// const ambientLight = new THREE.AmbientLight('white', 0.3);
		// lightGroup.add(ambientLight);

		const pointLight1 = new THREE.PointLight("#0000ff" , 1);
		pointLight1.position.y = 1.5868
		pointLight1.position.x = 1.7197
		pointLight1.position.z = 3
		// lightGroup.add(pointLight1);

		const pointLight2 = new THREE.PointLight("#7009b5" , 30);
		pointLight2.position.y = -1.5868
		pointLight2.position.x = -0.7197
		pointLight2.position.z = -10
		// lightGroup.add(pointLight2);

		return lightGroup;
	}

	getCameraViewportSize = () => {
		const angRad = this.camera.fov * Math.PI / 180;
		const fovY = this.camera.position.z * Math.tan(angRad / 2) * 2;
		const width = fovY * this.camera.aspect;
		const height = fovY;

		return {
			width,
			height
		}
	}

	render = () => {
		// this.renderer.autoClear = true;

		if (this.renderSceneState) {
			this.renderer.render(this.scene, this.camera);
		}
	}

	onWindowResize = (width: number, height: number) => {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.preloaderCamera.aspect = width / height;
		this.preloaderCamera.updateProjectionMatrix();

		this.basementCamera.aspect = width / height;
		this.basementCamera.updateProjectionMatrix();

		this.renderer?.setSize(width, height);
	}
}