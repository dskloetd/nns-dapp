<script lang="ts">
  import type { SnsSummary } from "$lib/types/sns";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";

  export let displayProjects = true;

  let summary: SnsSummary | undefined;
  $: summary = displayProjects ? $snsProjectSelectedStore?.summary : undefined;
</script>

<ProjectLogo {summary} framed />
