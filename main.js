import ClientManager from "./ClientManager.js";
import ClientNetwork from "./ClientNetwork.js";
import GUIController from "./GUIController.js";
import ViewsRegistry from "./SyncModulesViews/ViewsRegistry.js";
import SceneController from "./SceneController.js";
import CameraController from "./SyncModulesViews/Controllers/CameraController.js";

import GLTFImportController from "./SyncModulesViews/Controllers/GLTFImportController.js";
import ImageImportController from "./SyncModulesViews/Controllers/ImageImportController.js";
import ImageModule from "./SyncModules/ImageModule.js";
// import { error } from "three/src/utils.js";
import * as THREE from "./three/three.module.js";

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


clientManager.connect("ws://130.79.90.188");
// clientManager.connect();

// clientManager.connect("wss://gscop-continuum.g-scop.grenoble-inp.fr", "443");
// clientManager.connect("wss://icos.univ-reims.fr", "443");

const sceneController = clientManager.sceneController;
console.log(sceneController)



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

window.testFileModule3 = ( node = 0 ) => {
	clientManager.sceneController.sceneGraphController.setModule( window.graphModule );
	clientManager.sceneController.sceneGraphController.setTargetNode( window.graphModule.nodeUUIDs[node] );
}


window.testImageModule = ( x = 0, y = 0, z = 0 ) => {
	const imageModule = clientManager.addModule(
		"ImageModule",
		true,
		true,
		true,
	);

	const imageImportController = new ImageImportController( );
	imageImportController.setModule( imageModule );
	imageImportController.inputFile( );

	imageModule.updateTransform( { translation: [ x, y, z] }, true );
}

window.testImage360Module = ( x = 0, y = 0, z = 0 ) => {
	const imageModule = clientManager.addModule(
		"Image360Module",
		true,
		true,
		true,
	);

	const imageImportController = new ImageImportController( );
	imageImportController.setModule( imageModule );
	imageImportController.inputFile( );

	imageModule.updateTransform( { translation: [ x, y, z] }, true );
}

const bones = [ ];
let skelHelper;
let skelModule;
let boneTransforms;
window.skeletonTest = ( ) =>  {
	const boneUUIDs = [
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
		{
			UUID: crypto.randomUUID( ),
			parent: undefined,
		},
	]
	boneUUIDs[ 1 ].parent = boneUUIDs[ 0 ].UUID;
	boneUUIDs[ 2 ].parent = boneUUIDs[ 1 ].UUID;
	boneUUIDs[ 3 ].parent = boneUUIDs[ 1 ].UUID;

	boneTransforms = [
		{
			UUID: boneUUIDs[ 0 ].UUID,
			transform: {
				translation: [ 0, 1, 0.5 ],
			},
		},
		{
			UUID: boneUUIDs[ 1 ].UUID,
			transform: {
				translation: [ 1, 0, 0 ],
			},
		},
		{
			UUID: boneUUIDs[ 2 ].UUID,
			transform: {
				translation: [ 0, 1, 0 ],
			},
		},
		{
			UUID: boneUUIDs[ 3 ].UUID,
			transform: {
				translation: [ 0, 0, 1 ],
			},
		},
	]

	skelModule = clientManager.addModule( "SkeletonModule", 
		true,
		true,
		true
	);

	skelModule.setBones( boneUUIDs, true );

	skelModule.setTransforms( boneTransforms, true );
}

window.skeletonTest2 = ( ) =>  {
	boneTransforms[0].transform.translation = [ 1, 0, 1 ];
	boneTransforms[1].transform.translation = [ 0, 1, 1 ];
	boneTransforms[2].transform.translation = [ 1, 0, 1 ];
	boneTransforms[3].transform.translation = [ 1, 1, 1 ];
	skelModule.setTransforms( boneTransforms, true );

}

window.skeletonTest3 = ( ) =>  {
	const r0 = new THREE.Quaternion( ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0), Math.PI / 3  );
	boneTransforms[0].transform.rotation = r0.toArray( );
	skelModule.setTransforms( boneTransforms, true );

}