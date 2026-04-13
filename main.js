import ClientManager from "./ClientManager.js";
import ClientNetwork from "./ClientNetwork.js";
import GUIController from "./GUIController.js";
import ViewsRegistry from "./SyncModulesViews/ViewsRegistry.js";
import SceneController from "./SceneController.js";
import CameraController from "./SyncModulesViews/Controllers/CameraController.js";

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


let fileModule = null;
window.testFileModule = ( filename = "./Files/test.txt" ) => {
	const fileModule = clientManager.addModule(
		"FileModule",
		true,
		true,
		true
	);
	
	window.fileModule = fileModule;

	// const response = await fetch( filename );
	// const fileBuffer = await response.arrayBuffer( );
	// // const text = await response.text()

	// console.log(response, fileBuffer)
	// const decoder = new TextDecoder("utf-8");
	// const text = decoder.decode(fileBuffer)
	// console.log(text)

	const input = document.createElement("input");
	input.type = "file";

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
			fileModule.updateFile({
				name: file.name,
				type: file.type,
				data: reader.result
			}, true )

		};
		reader.readAsDataURL( file ); 
	}
	input.click();


}

