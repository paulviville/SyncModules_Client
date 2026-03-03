import ClientNetwork from "./ClientNetwork.js";

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

const clientNetwork = new ClientNetwork( );

clientNetwork.setOnMessageCallback(  SCOPES.SYSTEM, ( messageData ) => {
	// const messageData = JSON.parse( message );
	console.log(SCOPES.SYSTEM, messageData);
});

clientNetwork.setOnMessageCallback(  SCOPES.MODULE, ( messageData ) => {
	// const messageData = JSON.parse( message );
	console.log(SCOPES.MODULE, messageData);
});




clientNetwork.connect( );

window.addInstance = ( ) => {
	const instanceUUID = crypto.randomUUID( );
	instanceList.add( instanceUUID );

	const messageData = {
		senderUUID: clientNetwork.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_ADD,
			data: {
				instanceUUID: instanceUUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientNetwork.send( message );
}

window.removeInstance = ( instanceUUID ) => {
	instanceList.delete( instanceUUID );

	const messageData = {
		senderUUID: clientNetwork.UUID,
		scope: SCOPES.SYSTEM,
		payload: {
			command: INSTANCE_COMMANDS.INSTANCE_REMOVE,
			data: {
				instanceUUID: instanceUUID,
			},
		}
	}
	const message = JSON.stringify( messageData );

	clientNetwork.send( message );
}

window.joinInstance = ( instanceUUID ) => {

	const messageData = {
		senderUUID: clientNetwork.UUID,
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

	clientNetwork.send( message );
}

window.leaveInstance = ( instanceUUID ) => {

	const messageData = {
		senderUUID: clientNetwork.UUID,
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

	clientNetwork.send( message );
}


