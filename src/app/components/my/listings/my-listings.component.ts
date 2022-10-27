import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppComponent} from '../../../app.component';
import {AppMainComponent} from '../../../app.main.component';
import {WalletService} from '../../../services/wallet.service';
import {
  AccountInfo,
  CancelListingPayload,
  Contracts, ConvertAmtToSuf,
  ConvertSufToFio,
  EscrowActions,
  Listing, TPID
} from "../../../utilities/constants";

@Component({
  selector   : 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrls  : ['./my-listings.component.scss']
})
export class MyListingsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  public listings: Listing[] = [];

  public isLoggedIn: boolean;
  public selectedAccount: AccountInfo;
  public activeListings: Listing[]    = [];
  public soldListings: Listing[]      = [];
  public cancelledListings: Listing[] = [];

  constructor(public app: AppComponent, public appMain: AppMainComponent, public walletService: WalletService) {

  }

  async ngOnInit() {
    this.subscriptions.push(
      this.walletService.selectedAccount$
          .subscribe((next) => {
            this.selectedAccount = next;
            console.log(`selected account updated`);
            if (!!this.selectedAccount.listings) {
              this.formatListings(this.selectedAccount.listings);
            }
          }),
      this.walletService.isLoggedIn$
          .subscribe(async (next) => {
            this.isLoggedIn = next;
            if (this.isLoggedIn) {
              await this.walletService.updateDomains();
            }
          })
    );

    await this.walletService.updateListings();
  }

  ngOnDestroy() {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  formatListings(listings: Listing[]) {
    this.activeListings    = [];
    this.soldListings      = [];
    this.cancelledListings = [];

    listings.forEach(list => {
      const updatedListing: Listing = {
        ...list,
        sale_price_fio    : ConvertSufToFio(list.sale_price),
        commission_fee_pct: `${(parseFloat(list.commission_fee)).toFixed(0)} %`,
        status_str        : list.status === 1 ? `Listed` : list.status === 2 ? `Sold` : `Cancelled`
      };

      this.listings.push(updatedListing);

      if (list.status === 1) {
        this.activeListings.push(updatedListing);
      } else if (list.status === 2) {
        this.soldListings.push(updatedListing);
      } else {
        this.cancelledListings.push(updatedListing);
      }
    });
    console.log(this.activeListings);
  }

  public async cancelListing(domain: Listing, sale_id: number) {
    const action: CancelListingPayload = {
      name         : EscrowActions.ListDomain,
      authorization: null,
      account      : Contracts.FioEscrow,
      data         : {
        actor     : '',
        fio_domain: domain.domain,
        sale_id   : sale_id,
        max_fee   : ConvertAmtToSuf(5),
        tpid      : TPID.account
      }
    };

    await this.walletService.cancelListing(this.selectedAccount, action);

    await this.walletService.updateListings();
  }
}
