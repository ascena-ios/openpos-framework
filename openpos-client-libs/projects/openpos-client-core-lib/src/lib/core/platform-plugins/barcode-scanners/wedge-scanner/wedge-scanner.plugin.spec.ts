import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WedgeScannerPlugin } from './wedge-scanner.plugin';
import { SessionService } from '../../../services/session.service';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { ScanData } from '../scanner';
import { DomEventManager } from '../../../services/dom-event-manager.service';
import { Subscription, of, Subject } from 'rxjs';
import { WedgeScannerConfigMessage } from '../../../messages/wedge-scanner-config-message';
import { MessageTypes } from '../../../messages/message-types';
import { ConfigurationService } from '../../../services/configuration.service';

describe('WedgeScanner', () => {

    const config: WedgeScannerConfigMessage = {
        startSequence: '*',
        endSequence: 'Enter',
        codeTypeLength: 1,
        timeout: null,
        enabled: true,
        acceptKeys: null,
        type: MessageTypes.CONFIG_CHANGED,
        configType: 'WedgeScanner'
    };

    let scanResults: ScanData[];
    let keyDownEvents: KeyboardEvent[];
    let subscription: Subscription;
    let configService: jasmine.SpyObj<ConfigurationService>;
    let domEventManager: jasmine.SpyObj<DomEventManager>;
    let wedgeScannerPlugin: WedgeScannerPlugin;
    let domEventManagerSpy;

    function queueEvent( key: string, ctrlKey: boolean, altKey: boolean ) {
        const event = new KeyboardEvent('keydown', {
            key,
            ctrlKey,
            altKey,
        });

        keyDownEvents.push(event);
    }

    function queueTime( time: string ) {
        keyDownEvents.push( new KeyboardEvent(time));
    }

    function makeEventCold() {
        let marbles = '-';
        const values = {};

        keyDownEvents.forEach( ( e, index ) => {
            if ( e.type === 'keydown') {
                marbles = marbles.concat(String.fromCharCode(index + 97) + '-');
                values[String.fromCharCode(index + 97)] = e;
            } else {
                marbles = marbles.concat(e.type);
            }
        });
        return cold(marbles, values);
    }

    function getConfig() {
        return cold('-x', {x: config});
    }

    function setup() {
        const configSpy = jasmine.createSpyObj('ConfigurationService', ['getConfiguration']);
        domEventManagerSpy = jasmine.createSpyObj('DomEventManager', ['createEventObserver']);

        TestBed.configureTestingModule({
            providers: [
                WedgeScannerPlugin,
                { provide: ConfigurationService, useValue: configSpy },
                { provide: DomEventManager, useValue: domEventManagerSpy}
            ]
        });

        domEventManager = TestBed.inject(DomEventManager) as jasmine.SpyObj<DomEventManager>;
        configService = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>;

        configService.getConfiguration.and.callFake(getConfig);

        wedgeScannerPlugin = TestBed.inject(WedgeScannerPlugin);
    }

    function setupSync() {
        setup();
        domEventManager.createEventObserver.and.callFake(makeEventCold);

        subscription = wedgeScannerPlugin.beginScanning().subscribe( s => scanResults.push(s));
    }

    const fakeEventSubject = new Subject<Event>();

    function dispatchEvent( key: string, ctrlKey: boolean, altKey: boolean ) {
        const event = new KeyboardEvent('keydown', {
            key,
            ctrlKey,
            altKey,
        });

        fakeEventSubject.next(event);
    }

    function setupAsync() {
        setup();
        domEventManager.createEventObserver.and.callFake(() => fakeEventSubject.asObservable());

        subscription = wedgeScannerPlugin.beginScanning().subscribe( s => scanResults.push(s));
    }

    beforeEach( () => {
        scanResults = [];
        keyDownEvents = [];
        TestBed.resetTestingModule();
        if (subscription) {
            subscription.unsubscribe();
        }
    });

    it('should replace special character codes with the correct special character', () => {

        config.startSequence = '*';
        config.endSequence = 'Enter';

        queueEvent( '*', false, false );
        queueEvent( 'X', false, false );
        queueEvent( '1', false, false );
        queueEvent( '2', false, false );
        queueEvent( '3', false, false );
        queueEvent( '4', false, false );
        queueEvent( 'A', false, false );
        queueEvent( 'B', false, false );
        queueEvent('ALT', false, true);
        queueEvent( '0', false, true);
        queueEvent( '0', false, true);
        queueEvent( '1', false, true);
        queueEvent( '0', false, true);
        queueEvent('ALT', false, true);
        queueEvent( '0', false, true);
        queueEvent( '0', false, true);
        queueEvent( '3', false, true);
        queueEvent( '0', false, true);
        queueEvent( 'Enter', false, false );

        setupSync();

        getTestScheduler().flush();

        expect(scanResults[0].rawType).toEqual('X');
        expect(scanResults[0].data).toEqual('1234AB' + String.fromCharCode(10) + String.fromCharCode(30));
    });

    it('should buffer barcode between * and Enter', () => {

        config.startSequence = '*';
        config.endSequence = 'Enter';

        queueEvent( '*', false, false );
        queueEvent( 'X', false, false );
        queueEvent( '1', false, false );
        queueEvent( '2', false, false );
        queueEvent( '3', false, false );
        queueEvent( '4', false, false );
        queueEvent( 'A', false, false );
        queueEvent( 'B', false, false );
        queueEvent( 'Enter', false, false );

        setupSync();

        getTestScheduler().flush();

        expect(scanResults[0].rawType).toEqual('X');
        expect(scanResults[0].data).toEqual('1234AB');
    });

    it('should buffer barcode between ctrl+b and ctrl+j', () => {

        config.startSequence = 'ctrl+b';
        config.endSequence = 'ctrl+j';

        queueEvent( 'b', true, false );
        queueEvent( 'X', false, false );
        queueEvent( '1', false, false );
        queueEvent( '2', false, false );
        queueEvent( '3', false, false );
        queueEvent( '4', false, false );
        queueEvent( 'Z', false, false );
        queueEvent( 'B', false, false );
        queueEvent( 'j', true, false );

        setupSync();

        getTestScheduler().flush();

        expect(scanResults[0].rawType).toEqual('X');
        expect(scanResults[0].data).toEqual('1234ZB');
    });

    it('should timeout and only send second scan', fakeAsync(() => {
        config.startSequence = 'ctrl+b';
        config.endSequence = 'ctrl+j';

        setupAsync();

        getTestScheduler().flush();

        dispatchEvent( 'b', true, false );
        dispatchEvent( 'T', false, false );
        dispatchEvent( 'K', false, false );
        dispatchEvent( 'L', false, false );
        dispatchEvent( 'B', false, false );
        dispatchEvent( 'R', false, false );

        tick(500);

        expect(scanResults.length).toBe(0);

        dispatchEvent( 'b', true, false );
        dispatchEvent( 'X', false, false );
        dispatchEvent( '1', false, false );
        dispatchEvent( '2', false, false );
        dispatchEvent( '3', false, false );
        dispatchEvent( '4', false, false );
        dispatchEvent( 'Z', false, false );
        dispatchEvent( 'B', false, false );
        dispatchEvent( 'j', true, false );

        expect(scanResults[0].rawType).toEqual('X');
        expect(scanResults[0].data).toEqual('1234ZB');
    }));

    it('should only create one event observer. subsequent calls to start should return the same observable', () => {
        setupSync();
        const observ1 = wedgeScannerPlugin.beginScanning();
        const observ2 = wedgeScannerPlugin.beginScanning();

        expect(observ1).toBe(observ2);
    });

});
