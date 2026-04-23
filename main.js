import ClientManager from "./ClientManager.js";
import ClientNetwork from "./ClientNetwork.js";
import GUIController from "./GUIController.js";
import ViewsRegistry from "./SyncModulesViews/ViewsRegistry.js";
import SceneController from "./SceneController.js";
import CameraController from "./SyncModulesViews/Controllers/CameraController.js";

import { GLTFLoader } from "../three/loaders/GLTFLoader.js";
import { GLTFExporter } from "../three/exporters/GLTFExporter.js";
import { DRACOLoader } from "../three/loaders/DRACOLoader.js";
import GLTFImportController from "./SyncModulesViews/Controllers/GLTFImportController.js";
// import { error } from "three/src/utils.js";


// new CameraController
const SCOPES = {
	SYSTEM: "SYSTEM",
	INSTANCE: "INSTANCE",
	MODULE: "MODULE",
};

const INSTANCE_COMMANDS = {
	INSTANCE_LIST: "INSTANCE_LIST",
	INSTANCE_ADD: "INSTANCE_ADD",
	INSTANCE_REMOVE: "INSTANCE_REMOVE",
	INSTANCE_JOIN: "INSTANCE_JOIN",
	INSTANCE_LEAVE: "INSTANCE_LEAVE",
}

const instanceList = new Set( );


// const sceneController = new SceneController( );
// sceneController.startRender( );


const clientManager = new ClientManager( );
// const clientNetwork = new ClientNetwork( );
const guiController = new GUIController( );

// const viewsRegistry = new ViewsRegistry(clientManager.modulesRegistry );
// sceneController.scene.add(clientManager.viewsRegistry);


clientManager.connect( );



window.clientManager = clientManager;
// window.onbeforeunload( ( event ) =>  );
window.addEventListener("beforeunload", (event) => { clientManager.beforeUnload( event ) } );

// const testUUID = "00000000-0000-0000-0000-000000000000";
let testModule;

window.addModule = ( type, sync = false ) => {
	// clientManager.modulesRegistry.input({
	// 	moduleUUID: "00000000-0000-0000-0000-000000000000",
	// 	command: "ADD_MODULE",
	// 	data: { type: "ModuleCore", UUID: crypto.randomUUID()},
	// });
	console.log(clientManager.modulesRegistry)
	const UUID = crypto.randomUUID();
	clientManager.modulesRegistry.addModule(
		type,
		UUID,
		sync
	);

	testModule = clientManager.modulesRegistry.modules.get( UUID );
	window.module = testModule;
}




window.removeModule = ( UUID, sync = false ) => {
	clientManager.modulesRegistry.removeModule( testModule.UUID, sync );
}


