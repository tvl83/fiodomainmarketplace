import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AccountInfo, ConvertSufToFio, Listing, stringToHash} from 'src/app/utilities/constants';
import {WalletService} from "../../services/wallet.service";

interface Product {
	id?: string;
	code?: string;
	name?: string;
	description?: string;
	price?: number;
	quantity?: number;
	inventoryStatus?: string;
	category?: string;
	image?: string;
	rating?: number;
}

interface SelectItem {
	label?: string;
	value?: string;
}

@Component({
	templateUrl: './dashboard.component.html',
	styleUrls  : ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
	subscriptions: Subscription[] = [];

	public soldDomains: number          = 0;
	public accounts: AccountInfo[]      = [];
	public selectedAccount: AccountInfo = {
		account_name: '',
		balance     : {amt: 0, fio: '', sufs: 0},
		nickname    : '',
		publicKey   : ''
	};
	public listings: Listing[]          = [];
	public rows: number                 = 5;
	public currentPage: number          = 1;
	public totalRecords: number         = 0;
	public counts                       = {listings: 0, sold: 0};
	public results: any;
	public disablePrev: boolean         = true;
	public disableNext: boolean         = true;
	public loading: boolean             = false;

	public searchTerm: string         = "";
	public isSearching: boolean       = false;
	public searchResultsListedMatch: any;
	public searchResultsRegisteredMatch: any;
	public searchResultString: string = "";

	products: Product[]       = [];
	sortOptions: SelectItem[] = [];
	sortKey: string           = "";
	sortOrder: number         = 0;
	sortField: string         = "";
	eBreakSet: boolean        = false;

	constructor(private walletService: WalletService, private http: HttpClient) {
	}

	async ngOnInit() {
		this.counts   = await this.walletService.countListings();
		this.products = [];

		await this.search("blah")

		this.sortOptions = [
			{label: 'Price High to Low', value: '!price'},
			{label: 'Price Low to High', value: 'price'}
		];
		this.subscriptions.push(
			this.walletService.selectedAccount$
			    .subscribe((next) => {
				    this.selectedAccount = next;
			    }),
			await this.walletService.eBreakSet$
			          .subscribe((next) => {
				          this.eBreakSet = next;
			          })
		);
	}

	ngOnDestroy() {
		if (this.subscriptions.length > 0) {
			this.subscriptions.forEach(sub => {
				sub.unsubscribe();
			});
		}
	}

	public async loadListings(event: any) {
		this.loading = true;
		this.rows    = event.rows;
		let page     = (event.first / event.rows);
		const filter = event.globalFilter;
		await this.getNextPage(page, event.sortField, event.sortOrder, filter);
		this.loading      = false;
	}

	public onPageChange(event: any) {
		console.log(`PAGE CHANGE`);
		console.log(event);
	}

	public async getNextPage(page: number, sortField: string, sortOrder: number, filter: string) {
		this.loading  = true;
		// this.currentPage += page;
		this.listings = [];
		this.results  = await this.walletService.getActiveListingsByPage(page, this.rows, sortField, sortOrder, filter);

		console.log(this.results);

		this.results.rows.forEach((listing: Listing) => {
			this.listings.push({
				...listing,
				domain        : listing.domain,
				sale_price_fio: ConvertSufToFio(listing.sale_price),
				date_listed   : listing.date_listed
			});
		});

		console.log(`this.results`);
		console.log(this.results);

		this.disableNext  = !this.results.more;
		this.disablePrev  = this.currentPage === 0;
		this.totalRecords = this.results.totalRecords;
	}

	async search(term: string) {
		const hashedTerm = stringToHash(term);
		const result     = await this.selectedAccount.api
		                             .rpc
		                             .get_table_rows({
			                             table         : 'domainsales',
			                             code          : 'fio.escrow',
			                             scope         : 'fio.escrow',
			                             index_position: 2,
			                             key_type      : 'i128',
			                             lower_bound   : hashedTerm,
			                             upper_bound   : hashedTerm
		                             });
		return result.rows[0];
	}
}
