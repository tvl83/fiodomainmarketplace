import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from "./app.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {MyDomainsComponent} from "./components/my/domains/my-domains.component";
import {AppMainComponent} from "./app.main.component";
import {BuyDomainComponent} from "./components/marketplace/buy-domain/buy-domain.component";
import {ListDomainComponent} from './components/marketplace/list-domain/list-domain.component';
// import { MySalesComponent } from './components/my/sales/my-sales.component';
// import {MyListingsComponent} from "./components/my/listings/my-listings.component";

const routes: Routes = [
	{
		path    : '', component: AppMainComponent,
		children: [
			{path: '', component: DashboardComponent},
			// {path: 'admin', component: AdminComponent},
			// {path: 'login', component: LoginComponent},
			{
				path    : 'my',
				children: [
					// {path: 'account', component: MyAccountComponent},
					{path: 'domains', component: MyDomainsComponent},
					// {path: 'sales', component: MySalesComponent},
					// {path: 'listings', component: MyListingsComponent},
				]
			},
			{
				path    : 'marketplace',
				children: [
					// {path: 'search-listings', component: SearchListingsComponent},
					{path: 'list-domain', component: ListDomainComponent},
					{path: 'buy-domain/:domainname', component: BuyDomainComponent}
				]
			}
			// {path: 'about', component: AboutComponent},
		]
	},
	{path: '**', redirectTo: '/'},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
