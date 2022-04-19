import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    AccountInfo,
    Contracts,
    ConvertAmtToSuf,
    ConvertFioToAmt,
    ConvertSufToFio,
    CreateListingPayload,
    EscrowActions,
    MarketplaceConfig, TPID
} from 'src/app/utilities/constants';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {WalletService} from '../../../services/wallet.service';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {Subscription} from 'rxjs';

@Component(
  {
    selector   : 'app-list-domain',
    templateUrl: './list-domain.component.html',
    styleUrls  : ['./list-domain.component.scss']
  })
export class ListDomainComponent implements OnInit, OnDestroy {

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
  public showBreakdown: boolean = false;

  constructor(private fb: FormBuilder,
              private walletService: WalletService,
              public messageService: MessageService,
              public router: Router) {
  }

  async ngOnInit(): Promise<void> {

    this.domainSale = this.fb.group({
      domainName  : [{value: '', disabled: true}, [Validators.required]],
      listingPrice: ['', [Validators.required]],
    });

    if (!!history.state.data) {
      this.fromMyDomains = history.state.data.fromMyDomains;
      this.domainForSale = history.state.data.domain;
      // @ts-ignore
      this.domainSale.get('domainName').setValue(this.domainForSale);
    } else {
      await this.router.navigateByUrl('my/domains');
    }

    this.subscriptions.push(
      this.walletService.marketplaceConfig$
          .subscribe(next => {
            this.marketplaceConfig = next;
          }),

      this.walletService.fioUsdValue$
          .subscribe((next) => {
            this.fioUsdValue = parseFloat(next);
          }),

      this.walletService.selectedAccount$
          .subscribe((next) => {
            this.selectedAccount = next;
          }),

      this.walletService.isLoggedIn$
          .subscribe((next) => {
            this.isLoggedIn = next;
          })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  async listDomain() {
    if (!this.isLoggedIn) {
      await this.walletService.login();
    } else {
      const action: CreateListingPayload = {
        name         : EscrowActions.ListDomain,
        authorization: null,
        account      : Contracts.FioEscrow,
        data         : {
          actor     : '',
          fio_domain: this.domainForSale,
          max_fee   : ConvertAmtToSuf(5),
          sale_price: ConvertAmtToSuf(this.domainSale.get('listingPrice').value),
          tpid      : ""
        }
      };

      const response = await this.walletService.createListing(this.selectedAccount, action);
      await this.walletService.updateBalance();
      console.log(response);
      if (response.resolved !== undefined) {
        this.messageService.add({
          severity: 'success',
          summary : 'Domain',
          detail  : `Listed domain for sale`
        });
        await this.walletService.updateDomains();
        this.router.navigateByUrl('my/listings');
      } else {
        this.messageService.add({
          severity: 'error',
          summary : 'Domain',
          detail  : `Failed to listed domain for sale`
        });
      }
    }
  }

  calcFees() {
    console.log(`calc fees`);
    this.showBreakdown = true;
    let listingPrice   = this.domainSale.get('listingPrice').value;
    if (listingPrice < 0) {
      this.domainSale.get('listingPrice').setValue(null);
      listingPrice = null;
    }
    if (!!listingPrice) {
      this.marketplaceCommission = ConvertSufToFio(
        (parseFloat(this.marketplaceConfig.commission_fee) / 100) * ConvertAmtToSuf(listingPrice)
      );

      this.listingFee       = ConvertSufToFio(this.marketplaceConfig.listing_fee);
      this.receiveAmountFio = ConvertSufToFio(ConvertAmtToSuf(listingPrice) - ConvertAmtToSuf(ConvertFioToAmt(this.marketplaceCommission)));
      this.receiveAmount    = (ConvertFioToAmt(this.receiveAmountFio));
    }
  }
}
