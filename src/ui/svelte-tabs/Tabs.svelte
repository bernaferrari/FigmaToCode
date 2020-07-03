<script context="module">
  export const TABS = {};
</script>

<script>
  import { afterUpdate, setContext, onDestroy, onMount, tick } from "svelte";
  import { writable } from "svelte/store";

  export let selectedTabIndex = 0;

  const tabElements = [];
  const tabs = [];
  const panels = [];

  const controls = writable({});
  const labeledBy = writable({});

  const selectedTab = writable(null);
  const selectedPanel = writable(null);

  function removeAndUpdateSelected(arr, item, selectedStore) {
    const index = arr.indexOf(item);
    arr.splice(index, 1);
    selectedStore.update(selected =>
      selected === item ? arr[index] || arr[arr.length - 1] : selected
    );
  }

  function registerItem(arr, item, selectedStore) {
    arr.push(item);
    selectedStore.update(selected => selected || item);
    onDestroy(() => removeAndUpdateSelected(arr, item, selectedStore));
  }

  function selectTab(tab) {
    selectedTabIndex = tabs.indexOf(tab);
    selectedTab.set(tab);
    selectedPanel.set(panels[selectedTabIndex]);
  }

  setContext(TABS, {
    registerTab(tab) {
      registerItem(tabs, tab, selectedTab);
    },

    registerTabElement(tabElement) {
      tabElements.push(tabElement);
    },

    registerPanel(panel) {
      registerItem(panels, panel, selectedPanel);
    },

    selectTab,

    selectedTab,
    selectedPanel,

    controls,
    labeledBy
  });

  onMount(() => {
    selectTab(tabs[selectedTabIndex]);
  });

  afterUpdate(() => {
    for (let i = 0; i < tabs.length; i++) {
      controls.update(controlsData => ({
        ...controlsData,
        [tabs[i].id]: panels[i].id
      }));
      labeledBy.update(labeledByData => ({
        ...labeledByData,
        [panels[i].id]: tabs[i].id
      }));
    }
  });

  $: selectedTabIndex,
    () => {
      selectedTab.set(tabs[selectedTabIndex]);
      selectedPanel.set(panels[selectedTabIndex]);
    };

  async function handleKeyDown(event) {
    if (event.target.classList.contains("svelte-tabs__tab")) {
      let selectedIndex = tabs.indexOf($selectedTab);

      switch (event.key) {
        case "ArrowRight":
          selectedIndex += 1;
          if (selectedIndex > tabs.length - 1) {
            selectedIndex = 0;
          }
          selectTab(tabs[selectedIndex]);
          tabElements[selectedIndex].focus();
          break;

        case "ArrowLeft":
          selectedIndex -= 1;
          if (selectedIndex < 0) {
            selectedIndex = tabs.length - 1;
          }
          selectTab(tabs[selectedIndex]);
          tabElements[selectedIndex].focus();
      }
    }
  }
</script>

<div class="svelte-tabs" on:keydown={handleKeyDown}>
  <slot />
</div>
