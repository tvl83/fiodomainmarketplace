import {Api} from 'eosjs';
import {createHash} from 'crypto';
import {PermissionLevel} from '@greymass/eosio';
import { environment } from 'src/environments/environment';

export const Contracts = {
    FioEscrow : 'fio.escrow',
    FioAddress: 'fio.address'
};

export const TPID = {
    account: environment.tpidAddress
};

export const EscrowActions = {
    BuyDomainSale              : 'buydomain',
    CancelDomainSale           : 'cxlistdomain',
    ListDomain                 : 'listdomain',
    SetHolderAccount           : 'sethldacct',
    SetMarketplaceConfig       : 'setmrkplcfg',
    RemoveMarketplaceConfig    : 'rmmrkplcfg',
    SetMarketplaceCommissionFee: 'setmkpcomfee',
    SetMarketplaceListingFee   : 'setmkplstfee',
    SetMarketplaceEBreak       : 'setmkpebreak'
};

export const EscrowTables = {
    DomainSalesTable      : 'domainsales',
    MarketplaceConfigTable: 'mrkplconfigs'
};

export const NickNames = {
    marketplace  : 'Marketplace',
    holderAccount: 'Escrow Account',
    userOne      : 'User One',
    userTwo      : 'User Two',
    userThree    : 'User Three'
};

export const Actors = {
    marketplace  : '5ufabtv13hv4',
    holderAccount: 'fio.escrow',
    userOne      : 'wjeo4abnk4c2',
    userTwo      : 'g4oc1qkysew2',
    userThree    : 'ltllcgohc4op'
};

export const EscrowEndpoints = {};

/**
 * Definitions:
 * sufs (number): Smallest Unit of FIO, 1 billionth of a FIO, e.g. 1000000000 = 1
 * Amt/Amount (number): suf * 1 billion to get a float value, e.g. 1.000000000 = 1000000000
 * FIO (string): string of the `Amount` and Symbol separated by space, e.g. 20.000000000 FIO
 */

export const ConvertSufToFio = (sufs: number) => {

    // toFixed gets the right amount of precision
    // wrapped that in Number() and then did a .toString() to then truncate trailing 0s

    return `${Number((sufs / 1000000000).toFixed(9)).toString()} FIO`;
};

export const ConvertAmtToSuf = (amt: number): number => {
    return amt * 1000000000;
};

export const ConvertFioToAmt = (fio: string): number => {
    return parseFloat(parseFloat((fio.split(' ')[0])).toFixed(9));
};

export const ConvertFioToCurrency = (fio: string): Currency => {
    const split = fio.split(' ');
    return {
        iAmount: parseFloat(parseFloat((split[0])).toFixed(9)),
        sAmount: parseFloat((split[0])).toFixed(9)
    };
};

export const GetSymbolFromFio = (fio: string): string => {
    return fio.split(' ')[1];
};

export interface CreateListingPayload {
    account: string;
    name: string;
    authorization: PermissionLevel[];
    data: {
        actor: {};
        fio_domain: string;
        sale_price: number;
        max_fee: number;
        tpid: string;
    };
}

export interface CancelListingPayload {
    account: string;
    name: string;
    authorization: PermissionLevel[];
    data: {
        actor: {};
        sale_id: number;
        fio_domain: string;
        max_fee: number;
        tpid: string;
    };
}

export interface BuyListingPayload {
    account: string;
    name: string;
    authorization: PermissionLevel[];
    data: {
        actor: {};
        sale_id: number;
        fio_domain: string;
        max_buy_price: number;
        max_fee: number;
        tpid: string;
    };
}

export interface Currency {
    sAmount: string;
    iAmount: number;
}

export interface AccountInfo {
    nickname?: string;
    account_name?: string;
    publicKey?: string;
    api?: Api;
    balance?: {
        fio: string;
        sufs: number;
        amt: number;
    };
    domains?: [];
    addresses?: [];
    listings?: Listing[];
}

export interface Listing {
    id: number;
    owner: string;
    domain: string;
    sale_price: number;
    sale_price_fio: string;
    commission_fee: string;
    commission_fee_pct: string;
    date_listed: number;
    status: number;
    status_str: string;
    date_updated: number;
}

export interface FioInfo {
    nickname: string;
    privKey: string;
    pubKey: string;
    actor: string;
}

export interface MarketplaceConfig {
    owner: string;
    commission_fee: string;
    listing_fee: number;
    e_break: number;
}

