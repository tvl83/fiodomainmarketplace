import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {StyleClassModule} from 'primeng/styleclass';
import {RippleModule} from 'primeng/ripple';
import {ButtonModule} from 'primeng/button';
import {MenuModule} from "primeng/menu";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {TableModule} from "primeng/table";
import {InputTextModule} from "primeng/inputtext";
import {InputNumberModule} from "primeng/inputnumber";

import {TabViewModule} from 'primeng/tabview';
import {CommonModule} from '@angular/common';
import {CardModule} from 'primeng/card';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {WalletService} from './services/wallet.service';
import {RatingModule} from "primeng/rating";
import {DataViewModule} from "primeng/dataview";
import {DropdownModule} from "primeng/dropdown";
import {MyDomainsComponent} from './components/my/domains/my-domains.component';
import {AppMainComponent} from "./app.main.component";
import {BuyDomainComponent} from "./components/marketplace/buy-domain/buy-domain.component";
import {ListDomainComponent} from "./components/marketplace/list-domain/list-domain.component";
import {SearchListingsComponent} from "./components/marketplace/search-domain/search-listings.component";
import {MyListingsComponent} from "./components/my/listings/my-listings.component";
import {MySalesComponent} from "./components/my/sales/my-sales.component";

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		MyDomainsComponent,
		AppMainComponent,
		BuyDomainComponent,
		ListDomainComponent,
		SearchListingsComponent,
		MyListingsComponent,
		MySalesComponent
	],
	imports     : [
		BrowserModule,
		AppRoutingModule,
		StyleClassModule,
		RippleModule,
		ButtonModule,
		MenuModule,
		TableModule,
		InputTextModule,
		InputNumberModule,
		HttpClientModule,
		BrowserAnimationsModule,
		ButtonModule,
		TabViewModule,
		ReactiveFormsModule,
		CardModule,
		ToastModule,
		FormsModule,
		RatingModule,
		DataViewModule,
		DropdownModule
	],
	providers   : [
		WalletService, MessageService
	],
	bootstrap   : [AppComponent]
})
export class AppModule {
}
