import {Injectable} from '@angular/core';
import {
	AccountInfo,
	BuyListingPayload,
	CancelListingPayload,
	Contracts,
	ConvertSufToFio,
	CreateListingPayload,
	EscrowActions,
	EscrowTables,
	MarketplaceConfig,
	stringToHash,
	TPID
} from '../utilities/constants';
import {BehaviorSubject, firstValueFrom, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Api, JsonRpc} from 'eosjs';
import AnchorLink, {LinkSession} from 'anchor-link';
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport';
import {JsSignatureProvider} from 'eosjs/dist/eosjs-jssig';

import {environment} from '../../environments/environment';

let walletHost = '';
let apiUrl = '';
if (environment.production) {
	walletHost = `fio-mainnet.eosblocksmith.io`;
	apiUrl = 'api-mainnet.fiomarketplace.com'
} else {
	walletHost = `fio-testnet.eosblocksmith.io`;
	apiUrl = 'api-testnet.fiomarketplace.com'
}
const endpoint = `https://${walletHost}/`;
const apiEndpoint = `https://${apiUrl}/`

const rpc               = new JsonRpc(endpoint);
const chainId           = 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e';
const signatureProvider = new JsSignatureProvider(['5KcjPwGJ3MHrWcSLhh7ePt3DfmgRZGrZNjSH4fXUrdqHtj4BoUj']);

// Anchor Link
const appNameId = 'fiomarketplace';
// initialize the browser transport
const transport = new AnchorLinkBrowserTransport();
// initialize the link
const link      = new AnchorLink({
	transport,
	chains: [{
		chainId,
		nodeUrl: endpoint,
	}]
});


// end Anchor Link

@Injectable({
	providedIn: 'root'
})
export class WalletService {

	public api = new Api({
		rpc, signatureProvider, chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()
	});

	public session: LinkSession;
	public fioUsdValue$: Subject<string> = new BehaviorSubject<string>(`0.00`);
	public isLoggedIn: boolean           = false;
	public isLoggedIn$: Subject<boolean> = new BehaviorSubject<boolean>(false);
	public accountName: string           = "";

	private marketplaceConfig: MarketplaceConfig          = {owner: '', commission_fee: '', listing_fee: 0, e_break: 0};
	public marketplaceConfig$: Subject<MarketplaceConfig> = new BehaviorSubject<MarketplaceConfig>(
		{
			owner         : '',
			commission_fee: '',
			listing_fee   : 0,
			e_break       : 0
		}
	);

	public selectedAccount$: Subject<AccountInfo> = new BehaviorSubject<AccountInfo>(
		{
			domains     : [],
			account_name: '',
			api         : undefined,
			balance     : {amt: 0, fio: '', sufs: 0},
			listings    : [],
			nickname    : '',
			publicKey   : '',
			addresses   : []
		});
	public accounts$: Subject<AccountInfo[]>      = new BehaviorSubject<AccountInfo[]>([]);
	private selectedAccount: AccountInfo          = {
		domains     : [],
		account_name: '',
		api         : undefined,
		balance     : {amt: 0, fio: '', sufs: 0},
		listings    : [],
		nickname    : '',
		publicKey   : '',
		addresses   : []
	};

	constructor(private http: HttpClient) {

	}

	public async getFioUSDValue() {
		this.http.get(`https://api.coingecko.com/api/v3/simple/price?ids=fio-protocol&vs_currencies=usd`)
		    .subscribe((response: any) => {
			    this.fioUsdValue$.next(response['fio-protocol'].usd);
		    });
	}

	async login(): Promise<any> {
		const identity  = await link.login(appNameId);
		const {session} = identity;
		this.session    = session;
		await this.setLoggedIn(true);
	}

	async logout(): Promise<any> {
		console.log(this.session.chainId);
		await this.session.remove();
		this.selectedAccount = {
			domains     : [],
			account_name: '',
			api         : undefined,
			balance     : {amt: 0, fio: '', sufs: 0},
			listings    : [],
			nickname    : '',
			publicKey   : '',
			addresses   : []
		};
		this.selectedAccount$.next(this.selectedAccount);
		await this.setLoggedIn(false);
	}

