/**
 * @jest-environment jsdom
 */
import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/ledger.api";
import { getLedgerIdentityProxy } from "$lib/proxy/ledger.services.proxy";
import {
  addSubAccount,
  getAccountIdentity,
  getAccountIdentityByPrincipal,
  getAccountTransactions,
  renameSubAccount,
  syncAccounts,
  transferICP,
} from "$lib/services/accounts.services";
import { accountsStore } from "$lib/stores/accounts.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
import type { NewTransaction } from "$lib/types/transaction";
import { get } from "svelte/store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import { mockSentToSubAccountTransaction } from "../../mocks/transaction.mock";

jest.mock("$lib/proxy/ledger.services.proxy", () => {
  return {
    getLedgerIdentityProxy: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockIdentity)),
  };
});

describe("accounts-services", () => {
  describe("services", () => {
    const mockAccounts = { main: mockMainAccount, subAccounts: [] };

    const spyLoadAccounts = jest
      .spyOn(accountsApi, "loadAccounts")
      .mockImplementation(() => Promise.resolve(mockAccounts));

    const spyCreateSubAccount = jest
      .spyOn(accountsApi, "createSubAccount")
      .mockImplementation(() => Promise.resolve());

    const spySendICP = jest
      .spyOn(ledgerApi, "sendICP")
      .mockImplementation(() => Promise.resolve(BigInt(0)));

    beforeAll(() => jest.spyOn(console, "error").mockImplementation(jest.fn));

    afterAll(() => jest.clearAllMocks());

    it("should sync accounts", async () => {
      await syncAccounts();

      expect(spyLoadAccounts).toHaveBeenCalled();

      const accounts = get(accountsStore);
      expect(accounts).toEqual(mockAccounts);
    });

    it("should add a subaccount", async () => {
      await addSubAccount({ name: "test subaccount" });

      expect(spyCreateSubAccount).toHaveBeenCalled();
    });

    it("should not sync accounts if no identity", async () => {
      setNoIdentity();

      const call = async () => await syncAccounts();

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });

    it("should not add subaccount if no identity", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      setNoIdentity();

      await addSubAccount({ name: "test subaccount" });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__account.create_subaccount",
        err: new Error(en.error.missing_identity),
      });

      resetIdentity();
    });

    const transferICPParams: NewTransaction = {
      sourceAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
      amount: 1,
    };

    it("should transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(spySendICP).toHaveBeenCalled();
    });

    it("should sync accounts after transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(spyLoadAccounts).toHaveBeenCalled();
    });
  });

  describe("rename", () => {
    const mockAccounts = { main: mockMainAccount, subAccounts: [] };

    const spyLoadAccounts = jest
      .spyOn(accountsApi, "loadAccounts")
      .mockImplementation(() => Promise.resolve(mockAccounts));

    const spyRenameSubAccount = jest
      .spyOn(accountsApi, "renameSubAccount")
      .mockImplementation(() => Promise.resolve());

    beforeAll(() => jest.spyOn(console, "error").mockImplementation(jest.fn));

    afterAll(() => jest.clearAllMocks());

    it("should rename a subaccount", async () => {
      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(spyRenameSubAccount).toHaveBeenCalled();
    });

    it("should sync accounts after rename", async () => {
      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(spyLoadAccounts).toHaveBeenCalled();
    });

    it("should not rename subaccount if no identity", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      setNoIdentity();

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount",
        err: new Error(en.error.missing_identity),
      });

      resetIdentity();

      spyToastError.mockClear();
    });

    it("should not rename subaccount if no selected account", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: undefined,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount_no_account",
      });

      spyToastError.mockClear();
    });

    it("should not rename subaccount if type is not subaccount", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockMainAccount,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount_type",
      });

      spyToastError.mockClear();
    });
  });

  describe("getAccountTransactions", () => {
    const onLoad = jest.fn();
    const mockResponse = [mockSentToSubAccountTransaction];
    let spyGetTransactions;

    beforeEach(() => {
      jest.clearAllMocks();
      spyGetTransactions = jest
        .spyOn(accountsApi, "getTransactions")
        .mockImplementation(() => Promise.resolve(mockResponse));
    });

    it("should call getTransactions", async () => {
      await getAccountTransactions({
        accountIdentifier: "",
        onLoad,
      });
      expect(spyGetTransactions).toBeCalled();
      expect(spyGetTransactions).toBeCalledTimes(2);
    });

    it("should call onLoad", async () => {
      await getAccountTransactions({
        accountIdentifier: "",
        onLoad,
      });
      expect(onLoad).toBeCalled();
      expect(onLoad).toBeCalledTimes(2);
      expect(onLoad).toBeCalledWith({
        accountIdentifier: "",
        transactions: mockResponse,
      });
    });

    describe("getAccountTransactions errors", () => {
      beforeEach(() => {
        spyGetTransactions = jest
          .spyOn(accountsApi, "getTransactions")
          .mockImplementation(async () => {
            throw new Error("test");
          });
      });

      it("should display toast error", async () => {
        const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

        await getAccountTransactions({
          accountIdentifier: "",
          onLoad,
        });

        expect(spyToastError).toBeCalledTimes(1);
        expect(spyToastError).toBeCalledWith({
          labelKey: "error.transactions_not_found",
          err: new Error("test"),
        });
        expect(onLoad).not.toBeCalled();
      });
    });
  });

  describe("getAccountIdentity", () => {
    it("returns user identity if main account", async () => {
      accountsStore.set({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      accountsStore.reset();
    });

    it("returns user identity if main account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      accountsStore.reset();
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockHardwareWalletAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
      accountsStore.reset();
    });
  });

  describe("getAccountIdentityByPrincipal", () => {
    it("returns user identity if main account", async () => {
      accountsStore.set({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockMainAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
      accountsStore.reset();
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockHardwareWalletAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
      accountsStore.reset();
    });

    it("returns null if no main account nor hardware wallet account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        "gje2w-p7x7x-yuy72-bllam-x2itq-znokr-jnvf6-5dzn4-45jiy-5wvbo-uqe"
      );
      expect(expectedIdentity).toBeUndefined();
      accountsStore.reset();
    });
  });
});
