<script>
  import { getContext } from "svelte";

  import getId from "./id";
  import { TABS } from "./Tabs.svelte";

  const panel = {
    id: getId()
  };
  const { registerPanel, selectedPanel, labeledBy } = getContext(TABS);

  registerPanel(panel);
</script>

<style>
  /* .svelte-tabs__tab-panel {
    margin-top: 0.5em;
  } */
</style>

<div
  id={panel.id}
  aria-labelledby={$labeledBy[panel.id]}
  class="svelte-tabs__tab-panel"
  role="tabpanel">
  {#if $selectedPanel === panel}
    <slot />
  {/if}
</div>
