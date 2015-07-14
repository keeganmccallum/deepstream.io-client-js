var WebRtcHandler = require( '../../../src/webrtc/webrtc-handler.js' ),
	MockConnection = require( '../../mocks/message/connection-mock' ),
	ClientMock = require( '../../mocks/client-mock' ),
	msg = require( '../../test-helper/test-helper' ).msg,
	options = { calleeAckTimeout: 5 };


describe( 'webrtc listen for callees', function(){
	var webrtcHandler,
		calleeListener = jasmine.createSpy( 'callee listener' ),
		mockConnection = new MockConnection(),
		mockClient = new ClientMock();

	it( 'initialises the handler', function(){
		webrtcHandler = new WebRtcHandler( {}, mockConnection, mockClient );
		expect( typeof webrtcHandler.registerCallee ).toBe( 'function' );
	});

	it( 'registers a listener', function(){
		webrtcHandler.listenForCallees( calleeListener );

		expect(function(){
			webrtcHandler.listenForCallees( calleeListener );
		}).toThrow();
	});

	it( 'receives the initial callee update message', function(){
		expect( calleeListener ).not.toHaveBeenCalled();

		webrtcHandler._$handle({
			'raw': msg( 'W|WAC|calleeA|calleeB|calleeC+' ),
			'topic': 'W',
			'action': 'WAC',
			'data': [ 'calleeA', 'calleeB', 'calleeC' ]
		});
		
		expect( calleeListener ).toHaveBeenCalledWith([
			'calleeA',
			'calleeB',
			'calleeC'
		]);
	});

	it( 'receives an add callee message', function(){
		webrtcHandler._$handle({
			'raw': msg( 'W|WCA|calleeD+' ),
			'topic': 'W',
			'action': 'WCA',
			'data': [ 'calleeD' ]
		});
		
		expect( calleeListener ).toHaveBeenCalledWith([
			'calleeA',
			'calleeB',
			'calleeC',
			'calleeD'
		]);
	});

	it( 'receives a remove callee message', function(){
		webrtcHandler._$handle({
			'raw': msg( 'W|WCR|calleeB+' ),
			'topic': 'W',
			'action': 'WCR',
			'data': [ 'calleeB' ]
		});
		
		expect( calleeListener ).toHaveBeenCalledWith([
			'calleeA',
			'calleeC',
			'calleeD'
		]);
	});

	it( 'receives another add callee message', function(){
		webrtcHandler._$handle({
			'raw': msg( 'W|WCA|calleeE+' ),
			'topic': 'W',
			'action': 'WCA',
			'data': [ 'calleeE' ]
		});
		
		expect( calleeListener ).toHaveBeenCalledWith([
			'calleeA',
			'calleeC',
			'calleeD',
			'calleeE'
		]);
	});

	it( 'removes the callee listener', function(){
		webrtcHandler.unlistenForCallees();
		expect( calleeListener.calls.length ).toBe( 4 );
		expect( mockClient.lastError ).toBe( null );
		webrtcHandler._$handle({
			'raw': msg( 'W|WCA|calleeE+' ),
			'topic': 'W',
			'action': 'WCA',
			'data': [ 'calleeF' ]
		});

		expect( calleeListener.calls.length ).toBe( 4 );
		expect( mockClient.lastError ).toEqual([ 'W', 'UNSOLICITED_MESSAGE', msg('W|WCA|calleeE+') ]);

		expect(function(){
			webrtcHandler.unlistenForCallees();
		}).toThrow();
	});
});