	public async setLoggedIn(value: boolean): Promise<void> {
		if (value) {
			this.accountName                  = this.session.auth.toString().split('@')[0];
			this.selectedAccount.account_name = this.session.auth.toString().split('@')[0];
			const accounts                    = await this.api.rpc.get_table_rows({
				table      : 'accountmap',
				scope      : 'fio.address',
				code       : 'fio.address',
				upper_bound: this.selectedAccount?.account_name,
				lower_bound: this.selectedAccount?.account_name,
				json       : true,
				limit      : 1
			});

			if (accounts.rows.length > 0) {
				this.selectedAccount.publicKey = accounts.rows[0].clientkey;
			}

			this.selectedAccount$.next(this.selectedAccount);

			this.getMarketplaceConfig().then(r => console.log('marketplaceConfig'));
			await this.updateDomains();
			await this.updateBalance();
			await this.updateListings();
		}
		this.isLoggedIn = value;
		this.isLoggedIn$.next(value);
	}

	private async getMarketplaceConfig() {
		const results: any = await this.api.rpc
		                               .get_table_rows({
			                               table: EscrowTables.MarketplaceConfigTable,
			                               scope: Contracts.FioEscrow,
			                               code : Contracts.FioEscrow,
			                               json : true,
			                               limit: 1
		                               });
		this.marketplaceConfig$.next(results.rows[0]);
	}

	async restoreSession() {
		const session = await link.restoreSession(appNameId);
		// @ts-ignore
		this.session  = session;
		if (this.session !== null) {
			await this.setLoggedIn(true);
		}
	}

	public async updateBalance() {
		if (this.selectedAccount.publicKey !== undefined) {
			this.api.rpc.get_fio_balance(this.selectedAccount.publicKey)
			    .then((result: any) => {
				    if (this.selectedAccount.balance !== undefined) {
					    this.selectedAccount.balance.sufs = result.available;
					    this.selectedAccount.balance.fio  = ConvertSufToFio(result.available);
					    this.selectedAccount$.next(this.selectedAccount);
				    }
			    })
			    .catch(err => {
				    console.error(err);
			    });
		}
	}

	async countListings() {

		const response = {
			listings: 0,
			sold    : 0
		};

		const listings = await this.api.rpc
		                           .get_table_rows({
			                           table: 'domainsales',
			                           code : 'fio.escrow',
			                           scope: 'fio.escrow',
			                           limit: 2500
		                           });

		listings.rows.forEach(listing => {
			if (listing.status === 1) {
				response.listings++;
			} else if (listing.status === 2) {
				response.sold++;
			}
		});

		return response;
	}

	public async getActiveListingsByPage(page: number, perPage: number, sort: string = "", order: number = 1, filter: string = "") {
		const getEscrowListing$ = this.http.post(`${apiEndpoint}/get_escrow_listings`, {
				status: 1,
				offset: page * perPage,
				limit : perPage
			}
		);

		const results: any = await firstValueFrom(getEscrowListing$);
		const response     = {more: results.more, rows: [], totalRecords: 0};

		console.log(`results`, results)
		console.log(`response`, response)

		if (filter !== null) {
			results.listings.filter(((row: any) => row.domain.includes(filter)));
		}

		if (sort !== null) {
			switch (sort) {
				case 'date_updated':
					results.listings.sort((a: any, b: any) => {
						if (a.date_updated < b.date_updated) {
							return 1;
						}
						if (a.date_updated > b.date_updated) {
							return -1;
						}
						return 0;
					});
					break;
				case 'domain':
					results.listings.sort((a: any, b: any) => {
						if (a.domain < b.domain) {
							return 1;
						}
						if (a.domain > b.domain) {
							return -1;
						}
						return 0;
					});
					break;
				case 'owner':
					results.listings.sort((a: any, b: any) => {
						if (a.owner < b.owner) {
							return 1;
						}
						if (a.owner > b.owner) {
							return -1;
						}
						return 0;
					});
					break;
				case 'sale_price_fio':
					results.listings.sort((a: any, b: any) => {
						if (a.sale_price < b.sale_price) {
							return 1;
						}
						if (a.sale_price > b.sale_price) {
							return -1;
						}
						return 0;
					});
					break;
			}

			if (order === -1) {
				results.listings.reverse();
			}
		}

		response.rows = results.listings;
		console.log(`page: `, page)
		console.log(`perPage: `, perPage)
		page += 1;

		if (results.listings.length < perPage) {
			response.totalRecords = ((page * perPage)) + results.more - (perPage - results.listings.length);
		} else {
			response.totalRecords = ((page * perPage)) + results.more;
		}
		return response;
	}

