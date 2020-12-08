<script>
  import { getContext, onMount, tick } from "svelte";

  import getId from "./id";
  import { TABS } from "./Tabs.svelte";

  let tabEl;

  const tab = {
    id: getId()
  };
  const {
    registerTab,
    registerTabElement,
    selectTab,
    selectedTab,
    controls
  } = getContext(TABS);

  let isSelected;
  $: isSelected = $selectedTab === tab;

  registerTab(tab);

  onMount(async () => {
    await tick();
    registerTabElement(tabEl);
  });
</script>

<style>
  .svelte-tabs__tab {
    /* border: none; */
    /* border-bottom: 2px solid transparent; */
    /* color: #000000; */
    cursor: pointer;
    list-style: none;
    /* display: inline-block; */
    /* padding: 0.5em 0.75em; */
  }

  /* .svelte-tabs__tab:hover {
    outline: thin dotted;
  } */
  /* 
  .svelte-tabs__selected {
    border-bottom: 2px solid #4f81e5;
    color: #4f81e5;
  }

  .svelte-tabs__selected:hover {
    border-bottom: 2px solid #4f81e5;
    color: #4f81e5;
  } */
</style>

<button
  bind:this={tabEl}
  role="tab"
  id={tab.id}
  aria-controls={$controls[tab.id]}
  aria-selected={isSelected}
  tabindex={isSelected ? 0 : -1}
  class:svelte-tabs__selected={isSelected}
  class="svelte-tabs__tab mr-1 py-2 px-3 {isSelected ? '-mb-px bg-gray-50 inline-block border-l border-t border-r rounded-t text-gray-700 font-semibold' : ' bg-white inline-block text-gray-500 hover:text-gray-800 font-semibold'}"
  on:click={() => selectTab(tab)}>
  <slot />
</button>
