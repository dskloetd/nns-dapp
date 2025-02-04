import { loadSnsSwapCommitmentsProxy } from "$lib/proxy/sns.services.proxy";
import { loadMainTransactionFee } from "$lib/services/transaction-fees.services";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";

export const initAppPrivateData = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [
    syncAccounts(),
    listNeurons(),
    loadMainTransactionFee(),
  ];

  const initSns: Promise<void>[] = [loadSnsSwapCommitmentsProxy()];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
