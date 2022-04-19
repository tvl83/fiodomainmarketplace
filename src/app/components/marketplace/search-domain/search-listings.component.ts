import {Component, OnInit} from '@angular/core';
import {WalletService} from '../../../services/wallet.service';
import {AccountInfo, stringToHash} from 'src/app/utilities/constants';
import {Subscription} from 'rxjs';

@Component({
    selector   : 'app-search-domain',
    templateUrl: './search-listings.component.html',
    styleUrls  : ['./search-listings.component.scss']
})
export class SearchListingsComponent implements OnInit {

    subscriptions: Subscription[];
    public selectedAccount: AccountInfo = {
        account_name: '',
        balance     : {amt: 0, fio: '', sufs: 0},
        nickname    : '',
        publicKey   : '',
        api         : null
    };

    constructor(
        private walletService: WalletService
    ) {
    }

    // https://cmichel.io/how-to-fetch-table-indexes-using-eosjs/

    async ngOnInit(): Promise<void> {
        const blah = this.search('thomas');
        console.log(blah);

        this.subscriptions.push(
            this.walletService.selectedAccount$
                .subscribe((next) => {
                    this.selectedAccount = next;
                })
        );
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
