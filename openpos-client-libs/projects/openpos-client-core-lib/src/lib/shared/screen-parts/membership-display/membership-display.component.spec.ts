import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActionService } from '../../../core/actions/action.service';
import { MembershipDisplayComponent } from './membership-display.component';
import { validateDoesNotExist, validateIcon, validateText } from '../../../utilites/test-utils';
import { By } from '@angular/platform-browser';
import { Membership } from './memebership-display.interface';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TimeZoneContext } from '../../../core/client-context/time-zone-context';
import { CLIENTCONTEXT } from '../../../core/client-context/client-context-provider.interface';
import { KeyPressProvider } from '../../providers/keypress.provider';
import { Subscription } from 'rxjs';

class MockActionService { }
class MockMatDialog { }
class MockElectronService { }
class ClientContext { }
class MockKeyPressProvider {
    subscribe(): Subscription {
        return new Subscription();
    }
}

describe('MembershipDisplayComponent', () => {
    let component: MembershipDisplayComponent;
    let fixture: ComponentFixture<MembershipDisplayComponent>;
    let membership: Membership;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                MembershipDisplayComponent
            ],
            providers: [
                { provide: MatDialog, useClass: MockMatDialog },
                { provide: ActionService, useClass: MockActionService },
                { provide: KeyPressProvider, useClass: MockKeyPressProvider },
                { provide: ClientContext, useValue: {} },
                { provide: CLIENTCONTEXT, useClass: TimeZoneContext }
            ],
            schemas: [
                NO_ERRORS_SCHEMA,
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(MembershipDisplayComponent);
        component = fixture.componentInstance;
        component.screenData = {
            checkMarkIcon: 'check',
            uncheckMarkIcon: 'uncheck'
        };
        membership = {
            id: '1',
            name: 'My Membership',
            member: true
        };
        component.membership = membership;
        fixture.detectChanges();
    });

    it('renders', () => {
        expect(component).toBeDefined();
    });

    describe('component', () => {
    });

    describe('template', () => {
        it('shows the name of the membership', () => {
            validateText(fixture, 'mat-chip', component.membership.name);
        });

        it('calls clickEvent.emit when the chip is clicked', () => {
            spyOn(component.clickEvent, 'emit');

            const chip = fixture.debugElement.query(By.css('mat-chip'));
            chip.nativeElement.click();

            expect(component.clickEvent.emit).toHaveBeenCalledWith(component.membership);
        });

        describe('when the user is a member', () => {
            beforeEach(() => {
                component.membership.member = true;
                fixture.detectChanges();
            });

            it('has the "in" class', () => {
                const chip = fixture.debugElement.query(By.css('mat-chip'));
                expect(chip.nativeElement.classList).toContain('in');
            });

            it('displays the check icon', () => {
                validateIcon(fixture, 'mat-chip app-icon', 'check');
            });
        });

        describe('when the user is not a member', () => {
            beforeEach(() => {
                component.membership.member = false;
                fixture.detectChanges();
            });

            it('has the "not-in" class', () => {
                const chip = fixture.debugElement.query(By.css('mat-chip'));
                expect(chip.nativeElement.classList).toContain('not-in');
            });

            it('does not have the check icon', () => {
                validateDoesNotExist(fixture, 'mat-chip mat-icon');
            });

            it('displays the uncheck icon', () => {
                validateIcon(fixture, 'mat-chip app-icon', 'uncheck');
            });
        });
    });
});
