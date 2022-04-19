import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {MenuItem} from 'primeng/api';

import {AppComponent} from '../../../app.component';
import {AppMainComponent} from '../../../app.main.component';
import {WalletService} from '../../../services/wallet.service';
import {AccountInfo} from "../../../utilities/constants";


@Component({
  selector: 'app-my-domains',
  templateUrl: './my-domains.component.html',
  styleUrls: ['./my-domains.component.css']
})
export class MyDomainsComponent implements OnInit {

  subscriptions: Subscription[] = [];
  public isLoggedIn: boolean = false;
  public selectedAccount: AccountInfo = {domains:[]};
  public domains: [] = []

  constructor(public app: AppComponent, public appMain: AppMainComponent, public walletService: WalletService) {

  }

  async ngOnInit() {
    console.log(`my-domains ngOnInit()`);
    this.subscriptions.push(
      this.walletService.selectedAccount$
          .subscribe((next) => {
            this.selectedAccount = next;
            if(this.selectedAccount.domains !== undefined) {
              this.domains = this.selectedAccount.domains;
            }
          }),
      this.walletService.isLoggedIn$
          .subscribe(async (next) => {
            this.isLoggedIn = next;
            if (this.isLoggedIn) {
              console.log(`isLoggedIn. Calling updateDomains`);
              await this.walletService.updateDomains();

            }
          }),
    );

  }

  ngOnDestroy() {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  listDomain(domainName: string) {

  }

}
