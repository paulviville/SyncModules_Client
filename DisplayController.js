/// display controller for Wilder || Wall displays
import * as THREE from "../three/three.module.js";

export default class DisplayController {
	#module;

	#pov;

	constructor ( ) {
		console.log( "DisplayController - constructor" );

		this.#pov = new THREE.Vector3( 0.1, 1, 0.05 );
	}

	setModule ( module ) {
		this.#module = module;
	
		this.#module.setOnChange( this.#module.commands.updateTransform, ( ) => { this.updateMatrices( ); }	)
		this.#module.setOnChange( this.#module.commands.addDisplay, ( ) => { this.updateMatrices( ); }	)
	}

	updateMatrices ( ) {
		console.log( "DisplayController - updateMatrices" );

		const transformMatrix = this.#transformMatrix;

		for ( const display of this.#module.displays ) {

			console.log( display );
		}		
	}

	get #transformMatrix ( ) {
		const { translation, rotation, scale } = this.#module.transform;
		// console.log( translation, rotation, scale );
		const matrix = new THREE.Matrix4( );
		matrix.compose( 
			new THREE.Vector3( ...translation ), 
			new THREE.Quaternion( ...rotation ), 
			new THREE.Vector3( ...scale)
		);
		// console.log( matrix );
		return matrix;
	}

	#processCorners ( display, transform ) {
		const corners = display.corners.map( c => new THREE.Vector3( ).fromArray( c ) );
		corners.forEach( c => c.applyMatrix4( transform ) );

		
	}
}