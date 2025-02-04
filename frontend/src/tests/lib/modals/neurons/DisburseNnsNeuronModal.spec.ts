/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
import { disburse } from "$lib/services/neurons.services";
import { accountsStore } from "$lib/stores/accounts.store";
import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("$lib/services/neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
  };
});

describe("DisburseNnsNeuronModal", () => {
  const renderDisburseModal = async (
    neuron: NeuronInfo
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: DisburseNnsNeuronModal,
      props: { neuron },
    });
  };

  beforeAll(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
  });

  it("should display modal", async () => {
    const { container } = await renderDisburseModal(mockNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render accounts", async () => {
    const { queryAllByTestId } = await renderDisburseModal(mockNeuron);

    const accountCards = queryAllByTestId("account-card");
    expect(accountCards.length).toBe(2);
  });

  it("should be able to select an account", async () => {
    const { queryAllByTestId, queryByTestId } = await renderDisburseModal(
      mockNeuron
    );

    const accountCards = queryAllByTestId("account-card");
    expect(accountCards.length).toBe(2);

    const firstAccount = accountCards[0];
    await fireEvent.click(firstAccount);

    const confirmScreen = queryByTestId("confirm-disburse-screen");
    expect(confirmScreen).not.toBeNull();
  });

  it("should be able to add address in input", async () => {
    const { container, queryByTestId } = await renderDisburseModal(mockNeuron);

    const addressInput = container.querySelector("input[type='text']");
    expect(addressInput).not.toBeNull();
    const continueButton = queryByTestId("address-submit-button");
    expect(continueButton).not.toBeNull();
    expect(continueButton?.getAttribute("disabled")).not.toBeNull();

    const address = mockMainAccount.identifier;
    addressInput &&
      (await fireEvent.input(addressInput, { target: { value: address } }));
    expect(continueButton?.getAttribute("disabled")).toBeNull();

    continueButton && (await fireEvent.click(continueButton));

    const confirmScreen = queryByTestId("confirm-disburse-screen");
    expect(confirmScreen).not.toBeNull();
  });

  it("should call disburse service", async () => {
    const { container, queryByTestId } = await renderDisburseModal(mockNeuron);

    const addressInput = container.querySelector("input[type='text']");
    expect(addressInput).not.toBeNull();
    const continueButton = queryByTestId("address-submit-button");
    expect(continueButton).not.toBeNull();
    expect(continueButton?.getAttribute("disabled")).not.toBeNull();

    const address = mockMainAccount.identifier;
    addressInput &&
      (await fireEvent.input(addressInput, { target: { value: address } }));
    expect(continueButton?.getAttribute("disabled")).toBeNull();

    continueButton && (await fireEvent.click(continueButton));

    const confirmScreen = queryByTestId("confirm-disburse-screen");
    expect(confirmScreen).not.toBeNull();

    const confirmButton = queryByTestId("disburse-neuron-button");
    expect(confirmButton).not.toBeNull();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(disburse).toBeCalled();
    await waitFor(() => {
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Neurons);
    });
  });
});
