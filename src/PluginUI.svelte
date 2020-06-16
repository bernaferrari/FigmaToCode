<script>
  import { fade, fly } from "svelte/transition";
  import copy from "clipboard-copy";

  import { Tabs, Tab, TabList, TabPanel } from "svelte-tabs";

  let visible = false;

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function updateClipboard(event) {
    copy(event.detail.text);

    visible = true;
    delay(1000).then(() => {
      visible = false;
    });
  }

  import ScreenTailwind from "./ScreenTailwind.svelte";
  import ScreenFlutter from "./ScreenTailwind.svelte";
</script>

<style lang="postcss">
  @import "tailwindcss/base";
  @import "tailwindcss/components";
  @import "tailwindcss/utilities";
</style>

<Tabs>

  <TabList>
    <Tab>Flutter</Tab>
    <Tab>Tailwind</Tab>
  </TabList>

  <TabPanel>
    <ScreenFlutter on:clipboard={updateClipboard} />
  </TabPanel>

  <TabPanel>
    <ScreenTailwind on:clipboard={updateClipboard} />
  </TabPanel>

</Tabs>

<div class="p-2">
  <!-- <div class="fixed top-0 left-0 w-full bg-gray-300">
    <button
      class="p-2 {selection === 'tailwind' ? 'font-bold' : ''}"
      on:click={changeSelection('tailwind')}>
      Tailwind
    </button>
    <button
      class="p-2 {selection === 'flutter' ? 'font-bold' : ''}"
      on:click={changeSelection('flutter')}>
      Flutter
    </button>
  </div> -->

  {#if visible}
    <div class="fixed bottom-0 left-0 w-full px-2 mb-2">
      <div
        class="h-8 w-full flex items-center justify-center bg-green-600
        rounded-lg"
        in:fly={{ y: 20, duration: 800 }}
        out:fade>
        <p class="text-white">Copied!</p>
      </div>
    </div>
  {/if}

</div>
