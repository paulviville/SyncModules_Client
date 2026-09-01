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

// import * as ml5 from "./ml5.js";



function uuid( ) {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}


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
// clientManager.connect("ws://130.79.90.188", "3001");
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
	const UUID = uuid();
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
	const instanceUUID =uuid( );
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
	const UUID = uuid();
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
	const UUID = uuid();
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
let boneTransforms = [ ];
window.skeletonTest = ( ) =>  {
	const boneUUIDs = [
		{
			UUID: uuid( ),
			parent: undefined,
		},
		{
			UUID: uuid( ),
			parent: undefined,
		},
		{
			UUID: uuid( ),
			parent: undefined,
		},
		{
			UUID: uuid( ),
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



let video;
let ctx;
let canvas;
window.initCamera = async function ( ) {
	video = document.getElementById('webcam');

	const stream = await navigator.mediaDevices.getUserMedia({
	video: true,
	audio: false
	});

	video.srcObject = stream;

	// Wait for video metadata
	await new Promise(resolve => {
		video.onloadedmetadata = resolve;
	});

	await video.play();

	console.log('video:', video.videoWidth, video.videoHeight);
	console.log('readyState:', video.readyState);
	console.log('paused:', video.paused);

	const videoTexture = new THREE.VideoTexture(video);
	videoTexture.colorSpace = THREE.SRGBColorSpace;

	const geometry = new THREE.PlaneGeometry(1, 1 / (4/3));
	const material = new THREE.MeshBasicMaterial({
	map: videoTexture,
	side: THREE.DoubleSide
	});

	const quad = new THREE.Mesh(geometry, material);
	sceneController.scene.add(quad);
	quad.position.z += 1

	canvas = document.createElement('canvas');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	ctx = canvas.getContext('2d');
}

window.initPicStream = async function ( ) {
	if ( video === undefined ) {
		await initCamera( )
	}

	const imageModule = clientManager.addModule(
		"ImageModule",
		true, true, true,
	);

	function loop() {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageData = canvas.toDataURL("image/png", 0.5);
		imageModule.setImage( imageData, true );
		setTimeout( loop, 50 );
	}
	loop( );
}

window.initHands = async function ( ) {
	if ( video === undefined ) {
		await initCamera( )
	}
	
	const handPose = await ml5.handPose(
		{
			maxHands: 2,
			flipped: true,
		}
	);


	const handGroup = new THREE.Group();
	const handMaterial = new THREE.MeshBasicMaterial( );
	const handPointGeometry = new THREE.SphereGeometry( 0.01, 10, 10 );
	for ( let i = 0; i < 21; i++ ) {
		const handPoint = new THREE.Mesh( handPointGeometry, handMaterial );
		handGroup.add( handPoint );
	}
	sceneController.scene.add( handGroup );

	const leftHand = createHand( );
	const rightHand = createHand( );

	const hands = {
		Left: {
			...createHand( ),
			module: clientManager.addModule( "SkeletonModule", true, true, true ),
		},
		Right: {
			...createHand( ),
			module: clientManager.addModule( "SkeletonModule", true, true, true ),
		}
	};

	hands.Left.module.setBones( hands.Left.boneUUIDs, true );
	hands.Right.module.setBones( hands.Right.boneUUIDs, true );

	hands.Left.module.setTransforms( hands.Left.boneTransforms, true );
	hands.Right.module.setTransforms( hands.Right.boneTransforms, true );


	function loop() {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		handPose.detect(canvas, ( results ) => {
			results.forEach( handData => {
				const { handedness, keypoints3D, keypoints, wrist } = handData;
				const hand = hands[ handedness ];
				const points = handPositions( keypoints );
				// const points = handPositions( keypoints3D, { x: wrist.x / 640, y: wrist.y / 640 } );
				hand.boneTransforms.forEach( ( boneTransform, i ) => {
					boneTransform.transform.translation ??= [ 0, 0, 0 ];
					boneTransform.transform.translation[ 0 ] = points[ i ].x / 640 ;
					boneTransform.transform.translation[ 1 ] = points[ i ].y / 640 ;
					boneTransform.transform.translation[ 2 ] = points[ i ].z / 640 ;
				} );
				hand.module.setTransforms( hand.boneTransforms, true );
			} );
			setTimeout( loop, 50 );
		});
	}
	loop( );
}

window.initFace = async function ( ) {
	if ( video === undefined ) {
		await initCamera( )
	}
	

	const facePointsNb = 478;
	const facePositions = new Float32Array( facePointsNb * 3 );

	let faceMesh = await ml5.faceMesh( {
		maxFaces: 1,
		refineLandmarks: true,
		flipped: true,
	} );

	const pointsModule = clientManager.addModule( "PointsModule", 
		true,
		true,
		true
	);

	const pointsData = [ ];
	for ( let i = 0; i < facePointsNb; i++ ) {
		pointsData.push( {
			UUID: uuid( ),
			position: [ 0, 0, 0 ],
		} );
	}

	pointsModule.addPoints( pointsData, true );

	function loop() {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		faceMesh.detect( canvas, ( result ) => {
			// console.log( result[ 0 ] )
			if ( result.length ) {
				const points = result[ 0 ].keypoints;
				for ( let i = 0; i < facePointsNb; i++ ) {
					pointsData[ i ].position[ 0 ] = points[ i ].x / 640;
					pointsData[ i ].position[ 1 ] = points[ i ].y / 640;
					pointsData[ i ].position[ 2 ] = points[ i ].z / 640;
				}
				pointsModule.updatePoints( pointsData, true );
			}
			setTimeout( loop, 50 );
		});
	}
	loop( );
}



window.initBody = async function ( ) {	
	if ( video === undefined ) {
		await initCamera( )
	}
	
	const bodyPose = await ml5.bodyPose(
		{
			flipped: true,
		}
	);

	const bodyPointsNb = 17;

	const body = {
		...createBody( ),
		module: clientManager.addModule( "SkeletonModule", true, true, true ),
	};

	body.module.setBones( body.boneUUIDs, true );
	body.module.setTransforms( body.boneTransforms, true );

	function loop() {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		bodyPose.detect( canvas, ( result ) => {
			if ( result.length ) {
				const points = bodyPositions( result[ 0 ].keypoints );

				body.boneTransforms.forEach( ( boneTransform, i ) => {
					boneTransform.transform.translation ??= [ 0, 0, 0 ];
					boneTransform.transform.translation[ 0 ] = points[ i ].x / 640 ;
					boneTransform.transform.translation[ 1 ] = points[ i ].y / 640 ;
					boneTransform.transform.translation[ 2 ] = points[ i ].z / 640 ;
				} );
				body.module.setTransforms( body.boneTransforms, true );
			}
			setTimeout( loop, 50 );
		});
	}
	loop( );
}



window.track = async function( ) {
	await initCamera( );
	await initFace( );
	await initHands( );
	await initBody( );
}







const handParents = [ undefined, 0, 1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 0, 17, 18, 19 ];
function handPositions ( rawPositions, offset = { x: 0, y: 0, z: 0 } ) {
	const positions = new Array( 21 );
	
	for ( let i = 20; i >= 0; --i ) {
		positions[ i ] = { x: rawPositions[ i ].x, y: rawPositions[ i ].y, z: rawPositions[ i ].z ?? 0};

		const parentPos = rawPositions[ handParents[ i ] ];
		if ( parentPos === undefined ) {
			positions[ i ].x += offset.x;
			positions[ i ].y += offset.y;
			// positions[ i ].z += offset.z;
			continue;
		}

		positions[ i ].x -= parentPos.x;
		positions[ i ].y -= parentPos.y;
		positions[ i ].z -= parentPos.z ?? 0;
	}
	


	return positions;
}


function createHand ( ) {

	const boneUUIDs = new Array( 21 );
	const boneTransforms = new Array( 21 );

	for ( let i = 0; i < 21; ++i ) {
		boneUUIDs[ i ] =  {
			UUID: uuid( ),
			parent: undefined,
		};
		boneTransforms[ i ] =  {
			UUID: boneUUIDs[ i ].UUID,
			transform: { },
		};
	}

	for ( let i = 0; i < 21; ++i ) {
		boneUUIDs[ i ].parent = boneUUIDs[ handParents[ i ] ]?.UUID;
	}

	return { boneUUIDs, boneTransforms };
}

const bodyParents = [ undefined, 0, 1, 1, 2, 3, 0, 0, 6, 7, 8, 9, 0, 0, 12, 13, 14, 15 ];
function createBody ( ) {
	const boneUUIDs = new Array( 18 );
	const boneTransforms = new Array( 18 );

	for ( let i = 0; i < 18; ++i ) {
		boneUUIDs[ i ] =  {
			UUID: uuid( ),
			parent: undefined,
		};
		boneTransforms[ i ] =  {
			UUID: boneUUIDs[ i ].UUID,
			transform: { },
		};
	}

	for ( let i = 0; i < 18; ++i ) {
		boneUUIDs[ i ].parent = boneUUIDs[ bodyParents[ i ] ]?.UUID;
	}

	return { boneUUIDs, boneTransforms };
}

function bodyPositions ( rawPositions, offset = { x: 0, y: 0, z: 0 } ) {
	// rawPositions
	rawPositions.unshift( {
		x: ( rawPositions[ 5 ].x + rawPositions[ 6 ].x ) / 2, 
		y: ( rawPositions[ 5 ].y + rawPositions[ 6 ].y ) / 2,
		z: 0,
	} );
	const positions = new Array( 18 );

	for ( let i = 17; i >= 0; --i ) {
		positions[ i ] = { x: rawPositions[ i ].x, y: rawPositions[ i ].y, z: rawPositions[ i ].z ?? 0};

		const parentPos = rawPositions[ bodyParents[ i ] ];
		if ( parentPos === undefined ) {
			// positions[ i ].x += offset.x;
			// positions[ i ].y += offset.y;
			continue;
		}

		positions[ i ].x -= parentPos.x;
		positions[ i ].y -= parentPos.y;
		positions[ i ].z -= parentPos.z ?? 0;
	}
	


	return positions;
}
