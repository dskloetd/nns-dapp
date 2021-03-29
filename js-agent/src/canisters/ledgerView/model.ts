import { Principal } from "@dfinity/agent";

export type AccountIdentifier = string;
export type BlockHeight = bigint;
export type CreateSubAccountResponse =
    { Ok: NamedSubAccount } |
    { AccountNotFound: null } |
    { SubAccountLimitExceeded: null };
export type Doms = bigint;
export type GetAccountResponse =
    { Ok: { subAccounts: Array<NamedSubAccount> } } |
    { AccountNotFound: null };
export interface GetTransactionsRequest {
    accountIdentifier: AccountIdentifier,
    pageSize: number,
    offset: number,
};
export interface GetTransactionsResponse {
    total: number,
    transactions: Array<Transaction>,
};
export interface NamedSubAccount {
    accountIdentifier: AccountIdentifier,
    name: string,
    subAccount: SubAccount,
};
export interface Receive { fee: Doms, from: AccountIdentifier, amount: Doms };
export interface Send { to: AccountIdentifier, fee: Doms, amount: Doms };
export type SubAccount = Array<number>;
export interface Timestamp { secs: bigint, nanos: number };
export interface Transaction {
    timestamp: Timestamp,
    blockHeight: BlockHeight,
    transfer: Transfer,
};
export type Transfer = { Burn: { amount: Doms } } |
    { Mint: { amount: Doms } } |
    { Send: Send } |
    { Receive: Receive };
export default interface ServiceInterface {
    addAccount: () => Promise<undefined>,
    createSubAccount: (name: string) => Promise<CreateSubAccountResponse>,
    getAccount: () => Promise<GetAccountResponse>,
    getTransactions: (request: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
};