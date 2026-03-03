const SCOPES = {
	SYSTEM: "SYSTEM",
	INSTANCE: "INSTANCE",
	MODULE: "MODULE",
};

export default class ClientNetwork { 
	#socket;
	#UUID = crypto.randomUUID( );
	#onMessageCallbacks = new Map( ); /// Scope -> fn

	constructor ( ) {
		console.log(`ClientNetwork - constructor`);
		
	}

	connect ( url = "ws://localhost", port = "3000" ) {
		console.log( `ClientNetwork - connect ( ${url}:${port} )` );

		this.#socket = new WebSocket( `${ url }:${ port }` );
		
		this.#socket.onopen = ( ) => { this.#handleOnOpen(); };
        this.#socket.onmessage = ( event ) => { this.#handleOnMessage( event.data ); };
        this.#socket.onerror = ( error ) => { this.#handleOnError( error ); };
        this.#socket.onclose = ( event ) => { this.#handleOnClose( event ); };
	}

	#handleOnOpen ( ) {
		console.log( `ClientNetwork - #handleOnOpen` );

		/// authentication message
		/// placeholder before buffers
		this.#socket.send(
			JSON.stringify( { UUID: this.#UUID } )
		);
    }

    #handleOnError ( error ) {
		console.log( `ClientNetwork - #handleOnError` );

        console.error( 'WebSocket error:', error );
    }

    #handleOnClose ( event ) {
		console.log(`ClientNetwork - #handleOnClose` );

        if ( event.wasClean ) {
            console.log( `WebSocket closed cleanly, code=${ event.code }, reason=${ event.reason }` );
        } else {
            console.warn( 'WebSocket connection closed unexpectedly.' );
        }
    }

    #handleOnMessage ( message ) {
		console.log( `ClientNetwork - #handleOnMessage` );

		const messageData = JSON.parse( message );
		console.log( messageData );
		this.#onMessageCallbacks.get( messageData.scope )?.( messageData );
    }

	setOnMessageCallback ( scope, callback ) {
		this.#onMessageCallbacks.set( scope, callback );
	}

	get UUID ( ) {
		return this.#UUID;
	}

	send ( message ) {
		this.#socket.send( message );
	}
}