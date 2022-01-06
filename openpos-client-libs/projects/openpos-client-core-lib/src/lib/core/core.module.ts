import { AndroidContentProviderPlugin } from './platform-plugins/cordova-plugins/android-content-provider-plugin';
import { PRINTERS } from './platform-plugins/printers/printer.service';
import { ConsoleScannerPlugin } from './platform-plugins/barcode-scanners/console-scanner/console-scanner.plugin';
import { SessionService } from './services/session.service';
import { ToastrModule } from 'ngx-toastr';
import { ErrorHandler, Injector, NgModule, Optional, SkipSelf } from '@angular/core';
import { DatePipe, Location, LocationStrategy, PathLocationStrategy, registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { SharedModule } from '../shared/shared.module';
import { AppInjector } from './app-injector';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { ConfigurationService } from './services/configuration.service';
import { ErrorHandlerService } from './services/errorhandler.service';
import { StompRService } from '@stomp/ng2-stompjs';
import { DialogContentComponent } from './components/dialog-content/dialog-content.component';
import { TrainingOverlayService } from './services/training-overlay.service';
import { KeyPressProvider } from '../shared/providers/keypress.provider';
import { fromEvent, Observable } from 'rxjs';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { PersonalizationComponent } from './personalization/personalization.component';
import { ToastService } from './services/toast.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ElectronService, NgxElectronModule } from 'ngx-electron';
import { CordovaPlatform } from './platforms/cordova.platform';
import { NCRPaymentPlugin } from './platform-plugins/cordova-plugins/ncr-payment-plugin';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { LockScreenComponent } from './lock-screen/lock-screen.component';
import locale_enCA from '@angular/common/locales/en-CA';
import locale_frCA from '@angular/common/locales/fr-CA';
import { LocationService, PROVIDERS } from './services/location.service';
import { LocationProviderDefault } from './location-providers/location-provider-default';
import { CLIENTCONTEXT } from './client-context/client-context-provider.interface';
import { TimeZoneContext } from './client-context/time-zone-context';
import { UIDataMessageService } from './ui-data-message/ui-data-message.service';
import { HelpTextService } from './help-text/help-text.service';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { TransactionService } from './services/transaction.service';
import { AudioService } from './audio/audio.service';
import { AudioRepositoryService } from './audio/audio-repository.service';
import { AudioInteractionService } from './audio/audio-interaction.service';
import { AudioConsolePlugin } from './audio/audio-console.plugin';
import { ScanditCapacitorImageScanner } from './platform-plugins/barcode-scanners/scandit-capacitor/scandit-capacitor.service';
import { IMAGE_SCANNERS, SCANNERS } from './platform-plugins/barcode-scanners/scanner';
import { BarcodeScanner } from './platform-plugins/barcode-scanners/barcode-scanner.service';
import { ClientExecutableService } from './services/client-executable.service';
import { CapacitorIosPlatform } from './platforms/capacitor-ios.platform';
import { CapacitorAndroidPlatform } from './platforms/capacitor-android.platform';
import { AilaScannerCordovaPlugin } from './platform-plugins/barcode-scanners/aila-scanner-cordova/aila-scanner-cordova.plugin';
import { InfineaScannerCordovaPlugin } from './platform-plugins/barcode-scanners/infinea-scanner-cordova/infinea-scanner-cordova.plugin';
import { WedgeScannerPlugin } from './platform-plugins/barcode-scanners/wedge-scanner/wedge-scanner.plugin';
import { ServerScannerPlugin } from './platform-plugins/barcode-scanners/server-scanner/server-scanner.service';
import { ScanditScannerCordovaPlugin } from './platform-plugins/barcode-scanners/scandit-scanner-cordova/scandit-scanner-cordova.plugin';
import { CapacitorStorageService } from './storage/capacitor/capacitor-storage.service';
import { CordovaStorageService } from './storage/cordova/cordova-storage.service';
import { Storage } from './storage/storage.service';
import { STORAGE_CONTAINERS } from './storage/storage-container';
import { ZebraBluetoothPrinterCordovaPlugin } from './platform-plugins/cordova-plugins/zebra-bluetooth-printer-cordova-plugin';
import { ExitAppPlugin } from './platform-plugins/cordova-plugins/auto-exit';
import { CapacitorPrinterPlugin } from './platform-plugins/printers/capacitor-printer.plugin';
import { ZEROCONF_TOKEN } from './zeroconf/zeroconf';
import { MDnsZeroconf } from './zeroconf/mdns-zeroconf';
import { CapacitorZeroconf } from './zeroconf/capacitor-zeroconf';
import { CapacitorService } from './services/capacitor.service';
import { LoyaltySignupService } from './services/loyalty-signup.service';
import { DebugImageScanner } from './platform-plugins/barcode-scanners/debug-image-scanner/debug-image-scanner.service';
import { CommerceServerSinkModule } from './logging/commerce-server/commerce-server-sink.module';
import { NewRelicSinkModule } from './logging/new-relic/new-relic-sink.module';
import { ConfigProvidersModule } from './platforms/config-provider/config-providers.module';
import { PowerModule } from './platform-plugins/power/power.module';
import { CordovaService } from './services/cordova.service';
import { OpenposAppComponent } from './components/openpos-app/openpos-app.component';
import { PLATFORMS } from './platforms/platform.interface';
import { PLUGINS } from './platform-plugins/platform-plugin.interface';

registerLocaleData(locale_enCA, 'en-CA');
registerLocaleData(locale_frCA, 'fr-CA');

@NgModule({
    entryComponents: [
        ConfirmationDialogComponent,
        PersonalizationComponent,
        DialogContentComponent,
        SplashScreenComponent,
        LockScreenComponent,
    ],
    declarations: [
        OpenposAppComponent,
        DialogContentComponent,
        ConfirmationDialogComponent,
        PersonalizationComponent,
        SplashScreenComponent,
        LockScreenComponent
    ],
    imports: [
        SharedModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgxElectronModule,
        ToastrModule.forRoot(),
        CommerceServerSinkModule,
        NewRelicSinkModule,
        ConfigProvidersModule,
        PowerModule
    ],
    exports: [
        BrowserModule,
        BrowserAnimationsModule,
        ToastrModule
    ],
    providers: [
        HttpClient,
        Location,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: ErrorHandler, useClass: ErrorHandlerService },
        DatePipe,
        BreakpointObserver,
        MediaMatcher,
        StompRService,
        BarcodeScanner,
        { provide: ZEROCONF_TOKEN, useClass: MDnsZeroconf, multi: true, deps: [ElectronService] },
        { provide: ZEROCONF_TOKEN, useClass: CapacitorZeroconf, multi: true, deps: [CapacitorService] },
        AilaScannerCordovaPlugin,
        ScanditScannerCordovaPlugin,
        { provide: SCANNERS, useExisting: ConsoleScannerPlugin, multi: true },
        { provide: SCANNERS, useExisting: AilaScannerCordovaPlugin, multi: true },
        { provide: SCANNERS, useExisting: WedgeScannerPlugin, multi: true },
        { provide: SCANNERS, useExisting: InfineaScannerCordovaPlugin, multi: true },
        { provide: SCANNERS, useExisting: ServerScannerPlugin, multi: true, deps: [SessionService] },
        { provide: IMAGE_SCANNERS, useExisting: ScanditScannerCordovaPlugin, multi: true },
        { provide: IMAGE_SCANNERS, useExisting: ScanditCapacitorImageScanner, multi: true },

        // NOTE:    The following image scanner is just a placeholder making it easier to debug the feature
        //          without having to load the app up on device with the supporting feature. To enable it
        //          you must change your client configuration for a image scanner type to 'Debug'.
        { provide: IMAGE_SCANNERS, useClass: DebugImageScanner, multi: true },
        { provide: PLUGINS, useExisting: AilaScannerCordovaPlugin, multi: true },
        { provide: PLUGINS, useExisting: InfineaScannerCordovaPlugin, multi: true },
        { provide: PLUGINS, useExisting: NCRPaymentPlugin, multi: true, deps: [SessionService] },
        { provide: PLUGINS, useExisting: AndroidContentProviderPlugin, multi: true },
        { provide: PLUGINS, useExisting: ScanditScannerCordovaPlugin, multi: true },
        { provide: PLUGINS, useExisting: ScanditCapacitorImageScanner, multi: true },
        { provide: PLUGINS, useExisting: ZebraBluetoothPrinterCordovaPlugin, multi: true, deps: [CordovaService, SessionService]},
        { provide: PLUGINS, useExisting: ExitAppPlugin, multi: true, deps: [CordovaService, SessionService] },
        { provide: PLATFORMS, useExisting: CordovaPlatform, multi: true },
        { provide: PLATFORMS, useExisting: CapacitorIosPlatform, multi: true },
        { provide: PLATFORMS, useExisting: CapacitorAndroidPlatform, multi: true },
        { provide: STORAGE_CONTAINERS, useClass: CapacitorStorageService, multi: true },
        { provide: STORAGE_CONTAINERS, useClass: CordovaStorageService, multi: true },
        CapacitorPrinterPlugin,
        { provide: PRINTERS, useExisting: CapacitorPrinterPlugin, multi: true },
        { provide: PRINTERS, useExisting: ZebraBluetoothPrinterCordovaPlugin, multi: true, deps: [CordovaService, SessionService] },
        LocationService,
        { provide: PROVIDERS, useExisting: LocationProviderDefault, multi: true },
        TrainingOverlayService,
        ConfigurationService,
        KeyPressProvider,
        HelpTextService,
        { provide: CLIENTCONTEXT, useClass: TimeZoneContext, multi: true },
        { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
        TransactionService,
        AudioService,
        AudioInteractionService,
        AudioRepositoryService,
        { provide: PLUGINS, useExisting: AudioConsolePlugin, multi: true, deps: [AudioService] },
        Storage,
        LoyaltySignupService
    ]
})
export class CoreModule {

    constructor(
        @Optional() @SkipSelf() parentModule: CoreModule,
        private injector: Injector,
        toastService: ToastService,
        uiDataService: UIDataMessageService,
        clientExecutableService: ClientExecutableService,
        keyProvider: KeyPressProvider) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
        AppInjector.instance = this.injector;
        keyProvider.registerKeyPressSource(fromEvent(document, 'keydown') as Observable<KeyboardEvent>);
        keyProvider.registerKeyPressSource(fromEvent(document, 'keyup') as Observable<KeyboardEvent>);
    }
}
