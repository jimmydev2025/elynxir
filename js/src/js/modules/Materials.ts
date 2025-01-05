// @ts-nocheck
import * as THREE from 'three';
import GUI from 'lil-gui';
import getQuery from '../app/utils/getQuery';

/*const basicStandardOptions = {
	color: new THREE.Color(0xffffff),
	roughness: 1.0,
	metalness: 0.0,

	map: null,

	lightMap: null,
	lightMapIntensity: 1.0,

	aoMap: null,
	aoMapIntensity: 1.0,

	emissive: new THREE.Color(0x000000),
	emissiveIntensity: 1.0,
	emissiveMap: null,

	bumpMap: null,
	bumpScale: 1,

	normalMap: null,
	normalMapType: THREE.TangentSpaceNormalMap,
	normalScale: new THREE.Vector2( 1, 1 ),

	displacementMap: null,
	displacementScale: 1,
	displacementBias: 0,

	roughnessMap: null,

	metalnessMap: null,

	alphaMap: null,

	envMap: null,
	envMapIntensity: 1.0,

	refractionRatio: 0.98,

	wireframe: false,
	wireframeLinewidth: 1,
	wireframeLinecap: 'round',
	wireframeLinejoin: 'round',

	flatShading: false,
}

const basicPhysicalOptions = {
	clearcoatMap: null,
	clearcoatRoughness: 0.0,
	clearcoatRoughnessMap: null,
	clearcoatNormalScale: new THREE.Vector2(1, 1),
	clearcoatNormalMap: null,

	ior: 1.5,
	sheenColor: new THREE.Color(0x000000),
	sheenColorMap: null,
	sheenRoughness: 1.0,
	sheenRoughnessMap: null,

	transmissionMap: null,

	thickness: 0,
	thicknessMap: null,
	attenuationDistance: 0.0,
	attenuationColor: new THREE.Color(1, 1, 1),

	specularIntensity: 1.0,
	specularIntensityMap: null,
	specularColor: new THREE.Color(1, 1, 1),
	specularColorMap: null,
};*/

class Materials {
	assets: any;
	gui: any;
	// private materialOptions: any;
	envMap?: any;
	blinnNormalMap: any;
	debug: boolean = getQuery('debug') == '1';

	glassMaterialOptions: any;

