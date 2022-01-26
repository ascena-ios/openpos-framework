import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActionService } from '../../../core/actions/action.service';
import { MembershipDisplayComponent } from './membership-display.component';
import { validateDoesNotExist, validateIcon, validateText } from '../../../utilites/test-utils';
import { By } from '@angular/platform-browser';
import { Membership } from './memebership-display.interface';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElectronService } from 'ngx-electron';
import { TimeZoneContext } from '../../../core/client-context/time-zone-context';
import { CLIENTCONTEXT } from '../../../core/client-context/client-context-provider.interface';
import { Subscription } from 'rxjs';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../../components/icon/icon.component';
import { MatChip, MatChipList } from '@angular/material/chips';

class MockActionService { }
class MockMatDialog { }
class MockElectronService { }
class ClientContext { }

describe('MembershipDisplayComponent', () => {
    let component: MembershipDisplayComponent;
    let fixture: ComponentFixture<MembershipDisplayComponent>;
    let membership: Membership;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                MembershipDisplayComponent,
                MockComponent(IconComponent),
                MockComponent(MatChipList),
                MockComponent(MatChip)
            ],
            providers: [
                { provide: MatDialog, useClass: MockMatDialog },
                { provide: ActionService, useClass: MockActionService },
                { provide: ElectronService, useClass: MockElectronService },
                { provide: ClientContext, useValue: {} },
                { provide: CLIENTCONTEXT, useClass: TimeZoneContext }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(MembershipDisplayComponent);
        component = fixture.componentInstance;
        component.screenData = {
            memberIcon: 'check',
            nonMemberIcon: 'close'
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

            it('displays the membership icon', () => {
                validateIcon(fixture, 'mat-chip app-icon', 'check');
            });

            it('does not have the non membership icon', () => {
                validateDoesNotExist(fixture, 'mat-chip app-icon .not-in');
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

            it('does not have the membership icon', () => {
                validateDoesNotExist(fixture, 'mat-chip app-icon .in');
            });

            it('has the non membership icon', () => {
                validateIcon(fixture, 'mat-chip app-icon', 'close');
            });
        });
    });
});
