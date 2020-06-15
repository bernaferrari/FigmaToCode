<script>
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";

  //import some Svelte Figma UI components
  import { Button, Input, Label, SelectMenu } from "figma-plugin-ds-svelte";

  import { fade, fly } from "svelte/transition";

  import ItemColor from "./ItemColor.svelte";
  import ItemText from "./ItemText.svelte";

  import Prism from "svelte-prism";
  import "prism-theme-night-owl";

  import copy from "clipboard-copy";

  import { tweened } from "svelte/motion";

  let visible = false;

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function updateClipboard(text) {
    copy(text);

    visible = true;
    delay(1000).then(() => {
      visible = false;
    });
  }

  let colorData = [];
  let textData = [];
  let codeData = "";
  let emptySelection = false;

  $: colorObservable = colorData;
  $: textObservable = textData;
  $: codeObservable = codeData;
  $: emptyObservable = emptySelection;

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

    if (emptySelection !== (event.data.pluginMessage.type === "empty")) {
      emptySelection = event.data.pluginMessage.type === "empty";
    }

    if (event.data.pluginMessage.type === "colors") {
      colorData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "text") {
      textData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "result") {
      codeData = event.data.pluginMessage.data;
    }
  };

  import Switch from "./Switch.svelte";

  let jsx = false;
  $: if (jsx) {
    parent.postMessage({ pluginMessage: { type: "jsx-true" } }, "*");
  }
  $: if (!jsx) {
    parent.postMessage({ pluginMessage: { type: "jsx-false" } }, "*");
  }
</script>

<style lang="postcss">
  @import "tailwindcss/base";
  @import "tailwindcss/components";
  @import "tailwindcss/utilities";
</style>

<div class="p-2">

  {#if emptySelection}
    <div
      class="flex flex-col space-y-2 m-auto items-center justify-center p-4
      border-2 rounded-lg">
      <p class="text-lg font-bold">Nothing is selected</p>
      <p class="text-xs">Try selecting any layer</p>
    </div>
  {:else}
    <div class="border-2 rounded-lg w-full pt-2">
      <div class="flex items-center px-2 space-x-2 justify-between">
        <p
          class="text-lg font-medium text-center bg-gray-300 py-2 px-4
          rounded-lg">
          Code
        </p>
        <button
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold
          hover:text-white py-2 px-4 border border-blue-500
          hover:border-transparent rounded"
          on:click={updateClipboard(codeObservable)}>
          Copy to Clipboard
        </button>
      </div>

      <Prism language="html" source={codeObservable} />

      <div
        class="flex justify-end space-x-2 content-center items-center mb-2 mx-2">

        <Switch bind:checked={jsx} id="jsx" text="JSX" />

      </div>
    </div>
    <div class="h-2" />

    {#if colorObservable.length > 0}
      <div
        class="flex flex-col space-y-2 items-center w-full p-2 border-2
        rounded-lg">
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
              <ItemColor {...item} on:submit={updateClipboard(item.hex)} />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="h-2" />

    {#if textObservable.length > 0}
      <div
        class="flex flex-col space-y-2 items-center w-full p-2 border-2
        rounded-lg">
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
              <ItemText {...item} on:submit={updateClipboard(item.full)} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

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