	constructor(assets: any) {
		this.assets = assets;
		// console.log('this.assets', this.assets);
		// this.envMap = this.#getTextureByName('envMap')?.texture;
		// this.normalMap = this.#getTextureByName('basicNormalMap').texture;
		// this.blinnNormalMap = this.#getTextureByName('blinn2_normal').texture;


		/* Glass test options
			"transmission": 1,
			"ior": 1.5,
			"thickness": 3.95,
			"reflectivity": 0.01,


			Original
			"transmission": 0.985,
			"ior": 1.014,
			"thickness": 0.55,
			"reflectivity": 0.01800000000000007,
		*/

		this.glassMaterialOptions = {
			name: 'glassMaterial',
			"transparent": true,
				"opacity": 1,
				"color": "#322F2F",
				"metalness": 0,
				"roughness": 0.597,
				"clearcoat": 1,
				"clearcoatRoughness": 0.259,
				"sheenColor": "#ffffff",
				"sheen": 0,
				"specularIntensity": 0.376,
				"transmission": 0.985,
				"ior": 1.014,
				"thickness": 0.55,
				"reflectivity": 0.01800000000000007,
				"refractionRatio": 0.966,
				"envMapIntensity": 0.068
		};
		
		this.headMaterialOptions = {
			name: 'headMaterial',
			"transparent": true,
				"opacity": 1,
				"color": "#322F2F",
				"metalness": 0,
				"roughness": 0.597,
				"clearcoat": 1,
				"clearcoatRoughness": 0.259,
				"sheenColor": "#ffffff",
				"sheen": 0,
				"specularIntensity": 0.376,
				"transmission": 0.985,
				"ior": 1,
				"thickness":0,
				"reflectivity": 0.01800000000000007,
				"refractionRatio": 0.966,
				"envMapIntensity": 0.068
		};

		this.topHandMaterialOptions = {
			name: 'topHandMaterial',
			"transparent": true,
				"opacity": 0.9,
				"color": "#110E11",
				"metalness": 0,
				"roughness": 0.5,
				"clearcoat": 1,
				"clearcoatRoughness": 0.259,
				"sheenColor": "#5F4E5F",
				"sheen": 0.488,
				"specularIntensity": 0.271,
				"transmission": 0.985,
				"ior": 1.4307243558580458,
				"thickness":0,
				"reflectivity": 0.4430000000000001,
				"refractionRatio": 0.692,
				"envMapIntensity": 0.031
		};

		this.topHandMaterialOptions2 = {
			name: 'topHandMaterial2',
			"transparent": true,
				"opacity": 1,
				"color": "#251D25",
				"metalness": 1,
				"roughness": 0.5,
				"clearcoat": 1,
				"clearcoatRoughness": 0.259,
				"sheenColor": "#5F4E5F",
				"sheen": 0.1,
				"specularIntensity": 0.271,
				"transmission": 0.985,
				"ior": 1.4307243558580458,
				"thickness":0,
				"reflectivity": 0.4430000000000001,
				"refractionRatio": 0.692,
				"envMapIntensity": 0.0
		};


		this.handMaterialOptions = {
			name: 'handMaterial',
			"transparent": true,
				"opacity": 1,
				"color": "#1C023B",
				"metalness": 0.173,
				"roughness": 0.475,
				"clearcoat": 1,
				"clearcoatRoughness": 0.421,
				"sheenColor": "#2A2828",
				"sheen": 0.443,
				"specularIntensity": 0,
				"transmission": 0.985,
				"ior": 2.3333333333333335,
				"thickness": 0,
				"reflectivity": 1,
				"refractionRatio": 1.156,
				"envMapIntensity": 0.061
		};


		this.smallRingsMaterialOptions = {
			name: 'smallRingsMaterial',
			"transparent": true,
				"opacity": 1,
				"color": "#0A0A0A",
				"metalness": 1,
				"roughness": 0.285,
				"clearcoat": 0.406,
				"clearcoatRoughness": 0.534,
				"sheenColor": "#000000",
				"sheen": 0,
				"specularIntensity": 0.026,
				"transmission": 0,
				"ior":0,
				"thickness": 0,
				"reflectivity": 0,
				"refractionRatio": 0,
				"envMapIntensity":0.087
		};

		this.smallRingsMaterialOptions2 = {
			name: 'smallRingsMaterial2',
			"transparent": true,
				"opacity": 1,
				"color": "#0A0A0A",
				"metalness": 1,
				"roughness": 0.285,
				"clearcoat": 0.406,
				"clearcoatRoughness": 0.534,
				"sheenColor": "#000000",
				"sheen": 0,
				"specularIntensity": 0.026,
				"transmission": 0,
				"ior":0,
				"thickness": 0,
				"reflectivity": 0,
				"refractionRatio": 0,
				"envMapIntensity":0.018
		};

		this.bigRingsMaterialOptions = {
			name: 'bigRingsMaterial',
			"transparent": false,
			"opacity": 1,
			"color": "#A76FCE",
			"metalness": 1,
			"roughness": 0.833,
			"clearcoat": 0,
			"clearcoatRoughness": 0.391,
			"sheenColor": "#000000",
			"sheen": 0.526,
			"specularIntensity": 0,
			"transmission": 0,
			"ior": 1.239,
			"thickness": 28.15,
			"reflectivity": 0.5110000000000001,
			"refractionRatio":0.902,
			"envMapIntensity":0.016
		}

		this.KnotMaterialOptions = {
			name: 'KnotMaterial',
			"transparent": false,
			"opacity": 1,
			"color": "#000000",
			"metalness": 1,
			"roughness": 0.188,
			"clearcoat": 1,
			"clearcoatRoughness":0.9,
			"sheenColor": "#000000",
			"sheen": 0,
			"specularIntensity": 1,
			"transmission": 0,
			"ior": 2.223,
			"thickness": 25.9,
			"reflectivity":1,
			"refractionRatio": 1.18,
			"envMapIntensity": 0.038
			
			// normalMap: this.blinnNormalMap,
			// normalMapType: THREE.TangentSpaceNormalMap,
			// normalScale: new THREE.Vector2(1, -1),
			
			/*alphaMap: new THREE.Texture( <Image> ),
			map: new THREE.Texture( <Image> ),
			
			lightMap: new THREE.Texture( <Image> ),
			lightMapIntensity: <float>
			
			aoMap: new THREE.Texture( <Image> ),
			aoMapIntensity: <float>
			
			emissive: <hex>,
			emissiveIntensity: <float>
			emissiveMap: new THREE.Texture( <Image> ),
			
			bumpMap: new THREE.Texture( <Image> ),
			bumpScale: <float>,
			
			
			displacementMap: new THREE.Texture( <Image> ),
			displacementScale: <float>,
			displacementBias: <float>,
			
			roughnessMap: new THREE.Texture( <Image> ),
			
			metalnessMap: new THREE.Texture( <Image> ),
			
			wireframe: <boolean>,
			wireframeLinewidth: <float>,
			
			flatShading: <bool>

			clearcoat: <float>,
			clearcoatMap: new THREE.Texture( <Image> ),
			clearcoatRoughness: <float>,
			clearcoatRoughnessMap: new THREE.Texture( <Image> ),
			clearcoatNormalScale: <Vector2>,
			clearcoatNormalMap: new THREE.Texture( <Image> ),
			
			reflectivity: <float>,
			sheen: <float>,
			sheenColor: <Color>,
			sheenColorMap: new THREE.Texture( <Image> ),
			sheenRoughness: <float>,
			sheenRoughnessMap: new THREE.Texture( <Image> ),
			transmissionMap: new THREE.Texture( <Image> ),
			
			thicknessMap: new THREE.Texture( <Image> ),
			attenuationDistance: <float>,
			attenuationColor: <Color>,
			specularIntensity: <float>,
			specularIntensityMap: new THREE.Texture( <Image> ),
			specularColor: <Color>,
			specularColorMap: new THREE.Texture( <Image> )*/
		}



		this.init();
	}

