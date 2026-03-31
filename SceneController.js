import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/controls/OrbitControls.js';
import CameraController from './SyncModulesViews/Controllers/CameraController.js';


export default class SceneController {
	#renderer;
	#scene;
	#camera;
	#cameraController;
	#orbitControls;

	constructor ( ) {
		console.log( `SceneController - constructor` );
		
		this.#renderer = new THREE.WebGLRenderer({antialias: true});
		this.#renderer.autoClear = false;
		this.#renderer.setPixelRatio( window.devicePixelRatio );
		this.#renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.#renderer.domElement );

		this.#scene = new THREE.Scene( );
        this.#scene.background = new THREE.Color(0xcccccc);
		this.#camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.#camera.position.set( -2, 3, -3 );
		this.#cameraController = new CameraController( this.#camera, this.#renderer.domElement);
		// this.#orbitControls = new OrbitControls( this.#camera, this.#renderer.domElement);
		// console.log(this.#orbitControls)
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
		this.#scene.add(ambientLight);
		const pointLight = new THREE.PointLight( 0xffffff, 120);
		pointLight.position.set(-2, 3, -4);
		this.#scene.add(pointLight);
		this.#addDebug( );

		window.onresize = this.#onWindowResize.bind( this );
	}



	#addDebug ( ) {
		const axesHelper = new THREE.AxesHelper( );
		this.#scene.add( axesHelper );
		const gridHelper = new THREE.GridHelper( );
		this.#scene.add( gridHelper );
	}

	#onWindowResize ( ) {
		this.#camera.aspect = window.innerWidth / window.innerHeight;
		this.#camera.updateProjectionMatrix();

		this.#renderer.setSize(window.innerWidth, window.innerHeight);
	}

	#animate ( ) {
		this.#renderer.render(this.#scene, this.#camera);
	}

	startRender ( ) {
		this.#renderer.setAnimationLoop( this.#animate.bind(this) );
	}

	stopRender ( ) {
		this.#renderer.setAnimationLoop(null);
	}

	get camera ( ) {
		return this.#camera;
	}

	get controls ( ) {
		return this.#cameraController;
	}

	get scene ( ) {
		return this.#scene;
	}
}