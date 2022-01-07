import { Logger } from './logger.service';

import { Injectable, Type, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import { SessionService } from './session.service';
import { IScreen } from '../../shared/components/dynamic-screen/screen.interface';
import { DialogContentComponent } from '../components/dialog-content/dialog-content.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { OpenPOSDialogConfig } from '../interfaces/open-pos-dialog-config.interface';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { LifeCycleMessage } from '../messages/life-cycle-message';
import { LifeCycleEvents } from '../messages/life-cycle-events.enum';
import { MessageProvider } from '../../shared/providers/message.provider';
import { MessageTypes } from '../messages/message-types';

@Injectable({
    providedIn: 'root',
})
export class DialogService {

    static dialogs = new Map<string, Type<IScreen>>();

    public dialogRef: MatDialogRef<DialogContentComponent>;
	public beforeOpened$ = new Subject<OpenPOSDialogConfig>();
    public afterOpened$ = new Subject<MatDialogRef<DialogContentComponent>>();
    public beforeClosed$ = new Subject<MatDialogRef<DialogContentComponent>>();
    public afterClosed$ = new Subject<MatDialogRef<DialogContentComponent>>();

    private closingDialogRef: MatDialogRef<DialogContentComponent>;

    private dialogOpening: boolean;

    private lastDialogType: string;

    private lastDialogId: string;
 
    private lastScreenSeq: number;

    public $dialogMessages = new BehaviorSubject<any>(null);

    constructor(
        private log: Logger,
        private messageProvider: MessageProvider,
        private componentFactoryResolver: ComponentFactoryResolver,
        private session: SessionService,
        private dialog: MatDialog) {

        // Use BehaviorSubject to hang on to most recent dialog so it can be displayed
        // once dialog service has started. Handles case where server is 'showing' a dialog
        // but client is starting up. If we wait to subscribe until start() method, we can
        // miss the dialog.
        // this.session.getMessages('Dialog').subscribe(s => { if (s) { this.$dialogMessages.next(s); } });
    }

    public start() {
        this.log.info('[DialogService] starting DialogService');
        // Defer set up of dialog subscriptions for updating dialogs until service has been started.
        // Addresses problem of dialogs from server side being shown before app startup has finished.
        // We use a Startup Task to invoke this start method at nearly the end of startup.

        // Pipe all the messages for dialog updates
//        this.$dialogMessages.subscribe(m => this.updateDialog(m));
        this.messageProvider.setMessageType(MessageTypes.DIALOG);
        this.session.getMessages(MessageTypes.DIALOG).subscribe(m => this.updateDialog(m));

    }

    public addDialog(name: string, type: Type<IScreen>): void {
        if (type === null) {
            throw new Error(`Cannot add null component for dialog with name '${name}'`);
        }

        if (DialogService.dialogs.get(name)) {
            // tslint:disable-next-line:max-line-length
            this.log.info(`replacing registration of dialog for the key of ${name} in the dialog service`);
            DialogService.dialogs.delete(name);
        }
        DialogService.dialogs.set(name, type);
    }

    

    public isDialogOpenOrOpening(): boolean {
        if (!this.dialogOpening) {
            return this.isDialogOpen();
        } else {
            return this.dialogOpening;
        }
    }

    public hasDialog(name: string): boolean {
        return DialogService.dialogs.has(name);
    }

    private resolveDialog(type: string): ComponentFactory<IScreen> {
        const dialogType: Type<IScreen> = DialogService.dialogs.get(type);
        if (dialogType) {
            return this.componentFactoryResolver.resolveComponentFactory(dialogType);
        } else {
            console.error(`Could not find a dialog type of: ${type}.  Please register it with the dialog service`);
            return this.componentFactoryResolver.resolveComponentFactory(DialogService.dialogs.get('Blank'));
        }
    }

    // Make this async so we can await it
    public async closeDialog() {
        if (this.dialogRef) {
            this.log.info('[DialogService] closing dialog ref');
            this.closingDialogRef = this.dialogRef;
            this.closingDialogRef.close();

            this.session.sendMessage( new LifeCycleMessage(LifeCycleEvents.DialogClosing, null));

            // Wait for the dialog to fully close before moving on
            await this.closingDialogRef.afterClosed().toPromise();

            this.closingDialogRef = null;
            this.dialogRef = null;
            this.dialogOpening = false;
        } else if (this.closingDialogRef != null) {
            await this.closingDialogRef.afterClosed().toPromise();
        } else if (this.dialogOpening) {
            this.dialogOpening = false;
        }
    }

    /** screenType - If given, behavior will only report true if there is a dialog open AND it's of the given type */
    public isDialogOpen(screenType?: string): boolean {
        if (screenType) {
            return screenType === this.lastDialogType && this.dialogRef !== null;
        }

        return this.dialogRef && this.dialogRef !== null;
    }

    private updateDialog(dialog?: any): void {
        if (dialog) {
            const dialogType = this.hasDialog(dialog.subType) ? dialog.subType : 'Dialog';
            if (!this.dialogOpening) {
                this.log.info('[DialogService] opening dialog \'' + dialogType + '\'');
                this.dialogOpening = true;
                setTimeout(() => this.openDialog(dialog), 0);
            } else {
                this.log.info(`[DialogService] putting off the opening of the dialog to the future because another dialog is currently opening`);
                setTimeout(() => this.updateDialog(dialog), 100);
            }
        }
    }

    private async openDialog(dialog: any) {
        // Must check dialogOpening here because updateDialog leaves the possibility that a closeDialog
        // could be invoked from elsewhere (OpenposScreenOutletDirective) before open actually runs.
	this.log.info(`openDialog: ${JSON.stringify(dialog)}`);
        if (!dialog || dialog.sequenceNumber < this.lastScreenSeq) {
            this.log.info(`[DialogService] Not opening dialog because the sequence is older than the last screen.`);
            return;
        }

        try {
            const dialogComponentFactory: ComponentFactory<IScreen> = this.resolveDialog(dialog.screenType);
            this.log.info(`[DialogService] Opening a dialog with a ` +
                `${dialogComponentFactory && dialogComponentFactory.componentType ? dialogComponentFactory.componentType.name : '?'} ` +
                `component as its content`
            );
            let closeable = false;
            let forceReopen = false;
            if (dialog.dialogProperties) {
                closeable = dialog.dialogProperties.closeable;
                forceReopen = dialog.dialogProperties.forceReopen;
            }
            // By default we want to not allow the user to close by clicking off
            // By default we need the dialog to grab focus so you cannont execute actions on the screen
            // behind by hitting enter
            const dialogProperties: OpenPOSDialogConfig = { disableClose: !closeable, autoFocus: true };
            // const dialogComponent = dialogComponentFactory.componentType;
            if (dialog.dialogProperties) {
                // Merge in any dialog properties provided on the screen
                for (const key in dialog.dialogProperties) {
                    if (dialog.dialogProperties.hasOwnProperty(key)) {
                        dialogProperties[key] = dialog.dialogProperties[key];
                    }
                }
                this.log.info(`Dialog options: ${JSON.stringify(dialogProperties)}`);
            }

            if (!this.dialogRef || !this.dialogRef.componentInstance
                || dialog.screenType !== this.lastDialogType || dialog.screenType === 'Dialog'
                || dialog.refreshAlways || dialog.id !== this.lastDialogId) {

                // We need to make sure to block here before creating the new dialog to make sure the old one
                // is fully closed.
                await this.closeDialog();

                if (!this.dialogRef || !this.dialogRef.componentInstance) {
                    this.log.info('[DialogService] Dialog \'' + dialog.screenType + '\' opening...');
                    this.session.sendMessage( new LifeCycleMessage(LifeCycleEvents.DialogOpening, dialog));
                    this.beforeOpened$.next(dialogProperties);
                    this.dialogRef = this.dialog.open(DialogContentComponent, dialogProperties);
                    const dialogRef = this.dialogRef;
                    this.dialogRef.beforeClosed().subscribe(() => this.beforeClosed$.next(dialogRef));
                    this.dialogRef.afterClosed().subscribe(() => this.afterClosed$.next(dialogRef));
                    this.dialogRef.afterOpened().subscribe(() => this.afterOpened$.next(dialogRef));
                } else {
                    // I don't think this code will ever run
                    this.log.info('[DialogService] Dialog \'' + dialog.screenType + '\' refreshing content...');
                    this.dialogRef.updateSize('' + dialogProperties.minWidth, '' + dialogProperties.minHeight);
                    this.dialogRef.disableClose = dialogProperties.disableClose;
                }
                this.dialogRef.componentInstance.installScreen(dialogComponentFactory);
                this.session.cancelLoading();
            } else {
                this.log.info(`Using previously created dialogRef. current dialog type: ${dialog.screenType},
            last dialog type: ${this.lastDialogType}`);
                this.session.cancelLoading();
            }

            this.log.info('[DialogService] Dialog \'' + dialog.screenType + '\' showing...');
            this.dialogRef.componentInstance.show(dialog);
            this.log.info('[DialogService] Dialog \'' + dialog.screenType + '\' opened/shown');

            this.lastDialogType = dialog.screenType;
            this.lastDialogId = dialog.id;
            this.lastScreenSeq = dialog.sequenceNumber;
        } finally {
            this.dialogOpening = false;
        }
        console.log('[DialogService] screen updated');
        this.session.sendMessage( new LifeCycleMessage(LifeCycleEvents.ScreenUpdated, dialog));
    }

}
