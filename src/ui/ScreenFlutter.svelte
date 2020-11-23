<script>
  import ItemColor from "./FlutterItemColor.svelte";

  import Prism from "svelte-prism";
  import "prism-theme-night-owl";
  import "prismjs/components/prism-dart";

  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import { Switch } from "figma-plugin-ds-svelte";

  let colorData = [];
  let codeData = "";
  let emptySelection = false;

  $: colorObservable = colorData;
  $: codeObservable = codeData;
  $: emptyObservable = emptySelection;

  console.log(`Prism ${Prism}`);

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

  // import Switch from "./Switch.svelte";

  let material = false;
  $: if (material) {
    parent.postMessage(
      { pluginMessage: { type: "material", data: true } },
      "*"
    );
  }
  $: if (!material) {
    parent.postMessage(
      { pluginMessage: { type: "material", data: false } },
      "*"
    );
  }

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const clipboard = data => dispatch("clipboard", { text: data });

  // INIT
  import { onMount } from "svelte";
  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "flutter" } }, "*");
  });

  const sectionStyle = "border rounded-lg bg-white";
</script>

<div class="flex flex-col items-center p-4 bg-gray-50">

  <div class="flex">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-1/4 h-8 px-1 m-auto"
      fill="none"
      viewBox="0 0 415 120">
      <path
        fill="#39CEFD"
        d="M46.987 106.148l50.764-50.775H60.839L28.537 87.686l18.45 18.462zM.845
        59.994L60.839 0H97.75L19.306 78.456.845 59.994z" />
      <path
        fill="#03569B"
        d="M60.84 119.987h36.91L65.45 87.686l-18.462 18.461 13.852 13.84z" />
      <path
        fill="url(#paint0_linear)"
        d="M65.449 87.686l-18.462 18.461 27.38-9.485-8.918-8.977z" />
      <path
        fill="#16B9FD"
        d="M28.535 87.68l18.462-18.463L65.46 87.68l-18.463 18.462-18.462-18.462z" />
      <path
        fill="url(#paint1_radial)"
        d="M97.75 55.373L65.448 87.686 97.751 120H60.839L28.526
        87.686l32.313-32.313H97.75zM60.84 0L.845 59.994l18.461 18.462L97.75
        0H60.84z" />
      <g>
        <path
          fill="#696969"
          d="M139.097
          25.175h40.049v7.832h-31.921v23.697h28.818v7.737h-28.818v29.981h-8.128V25.175zm49.74
          0h8.22v69.251h-8.22V25.175zm38.294 70.8c-5.931
          0-10.487-1.742-13.67-5.225-3.074-3.505-4.611-8.373-4.611-14.605V45.1h8.221v29.79c0
          4.679 1.064 8.127 3.192 10.344 2.128 2.217 4.998 3.325 8.608 3.325
          2.774 0 5.237-.741 7.39-2.224 2.216-1.483 3.891-3.416 5.024-5.8
          1.224-2.39 1.836-4.904
          1.836-7.545V45.133h8.217v49.323h-7.832v-7.19h-.388c-1.355 2.45-3.515
          4.513-6.481 6.188-2.965 1.675-6.125 2.513-9.48
          2.513l-.026.007zM282.978 95.202c-2
          0-3.869-.323-5.608-.968-1.675-.645-3.094-1.516-4.256-2.612a11.844
          11.844 0
          01-2.9-4.256c-.646-1.61-.968-3.578-.968-5.9V52.548h-8.609V45.1h8.609V31.171h8.22V45.1h11.993v7.448h-11.993v26.89c0
          2.709.517 4.707 1.552 5.996 1.224 1.418 2.997 2.128 5.32 2.128 1.872 0
          3.677-.548 5.416-1.644v8.028a12.62 12.62 0 01-3
          .968c-.968.197-2.224.296-3.768.296l-.008-.008zM317.841 95.202c-2
          0-3.87-.323-5.609-.968-1.675-.645-3.093-1.516-4.256-2.612a11.857
          11.857 0
          01-2.9-4.256c-.645-1.61-.968-3.578-.968-5.9V52.548H295.5V45.1h8.608V31.171h8.22V45.1h11.993v7.448h-11.993v26.89c0
          2.709.518 4.707 1.552 5.996 1.224 1.418 2.998 2.128 5.32 2.128 1.872 0
          3.678-.548 5.417-1.644v8.028a12.62 12.62 0 01-3
          .968c-.968.197-2.225.296-3.769.296l-.007-.008zM354.047 95.975c-4.679
          0-8.903-1.128-12.672-3.384-3.739-2.257-6.672-5.351-8.8-9.285-2.064-3.998-3.096-8.48-3.096-13.448
          0-4.771.966-9.155 2.9-13.153 2-3.997 4.805-7.19 8.416-9.576 3.611-2.39
          7.802-3.584 12.573-3.584 4.835 0 9.026 1.108 12.572 3.325 3.547 2.128
          6.256 5.094 8.128 8.897 1.934 3.805 2.901 8.157 2.901 13.056 0
          .968-.099 1.806-.296 2.513h-38.978c.197 3.739 1.1 6.899 2.708 9.48
          1.611 2.579 3.643 4.512 6.096 5.8 2.513 1.291 5.124 1.936 7.833 1.936
          6.32 0 11.188-2.965 14.605-8.896l6.964 3.384c-2.128 3.997-5.03
          7.158-8.705 9.48-3.61 2.32-7.995 3.48-13.152
          3.48l.003-.025zm14.217-31.434c-.128-2.064-.707-4.127-1.736-6.188-1.035-2.064-2.679-3.806-4.932-5.224-2.217-1.42-4.988-2.128-8.313-2.128-3.867
          0-7.155 1.256-9.865 3.768-2.643 2.45-4.384 5.707-5.224
          9.768h30.081l-.011.004zm18.229-19.44h7.833v7.932h.388c.968-2.71
          2.837-4.934 5.608-6.673 2.773-1.805 5.675-2.708 8.705-2.708 2.256 0
          4.189.323 5.8.968v8.897c-2.064-1.035-4.385-1.552-6.964-1.552-2.389
          0-4.582.677-6.577 2.032-2 1.355-3.601 3.192-4.803 5.512-1.157
          2.256-1.736 4.72-1.736 7.39V94.46h-8.22V45.137l-.034-.037z" />
      </g>
      <defs>
        <radialGradient
          id="paint1_radial"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(3.567 8.179) scale(146.805)"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#fff" stop-opacity=".1" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <linearGradient
          id="paint0_linear"
          x1="52.375"
          x2="66.125"
          y1="109.71"
          y2="95.96"
          gradientUnits="userSpaceOnUse">
          <stop stop-color="#1A237E" stop-opacity=".4" />
          <stop offset="1" stop-color="#1A237E" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>

    <p class="w-3/4 mx-2 leading-tight tracking-tight text-sm">
      Flutter is Google’s UI toolkit for building applications for
      <a
        class="font-medium text-blue-500 hover:text-blue-800"
        href="https://flutter.dev/"
        target="_blank">
        mobile, web, and desktop from a single codebase.
      </a>
      You can test your creations by pasting them here:
    </p>
  </div>

  <div class="my-1"></div>

  <a href="https://codepen.io/bernardoferrari/pen/pogpBLB" target="_blank">
    <button
      class="px-4 py-2 font-semibold text-gray-800 bg-white border
      border-gray-400 rounded shadow hover:bg-gray-50">
      Flutter on CodePen
    </button>
  </a>

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

      <Prism language="dart" source={codeObservable} />

      <div
        class="flex items-center content-center justify-end mx-2 mb-2 space-x-8">

        <Switch value="value" bind:checked={material} id="material">
          Material
        </Switch>

      </div>
    </div>
    <div class="h-2" />

    {#if colorObservable.length > 0}
      <div
        class="flex flex-col space-y-2 items-center w-full p-2 mb-2 {sectionStyle}">
        <div class="flex flex-wrap w-full">
          <div class="w-1/2 p-1">
            <div
              class="flex items-center justify-center w-full h-full bg-gray-200
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
