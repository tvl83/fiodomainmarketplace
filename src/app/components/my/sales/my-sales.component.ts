import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppComponent} from '../../../app.component';
import {AppMainComponent} from '../../../app.main.component';
import {WalletService} from '../../../services/wallet.service';
import {AccountInfo} from "../../../utilities/constants";

@Component({
  selector: 'app-my-sales',
  templateUrl: './my-sales.component.html',
  styleUrls: ['./my-sales.component.scss']
})
export class MySalesComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    public accounts: AccountInfo[];
    public selectedAccount: AccountInfo;

    constructor(public app: AppComponent, public appMain: AppMainComponent, public walletService: WalletService) {

    }

    async ngOnInit() {
        this.subscriptions.push(
            this.walletService.accounts$
                      .subscribe((next) => {
                          this.accounts = next;
                      }),
            this.walletService.selectedAccount$
                      .subscribe((next) => {
                          this.selectedAccount = next;
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

}