window.addInstance = ( ) => {
	const instanceUUID = crypto.randomUUID( );
	instanceList.add( instanceUUID );

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_ADD,
			data: {
				instanceUUID: instanceUUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

window.removeInstance = ( instanceUUID ) => {
	instanceList.delete( instanceUUID );

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_REMOVE,
			data: {
				instanceUUID: instanceUUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

window.joinInstance = ( instanceUUID ) => {

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_JOIN,
			data: {
				instanceUUID: instanceUUID,
				userUUID: clientNetwork.UUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

window.leaveInstance = ( instanceUUID ) => {

	const messageData = {
		senderUUID: clientManager.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_LEAVE,
			data: {
				instanceUUID: instanceUUID,
				userUUID: clientNetwork.UUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientManager.clientNetwork.send( message );
}

let pointsModule = null;
window.testPoints = ( ) => {
	const UUID = crypto.randomUUID();
	const module = clientManager.modulesRegistry.addModule(
		"PointsModule",
		UUID,
		true
	);
	module.addPoints([{UUID: 1234, position: [1,2,3]}, {UUID: 2345, position: [2,3,4]}], true)
	module.addPoints([{UUID: 3456, position: [-1,2,-3]}, {UUID: 4567, position: [2,-3,4]}], true )

	// module.removePoints( [{UUID: 1234 }]);
	const state = module.getState();
	console.log(state)

	pointsModule = module;
	// module.clear( )
}

window.testPoints2 = ( ) => {
	const module = pointsModule;

	// module.removePoints( [{UUID: 1234}, {UUID: 3456}, {UUID: 4567}]);

	
	module.clear( true )
}

let textLogModule = null;
window.testTextLog = ( ) => {
	const UUID = crypto.randomUUID();
	const textLogModule = clientManager.addModule(
		"TextLogModule",
		true,
		true,
		true
	);
	
	window.textLogModule = textLogModule;

	textLogModule.addText( "test 0 ", true );
	textLogModule.addText( "test 1 ", true );
	textLogModule.addText( "test 2 ", true );
}

window.testTrigger = ( ) => {
	const triggerModule = clientManager.addModule(
		"TriggerModule",
		true,
		true,
		true
	);
	
	window.triggerModule = triggerModule;
}


function glbInjection ( arrayBuffer ) {
	const view = new DataView(arrayBuffer);
	const jsonChunkLength = view.getUint32(12, true);
	const jsonBytes = new Uint8Array(arrayBuffer, 20, jsonChunkLength);
	const jsonString = new TextDecoder().decode(jsonBytes);
	const json = JSON.parse(jsonString);
	console.log(json)

	if ( json.nodes ) {

	}
}

let fileModule = null;

window.testFileModule = ( ) => {
	const fileModule = clientManager.addModule(
		"GLTFModule",
		true,
		true,
		true
	);
	
	window.fileModule = fileModule;

	const input = document.createElement("input");
	input.type = "file";
	// input.accept = ".glb,model/gltf-binary";

	input.onchange = ( ) => {
		const file = input.files[0];
		if( !file ) return;
		console.log( file );

		const reader = new FileReader( );
		reader.onload = ( ) => {
			// const fileData = 
			// console.log(JSON.stringify({
			// 	name: file.name,
			// 	type: file.type,
			// 	data: reader.result
			// }));
			
			const result = reader.result;
			glbInjection( result )
			// const dracoLoader = new DRACOLoader( );
			// dracoLoader.setDecoderPath("../three/loaders/DracoUtils/");
			// const gltfLoader = new GLTFLoader( );
			// gltfLoader.setDRACOLoader( dracoLoader );
			// const gltfExporter = new GLTFExporter( );

			// const base64 = result.split( ',' )[ 1 ];
			// const binary = atob( base64 );
			// // console.log(binary)
			// const bytes = new Uint8Array( binary.length );
			// for ( let i = 0; i < binary.length; ++i ) {
			// 	bytes[ i ] = binary.charCodeAt( i );
			// }
			// const buffer = bytes.buffer;
			// gltfLoader.parse( buffer, ' ', ( gltf ) => {
			// 	console.log( gltf );
			// 	gltf.scene.traverse( ( obj ) => {
			// 		// console.log(obj.name)
			// 	} );
			// 	gltfExporter.parse( gltf.scene,
			// 		( glb ) => {

			// 			const bytes = new Uint8Array(glb);
			// 			let binary = '';
			// 			bytes.forEach(b => binary += String.fromCharCode(b));

			// 			console.log(binary)
			// 			fileModule.updateFile({
			// 				name: file.name,
			// 				type: file.type,
			// 				data: 'data:model/gltf-binary;base64,' + btoa( binary )
			// 			}, true )
			// 			console.log( glb )

			// 		},
			// 		( error ) => console.log( error ),
			// 		{ binary: true }
			// 	);

			// });


			// fileModule.updateFile({
			// 	name: file.name,
			// 	type: file.type,
			// 	data: reader.result
			// }, true )


		};

		reader.readAsArrayBuffer( file ); 
	}
	input.click();


}



window.testFileModule2 = ( ) => {
	const graphModule = clientManager.addModule(
		"GLTFModule",
		true,
		true,
		true
	);
	
	window.graphModule = graphModule;

	const gltfImportController = new GLTFImportController( );
	gltfImportController.setModule( graphModule );
	gltfImportController.inputFile( );

}

window.testFileModule3 = ( ) => {
	clientManager.sceneController.sceneGraphController.setModule( window.graphModule );
	clientManager.sceneController.sceneGraphController.setTargetNode( window.graphModule.nodeUUIDs[1] );
}
