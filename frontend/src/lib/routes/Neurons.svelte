<script lang="ts">
  import NnsNeurons from "$lib/pages/NnsNeurons.svelte";
  import SnsNeurons from "$lib/pages/SnsNeurons.svelte";
  import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
  import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
</script>

<main>
  <SummaryUniverse />

  {#if $isNnsProjectStore}
    <NnsNeurons />
  {:else if $snsProjectIdSelectedStore !== undefined}
    <SnsNeurons />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsNeuronsFooter />
  <!-- Staking SNS Neurons has not yet been reviewed by security -->
{:else if $snsProjectIdSelectedStore !== undefined}
  <SnsNeuronsFooter />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
