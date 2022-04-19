import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {WalletService} from '../../../services/wallet.service';
import {MessageService} from 'primeng/api';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {
    AccountInfo,
    BuyListingPayload,
    ConvertAmtToSuf,
    ConvertSufToFio,
    Listing, MarketplaceConfig,
    TPID
} from 'src/app/utilities/constants';

@Component({
    selector   : 'app-buy-domain',
    templateUrl: './buy-domain.component.html',
    styleUrls  : ['./buy-domain.component.scss']
})
export class BuyDomainComponent implements OnInit, OnDestroy {

    subscriptions: Subscription[] = [];

    public marketplaceConfig: MarketplaceConfig = {commission_fee: "", e_break: 0, listing_fee: 0, owner: ""};
    public domainSale: FormGroup = new FormGroup({}, undefined, undefined);
    fromMyDomains: boolean = false;
    domainForSale: string = "";
    domainHash: string = "";
    listingFee: string            = '0.00000 FIO';
    marketplaceCommission: string = '0.00000 FIO';
    receiveAmountFio: string      = '0.00000 FIO';
    receiveAmount: number = 0;
    public isLoggedIn: boolean = false;
    public fioUsdValue: number = 0;
    public selectedAccount: AccountInfo = {};
    public listing: Listing = {
        commission_fee    : "",
        commission_fee_pct: "",
        date_listed       : 0,
        date_updated      : 0,
        domain            : "",
        id                : 0,
        owner             : "",
        sale_price        : 0,
        sale_price_fio    : "",
        status            : 0,
        status_str        : ""
    };

    constructor(private fb: FormBuilder,
                private walletService: WalletService,
                private messageService: MessageService,
                public router: Router,
                private route: ActivatedRoute
    ) {
    }

    async ngOnInit(): Promise<void> {


        this.subscriptions.push(
            this.walletService.isLoggedIn$
                .subscribe(async next => {
                    this.isLoggedIn = next;

                    if (this.isLoggedIn) {
                        if (history.state.data !== undefined) {
                            this.listing                = history.state.data.listing;
                            this.listing.sale_price_fio = ConvertSufToFio(this.listing.sale_price);
                            console.log(`listing`, this.listing);
                        } else {
                            this.domainForSale          = this.route.snapshot.paramMap.get('domainname') || "";
                            this.listing                = await this.walletService.getDomainListingInfo(this.domainForSale);
                            this.listing.sale_price_fio = ConvertSufToFio(this.listing.sale_price);
                        }
                    } else {
                        this.router.navigateByUrl('login');
                    }
                })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    async buyDomain() {
        if (!this.isLoggedIn) {
            await this.walletService.login();
        } else {

            const payload: BuyListingPayload = {
                account      : '',
                authorization: [],
                data         : {
                    actor        : {},
                    fio_domain   : this.listing.domain,
                    max_buy_price: this.listing.sale_price,
                    max_fee      : ConvertAmtToSuf(5),
                    sale_id      : this.listing.id,
                    tpid         : ""
                },
                name         : ''
            };

            await this.walletService.buyListing(this.selectedAccount, payload);
            await this.walletService.updateBalance();
            this.router.navigateByUrl('my/domains');
        }
    }
}
