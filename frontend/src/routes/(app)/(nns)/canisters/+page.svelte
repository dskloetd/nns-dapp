<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignInCanisters from "$lib/pages/SignInCanisters.svelte";
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import RouteModule from "$lib/components/common/RouteModule.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));

  onMount(() => layoutTitleStore.set($i18n.navigation.canisters));
</script>

{#if signedIn}
  <RouteModule path={AppPath.Canisters} params={{ referrerPath }} />
{:else}
  <SignInCanisters />
{/if}
