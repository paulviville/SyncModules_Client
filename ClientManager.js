import ClientNetwork from "./ClientNetwork.js";
import ModulesRegistry from "./SyncModules/Core/ModulesRegistry.js";
import ViewsRegistry from "./SyncModulesViews/ViewsRegistry.js";
import SceneController from "./SceneController.js";

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
	OWNERSHIP: "OWNERSHIP", /// declare the ownership of a module
}

export default class ClientManager {
	#UUID = crypto.randomUUID( );
	#clientNetwork = new ClientNetwork( this.#UUID );
	#modulesRegistry;
	#viewsRegistry;
	#sceneController = new SceneController( );
	#modulesOwned = new Set( ); /// UUIDs

	#sendFn;

	constructor ( ) {
		
		this.#sendFn = this.#clientNetwork.send;

		this.#modulesRegistry = new ModulesRegistry ( 
			( payload ) => {
				const message = this.#createMessage( SCOPES.MODULE, payload );
				this.#sendFn( message );
		} );
		this.#viewsRegistry = new ViewsRegistry( this.#modulesRegistry );
		this.#sceneController.scene.add( this.#viewsRegistry );
		this.#sceneController.startRender( );

		this.#clientNetwork.setCallbacks( {
			onOpen: ( ) => {
				this.#sendFn( JSON.stringify( { UUID: this.#UUID } ) );

				/// debug
				const registryState = this.#modulesRegistry.outputState( );
				console.log(registryState)

				const message = this.#createMessage(SCOPES.SYSTEM, {
					command: INSTANCE_COMMANDS.INSTANCE_JOIN,
					data: {
						instanceUUID: "00000000-0000-0000-0000-000000000000",
						userUUID: this.#UUID,
					},
				});
				this.#sendFn( message );
				///

				const cameraModule = this.addModule("CameraModule", true, true, false);
				this.#sceneController.controls.setModule( cameraModule );
			},

			onMessage: ( message ) => {
				const messageData = JSON.parse( message );
				// console.log(messageData)
				const { scope, senderUUID, payload } = messageData;
				/// REPLACE WITH ROUTING FUNCTIONS
				switch ( scope ) {
					case SCOPES.SYSTEM:
						console.log( payload );
						break;
					case SCOPES.MODULE:
						// const module = this.#moduleRegistry.getModule( moduleUUID );

						// this.#modulesRegistry.input( payload );
						this.#onModuleMessage( payload );
						break;
				}
			},
		} );
	}

	connect ( url = "ws://localhost", port = "3000" ) {
		this.#clientNetwork.connect( url, port );
	}

	/// Debug
	get clientNetwork ( ) {
		return this.#clientNetwork;
	}

	get modulesRegistry ( ) {
		return this.#modulesRegistry;
	}

	get viewsRegistry ( ) {
		return this.#viewsRegistry;
	}


	get UUID ( ) {
		return this.#UUID;
	}

	#createMessage ( scope, payload ) {
		const messageData = {
			scope,
			senderUUID: this.#UUID,
			payload,
		};

		return JSON.stringify( messageData );
	}

	#onModuleMessage ( payload ) {
		const { moduleUUID } = payload;
		const module = this.#modulesRegistry.getModule( moduleUUID );
		module.input( payload );
	}

	addModule ( type, sync = false, own = false, view = true ) {
		const UUID = crypto.randomUUID();
		const module = this.#modulesRegistry.addModule( type, UUID, sync );
		
		if ( !view ) {
			const moduleView = this.#viewsRegistry.getView( UUID );
			moduleView.visible = false;
		}

		if ( own ) {
			this.#modulesOwned.add( UUID );
		}

		return module;
	}

	removeModule ( moduleUUID, sync = false ) {
		this.#modulesRegistry.removeModule( moduleUUID, sync );

		if ( this.#modulesOwned.has( moduleUUID ) ) {
			this.#modulesOwned.delete( moduleUUID );
		}
	}

	beforeUnload ( event ) {
		this.#modulesOwned.forEach( moduleUUID => this.removeModule( moduleUUID, true ) );
		// console.log("before unload")
	}
}