export const MarketPlaceAccount: FioInfo = {
    nickname: NickNames.marketplace,
    privKey : '5KePj5qMF7xvXZwY4Tnxy7KbDCdUe7cyZtYv2rsTgaZ7LBuVpUc',
    pubKey  : 'FIO77rFFByyLycsrbC5tH1CXqddZdgkDuTYDbCc2BoGp5hdnU59f7',
    actor   : '5ufabtv13hv4',
};

export const HolderAccount: FioInfo = {
    nickname: NickNames.holderAccount,
    privKey : '5KBX1dwHME4VyuUss2sYM25D5ZTDvyYrbEz37UJqwAVAsR4tGuY',
    pubKey  : 'FIO7isxEua78KPVbGzKemH4nj2bWE52gqj8Hkac3tc7jKNvpfWzYS',
    actor   : 'fio.escrow',
};

export const UserOneAccount: FioInfo = {
    nickname: NickNames.userOne,
    privKey : '5J1oyBREGZS4sqRgzofxXP9t7UL2yQgKBZ6MaHF2XzBEfAH3NH4',
    pubKey  : 'FIO5MDWkM3GRdk4WWdxbNPcGyJev56S5X4cgY3KQNH6EbxQXrcS6Q',
    actor   : 'wjeo4abnk4c2',
};

export const UserTwoAccount: FioInfo = {
    nickname: NickNames.userTwo,
    privKey : '5HwawJrUijKnypZfXrVPqBDTx7nmVCFk5qDG9MRxW7tdPp6bGcM',
    pubKey  : 'FIO8PR2TcJAJ1UASYmkmVa8Fi2J2dNvwLJ4qkeAcE3ebgDbPDMx6F',
    actor   : 'g4oc1qkysew2',
};

export const UserThreeAccount: FioInfo = {
    nickname: NickNames.userThree,
    privKey : '5KAt8KnXaqJSngnY6DKvMmdMfZV6uTZkLQ6kaTRWPzJG6wJV4xo',
    pubKey  : 'FIO6Ehu1BXZUGkeQS77LC1LKnFVWh1hdwZ3pYFh77819tgpyarQXW',
    actor   : 'ltllcgohc4op',
};

export const FioInfoAccounts: FioInfo[] =
                 [
                     {
                         nickname: NickNames.marketplace,
                         privKey : '5KePj5qMF7xvXZwY4Tnxy7KbDCdUe7cyZtYv2rsTgaZ7LBuVpUc',
                         pubKey  : 'FIO77rFFByyLycsrbC5tH1CXqddZdgkDuTYDbCc2BoGp5hdnU59f7',
                         actor   : '5ufabtv13hv4',
                     },
                     {
                         nickname: NickNames.holderAccount,
                         privKey : '5Hs6KG9Ky1S194hnxovUUq63CmTvsaCPWcnamPpB4Q5fuZiSzDe',
                         pubKey  : 'FIO6WTy7KBarFzVbhmwDuR1BbV33QVpuEZirvfwsHBUZ1b4aGrJNm',
                         actor   : 'p2yrhsvsvjge',
                     },
                     {
                         nickname: NickNames.userOne,
                         privKey : '5J1oyBREGZS4sqRgzofxXP9t7UL2yQgKBZ6MaHF2XzBEfAH3NH4',
                         pubKey  : 'FIO5MDWkM3GRdk4WWdxbNPcGyJev56S5X4cgY3KQNH6EbxQXrcS6Q',
                         actor   : 'wjeo4abnk4c2',
                     },
                     {
                         nickname: NickNames.userTwo,
                         privKey : '5HwawJrUijKnypZfXrVPqBDTx7nmVCFk5qDG9MRxW7tdPp6bGcM',
                         pubKey  : 'FIO8PR2TcJAJ1UASYmkmVa8Fi2J2dNvwLJ4qkeAcE3ebgDbPDMx6F',
                         actor   : 'g4oc1qkysew2',
                     },
                     {
                         nickname: NickNames.userThree,
                         privKey : '5KAt8KnXaqJSngnY6DKvMmdMfZV6uTZkLQ6kaTRWPzJG6wJV4xo',
                         pubKey  : 'FIO6Ehu1BXZUGkeQS77LC1LKnFVWh1hdwZ3pYFh77819tgpyarQXW',
                         actor   : 'ltllcgohc4op',
                     },
                 ];

export const stringToHash = (term: string) => {
    const hash = createHash('sha1');
    return '0x' + hash.update(term).digest().slice(0, 16).reverse().toString('hex');
};
