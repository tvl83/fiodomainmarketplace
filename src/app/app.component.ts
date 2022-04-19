import {Component} from '@angular/core';
import {Md5} from 'ts-md5/dist/md5';
import {WalletService} from "./services/wallet.service";
import { AccountInfo } from './utilities/constants';
import {Subscription} from "rxjs";

@Component({
	selector   : 'app-root',
	templateUrl: './app.component.html',
	styleUrls  : ['./app.component.css']
})
export class AppComponent {
	title = 'FIO Domain Marketplace';

	subscriptions: Subscription[] = [];
	public isLoggedIn: boolean = false;
	public accounts: AccountInfo[] = [];
	public selectedAccount: AccountInfo = {};

	constructor(public walletService: WalletService){

	}

	async ngOnInit() {

		await this.walletService.getFioUSDValue();

		await this.walletService.restoreSession();

		this.subscriptions.push(
			await this.walletService.accounts$
			          .subscribe((next) => {
				          console.log(`account$`)
				          console.log(next)
				          this.accounts = next;
			          }),
			await this.walletService.selectedAccount$
			          .subscribe((next) => {
				          console.log(`selectedAccount$`)
				          console.log(next)
				          this.selectedAccount = next;
			          }),
			await this.walletService.isLoggedIn$
			          .subscribe((next) => {
									console.log(`isLoggedIn$`)
									console.log(next)
				          this.isLoggedIn = next;
			          })
		);
	}

	getGravatarURL(email: any) {
		const md5 = new Md5();
		const hash = md5.appendStr(String(email).trim().toLowerCase()).end();
		return `https://www.gravatar.com/avatar/${hash}?d=retro`;
	}
}
