<script>
  import ItemColor from "./TailwindItemColor.svelte";
  import ItemText from "./TailwindItemText.svelte";

  import Prism from "svelte-prism";
  import "prism-theme-night-owl";

  let colorData = [];
  let textData = [];
  let codeData = "";
  let emptySelection = false;

  $: colorObservable = colorData;
  $: textObservable = textData;
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
      textData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "result") {
      codeData = event.data.pluginMessage.data;
    }
  };

  import Switch from "./Switch.svelte";

  let jsx = false;
  $: if (jsx || !jsx) {
    parent.postMessage({ pluginMessage: { type: "jsx", data: jsx } }, "*");
  }

  let layerName = false;
  $: if (layerName || !layerName) {
    parent.postMessage(
      { pluginMessage: { type: "layerName", data: layerName } },
      "*"
    );
  }

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const clipboard = data => dispatch("clipboard", { text: data });

  // INIT
  import { onMount } from "svelte";
  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "html" } }, "*");
  });

  const sectionStyle = "border rounded-lg bg-white";
</script>

<div>
  <div class="flex flex-col items-center p-4 bg-gray-50">

    <div class="flex">
      <svg class="h-16 w-1/4 m-auto" viewBox="0 0 256 361">
        <path
          d="M255.555 70.766l-23.241 260.36-104.47 28.962-104.182-28.922L.445
          70.766h255.11z"
          fill="#E44D26" />
        <path
          d="M128 337.95l84.417-23.403 19.86-222.49H128V337.95z"
          fill="#F16529" />
        <path
          d="M82.82 155.932H128v-31.937H47.917l.764 8.568 7.85
          88.01H128v-31.937H85.739l-2.919-32.704zM90.018 236.542h-32.06l4.474
          50.146 65.421 18.16.147-.04V271.58l-.14.037-35.568-9.604-2.274-25.471z"
          fill="#EBEBEB" />
        <path
          d="M24.18
          0h16.23v16.035h14.847V0h16.231v48.558h-16.23v-16.26H40.411v16.26h-16.23V0zM92.83
          16.103H78.544V0h44.814v16.103h-14.295v32.455h-16.23V16.103h-.001zM130.47
          0h16.923l10.41 17.062L168.203 0h16.93v48.558h-16.164V24.49l-11.166
          17.265h-.28L146.35 24.49v24.068h-15.88V0zM193.21
          0h16.235v32.508h22.824v16.05h-39.06V0z" />
        <path
          d="M127.89 220.573h39.327l-3.708 41.42-35.62
          9.614v33.226l65.473-18.145.48-5.396
          7.506-84.08.779-8.576H127.89v31.937zM127.89
          155.854v.078h77.143l.64-7.178 1.456-16.191.763-8.568H127.89v31.86z"
          fill="#FFF" />
      </svg>
      <p class="w-3/4 mx-2 leading-tight tracking-tight text-sm">
        HTML is the most basic building block of the Web. It defines the
        <a
          class="font-medium text-red-500 hover:text-red-800"
          href="https://developer.mozilla.org/en-US/docs/Web/HTML"
          target="_blank">
          meaning and structure
        </a>
        of web content. You can test your creations by pasting them here:
      </p>
    </div>
    <div class="flex space-x-4 mt-2">
      <a href="https://codepen.io/bernardoferrari/pen/zYKBpdN" target="_blank">
        <button
          class="px-4 py-2 font-semibold text-gray-800 bg-white border
          border-gray-400 rounded shadow hover:bg-gray-50">
          CodePen
        </button>
      </a>
    </div>
  </div>
</div>

<div class="px-2 pt-2 bg-gray-50">

  {#if emptySelection}
    <div
      class="flex flex-col space-y-2 m-auto items-center justify-center p-4 {sectionStyle}">
      <p class="text-lg font-bold">Nothing is selected</p>
      <p class="text-xs">Try selecting a layer, any layer</p>
    </div>
  {:else}
    <div class="w-full pt-2 {sectionStyle}">
      <div class="flex items-center justify-between px-2 space-x-2">
        <p
          class="px-4 py-2 text-lg font-medium text-center bg-gray-200
          rounded-lg">
          Code
        </p>
        <button
          class="px-4 py-2 font-semibold text-blue-700 bg-transparent border
          border-blue-500 rounded hover:bg-blue-500 hover:text-white
          hover:border-transparent"
          on:click={clipboard(codeObservable)}>
          Copy to Clipboard
        </button>
      </div>

      <Prism language="html" source={codeObservable} />

      <div
        class="flex items-center content-center justify-end mx-2 mb-2 space-x-8">

        <Switch bind:checked={layerName} id="layerName" text="LayerName" />

        <Switch bind:checked={jsx} id="jsx" text="JSX" />

      </div>
    </div>
    <div class="h-2" />

    {#if colorObservable.length > 0}
      <div
        class="flex flex-col space-y-2 items-center w-full p-2 {sectionStyle}">
        <div class="flex flex-wrap w-full">
          <div class="w-1/3 p-1">
            <div
              class="flex items-center justify-center w-full h-full bg-gray-200
              rounded-lg">
              <p class="text-xl font-semibold">Colors</p>
            </div>
          </div>

          {#each colorObservable as item}
            <div class="w-1/3 p-1">
              <ItemColor {...item} on:clipboard={clipboard(item.hex)} />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="h-2" />

    {#if textObservable.length > 0}
      <div
        class="flex flex-col space-y-2 items-center w-full p-2 mb-2 {sectionStyle}">
        <div class="flex flex-wrap w-full">
          <div class="w-1/2 p-1">
            <div
              class="flex items-center justify-center w-full h-full bg-gray-200
              rounded-lg">
              <p class="text-xl font-semibold">Texts</p>
            </div>
          </div>
          {#each textObservable as item}
            <div class="w-1/2 p-1">
              <ItemText {...item} on:clipboard={clipboard(item.full)} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
