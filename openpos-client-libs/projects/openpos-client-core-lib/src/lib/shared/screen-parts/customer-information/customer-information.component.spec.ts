import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActionService } from '../../../core/actions/action.service';
import { CustomerInformationComponent } from './customer-information.component';
import { validateDoesNotExist, validateIcon, validateText } from '../../../utilites/test-utils';
import { PhonePipe } from '../../pipes/phone.pipe';
import { FormattersService } from '../../../core/services/formatters.service';
import { CustomerDetails } from './customer-information.interface';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElectronService } from 'ngx-electron';
import { CLIENTCONTEXT } from '../../../core/client-context/client-context-provider.interface';
import { TimeZoneContext } from '../../../core/client-context/time-zone-context';
import { Subscription } from 'rxjs';
import { KeyPressProvider } from '../../providers/keypress.provider';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../../components/icon/icon.component';

class MockMatDialog { }
class MockActionService { }
class ClientContext { }
class MockElectronService { }
class MockKeyPressProvider {
    subscribe(): Subscription {
        return new Subscription();
    }
}

describe('CustomerInformationComponent', () => {
    let component: CustomerInformationComponent;
    let fixture: ComponentFixture<CustomerInformationComponent>;
    let customer: CustomerDetails;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                CustomerInformationComponent,
                PhonePipe,
                MockComponent(IconComponent)
            ],
            providers: [
                { provide: MatDialog, useClass: MockMatDialog },
                { provide: ActionService, useClass: MockActionService },
                { provide: ElectronService, useClass: MockElectronService },
                { provide: KeyPressProvider, useClass: MockKeyPressProvider },
                { provide: ClientContext, useValue: {} },
                { provide: CLIENTCONTEXT, useClass: TimeZoneContext }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(CustomerInformationComponent);
        component = fixture.componentInstance;
        customer = {
            name: 'Bob bobert',
            email: 'b.bobert@gmail.com',
            phoneNumber: '1118798322',
            loyaltyNumber: 's321111111',
            accountNumberLabel: 'AccountNumber',
            accountNumber: '4567898909876540',
            creditLimitLabel: 'Credit Limit',
            creditLimit: '$2500.00',
            expiryDateLabel: 'Valid Thru',
            expiryDate: '08/24',
            address: {
                line1: '123 Mockingbird Lane',
                city: 'Columbus',
                state: 'OH',
                postalCode: '11111'
            },
            birthDate: '06/09/1991',
            memberTier: ''
        } as CustomerDetails;
        component.customer = customer;
        component.screenData = {
            emailIcon: 'mail_outline',
            phoneIcon: 'phone',
            loyaltyNumberIcon: 'account_heart',
            locationIcon: 'place',
            birthDateIcon: 'customer',
        };
        fixture.detectChanges();
    });

    it('renders', () => {
        expect(component).toBeDefined();
    });

    describe('component', () => {
    });

    describe('template', () => {
        it('displays the customer email and icon', () => {
            validateText(fixture, '.email', component.customer.email);
            validateIcon(fixture, '.email app-icon', 'mail_outline');
        });

        it('does not display the email when the user does not have one', () => {
            component.customer.email = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.email');
        });

        it('displays the customer phone number and icon', () => {
            const phonePipe: PhonePipe = new PhonePipe(TestBed.inject(FormattersService));
            validateText(fixture, '.phone-number', phonePipe.transform(component.customer.phoneNumber));
            validateIcon(fixture, '.phone-number app-icon', 'phone');
        });

        it('does not display the customer phone when the user does not have one', () => {
            component.customer.phoneNumber = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.phone-number');
        });

        it('displays the customer loyalty number and icon', () => {
            validateText(fixture, '.loyalty-number', component.customer.loyaltyNumber);
            validateIcon(fixture, '.loyalty-number app-icon', 'account_heart');
        });

        it('does not display the customer loyalty number when the user does not have one', () => {
            component.customer.loyaltyNumber = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.loyalty-number');
        });

        it('displays the customer account number label', () => {
            validateText(fixture, '.accountNumber-Label', component.customer.accountNumberLabel);
        });

        it('does not display the customer account number label when the user does not have one', () => {
            component.customer.accountNumberLabel = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.accountNumber-Label');
        });

        it('displays the customer account number ', () => {
            validateText(fixture, '.account-Number', component.customer.accountNumber);
        });

        it('does not display the customer account number when the user does not have one', () => {
             component.customer.accountNumber = undefined;
             fixture.detectChanges();

             validateDoesNotExist(fixture, '.account-Number');
         });

        it('displays the customer credit Limit label', () => {
              validateText(fixture, '.creditLimit-Label', component.customer.creditLimitLabel);
        });

        it('does not display the customer creditLimit  label when the user does not have one', () => {
            component.customer.creditLimitLabel = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.creditLimit-Label');
        });

        it('displays the account credit limit ', () => {
            validateText(fixture, '.credit-Limit', component.customer.creditLimit);
        });

        it('does not display the account credit limit when the user does not have one', () => {
            component.customer.creditLimit = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.credit-Limit');
        });

        it('displays the account expiry date label', () => {
            validateText(fixture, '.expiryDate-Label', component.customer.expiryDateLabel);
        });

        it('does not display the  account expiry date label when the user does not have one', () => {
            component.customer.expiryDateLabel = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.expiryDate-Label');
        });

        it('displays the account expiry date ', () => {
            validateText(fixture, '.expiry-Date', component.customer.expiryDate);
        });

        it('does not display the account expiry date when the user does not have one', () => {
            component.customer.expiryDate = undefined;
            fixture.detectChanges();

            validateDoesNotExist(fixture, '.expiry-Date');
        });
        describe('customer address', () => {
            it('does not display the customer loyalty number when the user does not have one', () => {
                component.customer.address = undefined;
                fixture.detectChanges();

                validateDoesNotExist(fixture, '.address');
            });

            it('displays the icon', () => {
                validateIcon(fixture, '.address app-icon', 'place');
            });

            describe('line1', () => {
                it('does not render the row if line1 is undefined', () => {
                    component.customer.address.line1 = undefined;
                    fixture.detectChanges();
                    validateDoesNotExist(fixture, '.address .line1');
                });
                it('renders the line1 data', () => {
                    component.customer.address.line1 = 'line 1 content';
                    fixture.detectChanges();
                    validateText(fixture, '.address .line1', 'line 1 content');
                });
            });

            describe('line2', () => {
                it('does not render the row if line2 is undefined', () => {
                    component.customer.address.line2 = undefined;
                    fixture.detectChanges();
                    validateDoesNotExist(fixture, '.address .line2');
                });
                it('renders the line2 data', () => {
                    component.customer.address.line2 = 'line 2 content';
                    fixture.detectChanges();
                    validateText(fixture, '.address .line2', 'line 2 content');
                });
            });

            describe('line3', () => {
                it(`does not render the 'city, ' if city is undefined`, () => {
                    component.customer.address.city = undefined;
                    fixture.detectChanges();
                    validateDoesNotExist(fixture, '.address .line3 .city');
                });

                it('renders the city', () => {
                    component.customer.address.city = 'a city';
                    fixture.detectChanges();
                    validateText(fixture, '.address .line3', 'a city, ');
                });

                it(`does not render the 'state ' if state is undefined`, () => {
                    component.customer.address.state = undefined;
                    fixture.detectChanges();
                    validateDoesNotExist(fixture, '.address .line3 .state');
                });

                it('renders the city', () => {
                    component.customer.address.state = 'OH';
                    fixture.detectChanges();
                    validateText(fixture, '.address .line3', 'OH ');
                });

                it(`does not render the 'postalCode' if postal code is undefined`, () => {
                    component.customer.address.postalCode = undefined;
                    fixture.detectChanges();
                    validateDoesNotExist(fixture, '.address .line3 .postalCode');
                });

                it('renders the postalCode', () => {
                    component.customer.address.state = '12345';
                    fixture.detectChanges();
                    validateText(fixture, '.address .line3', '12345');
                });
            });
        });
    });
});
