import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type camera = {
	position: THREE.Vector3;
	target: THREE.Vector3;
}

class CameraStateController {
	camera: THREE.PerspectiveCamera;
	orbitControls: any;
	defaultCameraState: THREE.Vector3;
	cameraHardResetState: boolean;

	constructor(camera: THREE.PerspectiveCamera, rendererElt: HTMLElement, defaultState?:THREE.Vector3) {
		this.camera = camera;
		this.orbitControls = new OrbitControls(this.camera, rendererElt);

		this.defaultCameraState = defaultState || new THREE.Vector3(5, 5, 5);
		this.cameraHardResetState = false;

		this.orbitControls.addEventListener('change', () => {
			if (!this.cameraHardResetState) {
				this.saveCameraState(this.camera.position, this.orbitControls.target);
			}
		});

		this.resetCamera();
	}

	saveCameraState = (position: THREE.Vector3, target: THREE.Vector3) => {
		const camera: camera = {
			position,
			target
		};

		localStorage.setItem('camera', JSON.stringify(camera));
	}

	readCameraState = () => {
		let cameraPos: string | null = localStorage.getItem('camera');
		const camera: any = cameraPos && JSON.parse(cameraPos);

		return camera && {
			position: new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z),
			target: new THREE.Vector3(camera.target.x, camera.target.y, camera.target.z),
		}
	}
	
	cameraHardReset = (newPosition: THREE.Vector3) => {
		localStorage.removeItem('camera');
		this.cameraHardResetState = true;
		this.resetCamera();
		this.cameraHardResetState = false;
	}

	resetCamera = () => {
		const state = this.readCameraState();
		// отрефакторить эту колбасу и писать в стейт текущий или дефолтный
		if (state) {
			this.camera.position.x = state.position.x;
			this.camera.position.y = state.position.y;
			this.camera.position.z = state.position.z;
			this.camera.lookAt(state.target);
			
			this.orbitControls.position0 = state.position;
			this.orbitControls.target  = state.target;
			this.orbitControls.target0 = state.target;
		} else {
			this.camera.position.x = this.defaultCameraState.x;
			this.camera.position.y = this.defaultCameraState.y;
			this.camera.position.z = this.defaultCameraState.z;
			this.camera.lookAt(0, 0, 0);
			
			if (this.orbitControls) {
				this.orbitControls.position0 = this.camera.position;
				this.orbitControls.target    = new THREE.Vector3(0, 0, 0);
				this.orbitControls.target0   = new THREE.Vector3(0, 0, 0);
			}
		}
	}
}

export default CameraStateController;