	public async updateDomains() {
		let pubkey = '';
		if (this.isLoggedIn && this.selectedAccount) {
			if (this.selectedAccount.publicKey !== undefined)
				pubkey = this.selectedAccount.publicKey;
			this.api.rpc.get_fio_domains(pubkey)
			    .then((result: any) => {
				    this.selectedAccount.domains = result.fio_domains;
				    this.selectedAccount$.next(this.selectedAccount);
			    })
			    .catch(err => {
				    console.error(err);
			    });
		}
	}

	async getDomainListingInfo(domainName: string) {
		return await this.searchByDomainName(domainName);
	}

	async searchByDomainName(domainName: string) {
		const hashedTerm = stringToHash(domainName);
		const result     = await this.api.rpc
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

	async buyListing(account: AccountInfo, payload: BuyListingPayload) {
		const action: BuyListingPayload = {
			account      : Contracts.FioEscrow,
			name         : EscrowActions.BuyDomainSale,
			authorization: [this.session.auth],
			data         : {
				actor        : this.session.auth.actor,
				sale_id      : payload.data.sale_id,
				fio_domain   : payload.data.fio_domain,
				max_buy_price: payload.data.max_buy_price,
				max_fee      : payload.data.max_fee,
				tpid         : TPID.account
			}
		};

		return await this.session.transact({action});
	}

	async createListing(account: AccountInfo, payload: CreateListingPayload) {
		const action: CreateListingPayload = {
			account      : Contracts.FioEscrow,
			name         : EscrowActions.ListDomain,
			authorization: [this.session.auth],
			data         : {
				actor     : this.session.auth.actor,
				fio_domain: payload.data.fio_domain,
				sale_price: payload.data.sale_price,
				max_fee   : payload.data.max_fee,
				tpid      : TPID.account
			}
		};
		// @ts-ignore
		return await this.session.transact({action});
	}

	public async updateListings() {
		const results: any = await this.api.rpc
		                               .get_table_rows({
			                               table         : EscrowTables.DomainSalesTable,
			                               scope         : Contracts.FioEscrow,
			                               code          : Contracts.FioEscrow,
			                               json          : true,
			                               index_position: 1,
			                               limit         : 100
		                               })
		                               .catch(err => {
			                               console.error(err);
		                               });

		this.selectedAccount.listings = [];
		results.rows.forEach((row: any) => {
			if (row.owner === this.selectedAccount.account_name) {
				this.selectedAccount.listings.push(row);
			}
		});
		this.selectedAccount$.next(this.selectedAccount);
	}

	async cancelListing(account: AccountInfo, payload: CancelListingPayload) {
		const action: CancelListingPayload = {
			account      : Contracts.FioEscrow,
			name         : EscrowActions.CancelDomainSale,
			authorization: [this.session.auth],
			data         : {
				actor     : this.session.auth.actor,
				fio_domain: payload.data.fio_domain,
				max_fee   : payload.data.max_fee,
				tpid      : TPID.account
			}
		};

		return await this.session.transact({action});
	}
}
