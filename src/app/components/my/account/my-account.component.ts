import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AccountInfo} from '../../../util/constants';
import {WalletService} from '../../../services/wallet.service';
import {Router} from '@angular/router';

@Component({
    selector   : 'app-my-account',
    templateUrl: './my-account.component.html',
    styleUrls  : ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit, AfterViewInit {
    subscriptions: Subscription[] = [];

    public isLoggedIn: boolean;
    public accounts: AccountInfo[];
    public selectedAccount: AccountInfo = {
        domains     : [],
        account_name: '',
        api         : undefined,
        balance     : {amt: 0, fio: '', sufs: 0},
        listings    : [],
        nickname    : '',
        publicKey   : '',
        addresses   : []
    };

    constructor(private walletService: WalletService, private router: Router) {
    }

    async ngOnInit() {
        this.subscriptions.push(
            this.walletService.selectedAccount$
                .subscribe((next) => {
                    console.log(next);
                    this.selectedAccount = next;
                }),
            this.walletService.isLoggedIn$
                .subscribe((next) => {
                    this.isLoggedIn = next;
                })
        );
    }

    ngAfterViewInit(): void {
        if (!this.isLoggedIn) {
            this.router.navigateByUrl('login');
        }
    }
}
