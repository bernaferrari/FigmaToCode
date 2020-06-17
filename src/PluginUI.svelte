<script>
  import { fade, fly } from "svelte/transition";

  import { Tabs, Tab, TabList, TabPanel } from "svelte-tabs";

  import copy from "clipboard-copy";

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let visible = false;

  function updateClipboard(event) {
    copy(event.detail.text);

    visible = true;
    delay(1000).then(() => {
      visible = false;
    });
  }

  import ScreenTailwind from "./ScreenTailwind.svelte";
  import ScreenFlutter from "./ScreenFlutter.svelte";
</script>

<style lang="postcss">
  @import "tailwindcss/base";
  @import "tailwindcss/components";
  @import "tailwindcss/utilities";
</style>

<Tabs>

  <TabList>
    <Tab>Tailwind</Tab>
    <Tab>Flutter</Tab>
  </TabList>

  <TabPanel>
    <ScreenTailwind on:clipboard={updateClipboard} />
  </TabPanel>

  <TabPanel>
    <ScreenFlutter on:clipboard={updateClipboard} />
  </TabPanel>

</Tabs>

<div class="p-2">
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
