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

    codeData = `<div class="inline-flex items-center justify-center p-1 space-x-1 border-2 border-gray-700 rounded-lg">
<div class="flex items-center justify-center h-4 p-1 bg-white rounded-lg"><p class="w-4 h-4 text-xs font-bold text-center text-gray-700">Aa</p></div>
<div class="inline-flex flex-col items-center self-start justify-center w-16 p-1"><p class="self-start text-xs font-medium text-black">Header</p><p class="self-start text-xs text-black">font-xs bold arhhh</p></div></div>
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
    parent.postMessage({ pluginMessage: { type: "tailwind" } }, "*");
  });

  const sectionStyle = "border rounded-lg bg-white";
</script>

<div>
  <div class="flex flex-col items-center p-4 bg-gray-50">

    <div class="flex">
      <svg
        class="w-1/4 h-8 m-auto"
        viewBox="0 0 273 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <title>Tailwind CSS</title>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M32 16C24.8 16 20.3 19.6 18.5 26.8C21.2 23.2 24.35 21.85 27.95
          22.75C30.004 23.2635 31.4721 24.7536 33.0971 26.4031C35.7443 29.0901
          38.8081 32.2 45.5 32.2C52.7 32.2 57.2 28.6 59 21.4C56.3 25 53.15 26.35
          49.55 25.45C47.496 24.9365 46.0279 23.4464 44.4029 21.7969C41.7557
          19.1099 38.6919 16 32 16ZM18.5 32.2C11.3 32.2 6.8 35.8 5 43C7.7 39.4
          10.85 38.05 14.45 38.95C16.504 39.4635 17.9721 40.9536 19.5971
          42.6031C22.2443 45.2901 25.3081 48.4 32 48.4C39.2 48.4 43.7 44.8 45.5
          37.6C42.8 41.2 39.65 42.55 36.05 41.65C33.996 41.1365 32.5279 39.6464
          30.9029 37.9969C28.2557 35.3099 25.1919 32.2 18.5 32.2Z"
          fill="url(#paint0_linear)" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M85.996 29.652H81.284V38.772C81.284 41.204 82.88 41.166 85.996
          41.014V44.7C79.688 45.46 77.18 43.712 77.18
          38.772V29.652H73.684V25.7H77.18V20.596L81.284
          19.38V25.7H85.996V29.652ZM103.958
          25.7H108.062V44.7H103.958V41.964C102.514 43.978 100.272 45.194 97.308
          45.194C92.14 45.194 87.846 40.824 87.846 35.2C87.846 29.538 92.14
          25.206 97.308 25.206C100.272 25.206 102.514 26.422 103.958
          28.398V25.7ZM97.954 41.28C101.374 41.28 103.958 38.734 103.958
          35.2C103.958 31.666 101.374 29.12 97.954 29.12C94.534 29.12 91.95
          31.666 91.95 35.2C91.95 38.734 94.534 41.28 97.954 41.28ZM114.902
          22.85C113.458 22.85 112.28 21.634 112.28 20.228C112.28 18.784 113.458
          17.606 114.902 17.606C116.346 17.606 117.524 18.784 117.524
          20.228C117.524 21.634 116.346 22.85 114.902 22.85ZM112.85
          44.7V25.7H116.954V44.7H112.85ZM121.704
          44.7V16.96H125.808V44.7H121.704ZM152.446 25.7H156.778L150.812
          44.7H146.784L142.832 31.894L138.842 44.7H134.814L128.848
          25.7H133.18L136.866 38.81L140.856 25.7H144.77L148.722 38.81L152.446
          25.7ZM161.87 22.85C160.426 22.85 159.248 21.634 159.248 20.228C159.248
          18.784 160.426 17.606 161.87 17.606C163.314 17.606 164.492 18.784
          164.492 20.228C164.492 21.634 163.314 22.85 161.87 22.85ZM159.818
          44.7V25.7H163.922V44.7H159.818ZM178.666 25.206C182.922 25.206 185.962
          28.094 185.962 33.034V44.7H181.858V33.452C181.858 30.564 180.186
          29.044 177.602 29.044C174.904 29.044 172.776 30.64 172.776
          34.516V44.7H168.672V25.7H172.776V28.132C174.03 26.156 176.082 25.206
          178.666 25.206ZM205.418 18.1H209.522V44.7H205.418V41.964C203.974
          43.978 201.732 45.194 198.768 45.194C193.6 45.194 189.306 40.824
          189.306 35.2C189.306 29.538 193.6 25.206 198.768 25.206C201.732 25.206
          203.974 26.422 205.418 28.398V18.1ZM199.414 41.28C202.834 41.28
          205.418 38.734 205.418 35.2C205.418 31.666 202.834 29.12 199.414
          29.12C195.994 29.12 193.41 31.666 193.41 35.2C193.41 38.734 195.994
          41.28 199.414 41.28ZM223.278 45.194C217.54 45.194 213.246 40.824
          213.246 35.2C213.246 29.538 217.54 25.206 223.278 25.206C227.002
          25.206 230.232 27.144 231.752 30.108L228.218 32.16C227.382 30.374
          225.52 29.234 223.24 29.234C219.896 29.234 217.35 31.78 217.35
          35.2C217.35 38.62 219.896 41.166 223.24 41.166C225.52 41.166 227.382
          39.988 228.294 38.24L231.828 40.254C230.232 43.256 227.002 45.194
          223.278 45.194ZM238.592 30.944C238.592 34.402 248.814 32.312 248.814
          39.342C248.814 43.142 245.508 45.194 241.404 45.194C237.604 45.194
          234.868 43.484 233.652 40.748L237.186 38.696C237.794 40.406 239.314
          41.432 241.404 41.432C243.228 41.432 244.634 40.824 244.634
          39.304C244.634 35.922 234.412 37.822 234.412 31.02C234.412 27.448
          237.49 25.206 241.366 25.206C244.482 25.206 247.066 26.65 248.396
          29.158L244.938 31.096C244.254 29.614 242.924 28.93 241.366
          28.93C239.884 28.93 238.592 29.576 238.592 30.944ZM256.11
          30.944C256.11 34.402 266.332 32.312 266.332 39.342C266.332 43.142
          263.026 45.194 258.922 45.194C255.122 45.194 252.386 43.484 251.17
          40.748L254.704 38.696C255.312 40.406 256.832 41.432 258.922
          41.432C260.746 41.432 262.152 40.824 262.152 39.304C262.152 35.922
          251.93 37.822 251.93 31.02C251.93 27.448 255.008 25.206 258.884
          25.206C262 25.206 264.584 26.65 265.914 29.158L262.456 31.096C261.772
          29.614 260.442 28.93 258.884 28.93C257.402 28.93 256.11 29.576 256.11
          30.944Z"
          fill="#2D3748" />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="3.5"
            y1="16"
            x2="59"
            y2="48"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="#2298BD" />
            <stop offset="1" stop-color="#0ED7B5" />

          </linearGradient>
        </defs>
      </svg>
      <p class="w-3/4 mx-2 leading-tight tracking-tight text-sm">
        Tailwind is a utility-first CSS framework for
        <a
          class="font-medium text-green-500 hover:text-green-800"
          href="https://tailwindcss.com/"
          target="_blank">
          rapidly building custom designs and responsive pages.
        </a>
        You can test your creations by pasting them here:
      </p>
    </div>
    <div class="flex space-x-4 mt-2">
      <a href="https://codepen.io/bernardoferrari/pen/mdVBJxe" target="_blank">
        <button
          class="px-4 py-2 font-semibold text-gray-800 bg-white border
          border-gray-400 rounded shadow hover:bg-gray-50">
          CodePen
        </button>
      </a>
      <a href="https://play.tailwindcss.com/" target="_blank">
        <button
          class="px-4 py-2 font-semibold text-gray-800 bg-white border
          border-gray-400 rounded shadow hover:bg-gray-100">
          Tailwind Play
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