	init = () => {
		if (this.debug) {
			this.gui = new GUI({
				title: 'Materials',
				container: document.querySelector('.lil-gui-materials')
			});
		}


		this.glass = this.#glassMaterial();
		this.bigRings = this.#bigRingsMaterial();
		this.Knot = this.#KnotMaterial();
		this.tophand = this.#topHandMaterial()
		this.tophand2 = this.#topHandMaterial2()
		this.smallrings=this.#smallRingsMaterial()
		this.smallrings2=this.#smallRingsMaterial2()
		this.hand=this.#handMaterial()
		this.head = this.#headMaterial()

		if (this.debug) {
			if (localStorage.getItem('materials')) {
				this.gui.load(JSON.parse(localStorage.getItem('materials')));
			}

			this.gui.add({saveMaterials: () => {
				// console.log('this.gui.save()', this.gui.save());
				localStorage.setItem('materials', JSON.stringify(this.gui.save()));
			}}, 'saveMaterials').name('Save materials');

			this.gui.add({exportMaterials: () => {
				document.querySelector('.copy-settings').classList.add('is-visible');
				document.querySelector('.copy-settings__content').insertAdjacentHTML('beforeend', JSON.stringify(this.gui.save(), null, '\t'));
			}}, 'exportMaterials').name('Export materials');

			this.gui.add({resetSavedMaterials: () => {
				localStorage.setItem('materials', '');
				location.reload();
			}}, 'resetSavedMaterials').name('Reset saved materials and reload');
		}

		/*this.gui.onChange(event => {
			console.log('this.glass', this.glass);
			this.glass.needsUpdate = true;
			this.blackMetall.needsUpdate = true;
		})*/

		// this.maneken = this.#manekenMaterial()
		// this.hand = this.#handMaterial();
		// this.rings_small = this.#rings_smallMaterial();
		// this.Abstract_big = this.#Abstract_bigMaterial();
		// this.BG_rings = this.#BG_ringsMaterial();

		// this.Torus_02_low = this.#Torus_02_lowMaterial();
	}

	#getTextureByName = (name: string) => {
		// console.log('this.assets.textures', this.assets);
		return this.assets.textures.filter((item: any) => {
			return item.name === name;
		})[0];
	}

	#glassMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.glassMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('Glass material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}

	#headMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.headMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('Head material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}

	#smallRingsMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.smallRingsMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('Small rings material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}

	#smallRingsMaterial2 = () => {
		const material = new THREE.MeshPhysicalMaterial(this.smallRingsMaterialOptions2);

		if (this.debug) {
			const folder = this.gui.addFolder('Small rings material 2');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}



	#handMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.handMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('Hand material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}


	#topHandMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.topHandMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('topHand material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}

	#topHandMaterial2 = () => {
		const material = new THREE.MeshPhysicalMaterial(this.topHandMaterialOptions2);

		if (this.debug) {
			const folder = this.gui.addFolder('News hand material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);

			folder.close();
		}

		return material;
	}

	#bigRingsMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.bigRingsMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('Big rings material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);
		}

		return material;
	}

	#KnotMaterial = () => {
		const material = new THREE.MeshPhysicalMaterial(this.KnotMaterialOptions);

		if (this.debug) {
			const folder = this.gui.addFolder('Knot material');
			folder.add(material, 'transparent');
			folder.add(material, 'opacity', 0, 1);
			folder.addColor(material, 'color');
			folder.add(material, 'metalness', 0, 1);
			folder.add(material, 'roughness', 0, 1);
			folder.add(material, 'clearcoat', 0, 1);
			folder.add(material, 'clearcoatRoughness', 0, 1);
			folder.addColor(material, 'sheenColor');
			folder.add(material, 'sheen', 0, 1);
			folder.add(material, 'specularIntensity', 0, 1);
			folder.add(material, 'transmission', 0, 1);
			folder.add(material, 'ior', 0, 3);
			folder.add(material, 'thickness', 0, 50);
			folder.add(material, 'reflectivity', 0, 1);
			folder.add(material, 'refractionRatio', 0, 2);
			/*folder.add(material, 'envMap').onChange((value: boolean) => {
				material.envMap = value ? this.envMap : null;
			});*/
			folder.add(material, 'envMapIntensity', 0, 1);
		}

		return material;
	}
}

export default Materials;