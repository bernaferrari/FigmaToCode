<script>
  import ItemColor from "./FlutterItemColor.svelte";
  import ItemText from "./TailwindItemText.svelte";

  import Prism from "svelte-prism";
  import "prism-theme-night-owl";
  import "prismjs/components/prism-dart";

  let colorData = [];
  let codeData = "";
  let emptySelection = false;

  $: colorObservable = colorData;
  $: codeObservable = codeData;
  $: emptyObservable = emptySelection;

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
      // textData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "result") {
      codeData = event.data.pluginMessage.data;
    }
  };

  import Switch from "./Switch.svelte";

  let material = false;
  $: if (material) {
    parent.postMessage({ pluginMessage: { type: "material-true" } }, "*");
  }
  $: if (!material) {
    parent.postMessage({ pluginMessage: { type: "material-false" } }, "*");
  }

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const clipboard = data => dispatch("clipboard", { text: data });

  // INIT
  import { onMount } from "svelte";
  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "flutter" } }, "*");
  });
</script>

<div class="px-2">

  {#if emptySelection}
    <div
      class="flex flex-col space-y-2 m-auto items-center justify-center p-4
      border-2 rounded-lg">
      <p class="text-lg font-bold">Nothing is selected</p>
      <p class="text-xs">Try selecting a layer, any layer</p>
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
          on:click={clipboard(codeObservable)}>
          Copy to Clipboard
        </button>
      </div>

      <Prism language="dart" source={codeObservable} />

      <div
        class="flex justify-end space-x-8 content-center items-center mb-2 mx-2">

        <Switch bind:checked={material} id="material" text="Material" />

      </div>
    </div>
    <div class="h-2" />

    {#if colorObservable.length > 0}
      <div
        class="flex flex-col space-y-2 items-center w-full p-2 border-2
        rounded-lg">
        <div class="flex flex-wrap w-full">
          <div class="p-1 w-1/2">
            <div
              class="flex w-full h-full items-center justify-center bg-gray-300
              rounded-lg">
              <p class="text-xl font-semibold">Colors</p>
            </div>
          </div>

          {#each colorObservable as item}
            <div class="w-1/2 p-1">
              <ItemColor
                {...item}
                on:clipboard={clipboard(`Colors(0xff${item.hex})`)} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

</div>
