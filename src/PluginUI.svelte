<script>
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";

  //import some Svelte Figma UI components
  import { Button, Input, Label, SelectMenu } from "figma-plugin-ds-svelte";

  import ItemColor from "./ItemColor.svelte";
  import ItemText from "./ItemText.svelte";

  import Prism from "svelte-prism";
  import "prism-theme-night-owl";

  import copy from "clipboard-copy";

  function updateClipboard(text) {
    copy(text);
  }

  function cancel() {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  }

  let colorData = [];
  let textData = [];
  let codeData = "";

  $: colorObservable = colorData;
  $: textObservable = textData;
  $: codeObservable = codeData;

  if (false) {
    // DEBUG
    colorData = [
      { name: "orange-400", hex: "#f2994a" },
      { name: "red-500", hex: "#eb5757" },
      { name: "gray-700", hex: "#595959" },
      { name: "black", hex: "#000000" },
      { name: "white", hex: "#ffffff" },
      { name: "green-700", hex: "#219653" }
    ];

    textData = [
      { name: "Header", attr: "font-xs bold a" },
      { name: "Lorem ipsum dolores", attr: "text-sm wide ahja ahja aaa" },
      { name: "Figma to Code", attr: "aa asa dad asdad" },
      {
        name: "Layout",
        attr:
          "asd asda sdsd asda sdbhjas dhasjj asidasuidhausdh asudh asuhud ahs dasas"
      }
    ];

    codeData = `<div class="inline-flex space-x-1 items-center justify-center p-1 border-gray-700 border-2 rounded-lg">
<div class="flex items-center justify-center p-1 h-4 bg-white rounded-lg"><p class="h-4 w-4 text-xs font-bold text-center text-gray-700">Aa</p></div>
<div class="inline-flex flex-col items-center justify-center p-1 self-start w-16"><p class="self-start text-xs font-medium text-black">Header</p><p class="self-start text-xs text-black">font-xs bold arhhh</p></div></div>
`;
  }

  onmessage = event => {
    console.log("got this from the plugin code", event.data);
    if (!event.data.pluginMessage) {
      return;
    }
    if (event.data.pluginMessage.type === "colors") {
      colorData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "text") {
      textData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "result") {
      codeData = event.data.pluginMessage.data;
    }
  };

  function fetchText() {
    parent.postMessage({ pluginMessage: { type: "text" } }, "*");
  }
</script>

<style lang="postcss">
  @import "tailwindcss/base";
  @import "tailwindcss/components";
  @import "tailwindcss/utilities";
</style>

<div class="p-2">
  <!-- <SelectMenu bind:menuItems bind:value={selectedShape} class="mb-xxsmall" /> -->

  <!-- <Label>Count</Label>
  <Input iconText="#" bind:value={count} class="mb-xxsmall" />

  <div class="flex p-xxsmall mb-xsmall">
    <Button on:click={cancel} variant="secondary" class="mr-xsmall">
      Cancel
    </Button>
    <Button on:click={fetchColors}>Color</Button>
    <Button on:click={createShapes}>Run</Button>
  </div> -->

  <div class="border-2 rounded-lg w-full pt-2">
    <p class="text-lg font-medium text-center">Code</p>
    <Prism language="html" source={codeObservable} />

    <div class="flex justify-center content-center mb-2">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-2
        px-4 border border-blue-700 rounded"
        on:click={updateClipboard(codeObservable)}>
        Copy to Clipboard
      </button>
    </div>
  </div>
  <div class="h-2" />
  <!-- <div class="flex space-x-2 w-full p-2 border-2 rounded-lg"> -->
  <!-- <div class="flex flex-col space-y-2 items-center w-1/2">
      <p class="text-lg font-medium">Color</p>
      {#each colorObservable as item}
        <ItemColor {...item} />
      {/each}
    </div>

    <div class="flex flex-col space-y-2 items-center w-1/2">
      <p class="text-lg font-medium">Text</p>
      {#each textObservable as item}
        <ItemText {...item} />
      {/each}
    </div>
  </div> -->

  {#if colorObservable.length > 0}
    <div
      class="flex flex-col space-y-2 items-center w-full p-2 border-2 rounded-lg">
      <div class="flex flex-wrap w-full">
        <div class="p-1 w-1/3">
          <div
            class="flex w-full h-full items-center justify-center bg-gray-300
            rounded-lg">
            <p class="text-xl font-semibold">Colors</p>
          </div>
        </div>

        {#each colorObservable as item}
          <div class="w-1/3 p-1">
            <ItemColor {...item} />
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="h-2" />

  {#if textObservable.length > 0}
    <div
      class="flex flex-col space-y-2 items-center w-full p-2 border-2 rounded-lg">
      <div class="flex flex-wrap w-full">
        <div class="p-1 w-1/2">
          <div
            class="flex w-full h-full items-center justify-center bg-gray-300
            rounded-lg">
            <p class="text-xl font-semibold">Texts</p>
          </div>
        </div>
        {#each textObservable as item}
          <div class="w-1/2 p-1">
            <ItemText {...item} />
          </div>
        {/each}
      </div>
    </div>
  {/if}

</div>
