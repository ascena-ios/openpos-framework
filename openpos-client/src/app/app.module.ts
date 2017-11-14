import { WarrantyCoverageComponent } from './screens/warranty-coverage.component';
import { SaleRetrievalComponent } from './screens/sale-retrieval.component';
import { LoaderService } from './common/loader/loader.service';
import { LoaderComponent } from './common/loader/loader.component';
import { CartComponent } from './kiosk/cart.component';
import { SafePipe } from './common/safe.pipe';
import { EmbeddedWebPageComponent } from './screens/embedded-web-page.component';
import { ScreenService } from './screen.service';
import { ScreenDirective } from './common/screen.directive';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StompConfig, StompService } from '@stomp/ng2-stompjs';
import { Location, LocationStrategy, PathLocationStrategy, DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { PosComponent } from './pos/pos.component';
import { KioskComponent } from './kiosk/kiosk.component';

import { AppRoutingModule } from './app-routing.module';

import { SessionService } from './session.service';
import { IconService } from './icon.service';
import { AbstractApp } from './screens/abstract-app';
import { PromptComponent } from './screens/prompt.component';
import { IconComponent } from './common/controls/icon.component';
import { ProductListComponent } from './common/controls/product-list.component';
import { PromptInputComponent } from './common/controls/prompt-input.component';
import { SellComponent } from './screens/sell.component';
import { BasicItemSearchComponent } from './screens/basic-item-search.component';
import { ChooseOptionsComponent } from './screens/choose-options.component';
import { PromptWithOptionsComponent } from './screens/prompt-with-options.component';
import { DialogComponent } from './screens/dialog.component';
import { FormComponent } from './screens/form.component';
import { HomeComponent } from './screens/home.component';
import { StatusBarComponent } from './screens/statusbar.component';
import { PaymentStatusComponent } from './screens/payment-status.component';
import { SellItemDetailComponent } from './screens/sell-item-detail.component';
import { SignatureCaptureComponent } from './screens/signature-capture.component';
import { StaticTableComponent } from './screens/static-table.component';
import { ItemListComponent } from './screens/item-list.component';
import { FocusDirective } from './common/focus.directive';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // for material
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

import {
  MatDialog,
  MatDialogRef,
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatStepperModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import 'hammerjs'; // for material
import { TextMaskModule } from 'angular2-text-mask';
import { PersonalizationComponent } from './screens/personalization.component';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@NgModule({
  entryComponents: [
    BasicItemSearchComponent,
    CartComponent,
    ChooseOptionsComponent,
    DialogComponent,
    EmbeddedWebPageComponent,
    FormComponent,
    HomeComponent,
    ItemListComponent,
    PaymentStatusComponent,
    PromptComponent,
    PersonalizationComponent,
    PromptWithOptionsComponent,
    SellComponent,
    SellItemDetailComponent,
    SignatureCaptureComponent,
    StaticTableComponent,
    SaleRetrievalComponent,
    WarrantyCoverageComponent
  ],
  declarations: [
    AppComponent,
    PosComponent,
    KioskComponent,
    CartComponent,
    DialogComponent,
    IconComponent,
    ProductListComponent,
    PromptComponent,
    PromptInputComponent,
    BasicItemSearchComponent,
    ItemListComponent,
    ChooseOptionsComponent,
    PromptWithOptionsComponent,
    SignatureCaptureComponent,
    SellComponent,
    SellItemDetailComponent,
    PaymentStatusComponent,
    StaticTableComponent,
    PersonalizationComponent,
    SaleRetrievalComponent,
    LoaderComponent,
    FormComponent,
    HomeComponent,
    StatusBarComponent,
    EmbeddedWebPageComponent,
    FocusDirective,
    ScreenDirective,
    SafePipe,
    WarrantyCoverageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatStepperModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    TextMaskModule
  ],
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatStepperModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  providers: [
    MatDialog,
    HttpClient,
    IconService,
    SessionService,
    LoaderService,
    ScreenService,
    Location,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
