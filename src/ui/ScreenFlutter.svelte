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
</script>

<div class="bg-gray-100 p-2 flex flex-col items-center">

  <div class="flex">

    <svg
      class="h-8 w-1/4 m-auto"
      viewBox="0 0 415 168"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0)">
        <path
          d="M46.9871 130.148L97.7505 79.373H60.839L28.5371 111.687L46.9871
          130.148Z"
          fill="#39CEFD" />
        <path
          d="M0.844727 83.9942L60.8389 24H97.7505L19.3063 102.456L0.844727
          83.9942Z"
          fill="#39CEFD" />
        <path
          d="M60.8392 143.988H97.7508L65.4488 111.686L46.9873 130.148L60.8392
          143.988Z"
          fill="#03569B" />
        <path
          d="M28.5347 111.679L46.9967 93.2173L65.4598 111.679L46.9967
          130.141L28.5347 111.679Z"
          fill="#16B9FD" />
        <path
          d="M97.7505 79.3731L65.4485 111.687L97.7505 144H60.8389L28.5255
          111.687L60.8389 79.3731H97.7505ZM60.8389 24L0.844727 83.9942L19.3063
          102.456L97.7505 24H60.8389Z"
          fill="url(#paint0_radial)" />
        <path
          d="M139.097
          49.1748H179.146V57.0073H147.225V80.7044H176.043V88.4408H147.225V118.422H139.097V49.1748ZM188.837
          49.1748H197.057V118.426H188.837V49.1748ZM227.131 119.974C221.2 119.974
          216.644 118.233 213.461 114.75C210.387 111.245 208.85 106.377 208.85
          100.145V69.0997H217.071V98.8891C217.071 103.569 218.135 107.017
          220.263 109.234C222.391 111.451 225.261 112.559 228.871
          112.559C231.645 112.559 234.108 111.818 236.261 110.335C238.477
          108.852 240.152 106.919 241.285 104.534C242.509 102.145 243.121
          99.6305 243.121
          96.9901V69.1329H251.338V118.456H243.506V111.266H243.118C241.763
          113.717 239.603 115.779 236.637 117.454C233.672 119.129 230.512
          119.967 227.157 119.967L227.131 119.974Z"
          fill="#696969" />
        <path
          d="M282.978 119.202C280.978 119.202 279.109 118.88 277.37
          118.234C275.695 117.589 274.276 116.718 273.114 115.622C271.823
          114.398 270.856 112.979 270.214 111.366C269.568 109.755 269.246
          107.788 269.246
          105.466V76.5482H260.637V69.1H269.246V55.1714H277.466V69.1H289.459V76.5482H277.466V103.437C277.466
          106.147 277.983 108.146 279.018 109.434C280.242 110.852 282.015
          111.562 284.338 111.562C286.21 111.562 288.015 111.014 289.754
          109.918V117.946C288.786 118.397 287.786 118.719 286.754
          118.914C285.786 119.111 284.53 119.21 282.986 119.21L282.978 119.202Z"
          fill="#696969" />
        <path
          d="M317.841 119.202C315.841 119.202 313.971 118.88 312.232
          118.234C310.557 117.589 309.139 116.718 307.976 115.622C306.685
          114.398 305.719 112.979 305.076 111.366C304.431 109.755 304.108
          107.788 304.108
          105.466V76.5482H295.5V69.1H304.108V55.1714H312.328V69.1H324.321V76.5482H312.328V103.437C312.328
          106.147 312.846 108.146 313.88 109.434C315.104 110.852 316.878 111.562
          319.2 111.562C321.072 111.562 322.878 111.014 324.617
          109.918V117.946C323.649 118.397 322.649 118.719 321.617
          118.914C320.649 119.111 319.392 119.21 317.848 119.21L317.841 119.202Z"
          fill="#696969" />
        <path
          d="M354.047 119.975C349.368 119.975 345.144 118.847 341.375
          116.591C337.636 114.334 334.703 111.24 332.575 107.306C330.511 103.308
          329.479 98.8257 329.479 93.8577C329.479 89.0868 330.445 84.7026
          332.379 80.705C334.379 76.7075 337.184 73.5154 340.795 71.1287C344.406
          68.7395 348.597 67.5449 353.368 67.5449C358.203 67.5449 362.394
          68.6533 365.94 70.87C369.487 72.9981 372.196 75.9636 374.068
          79.7666C376.002 83.572 376.969 87.9242 376.969 92.8233C376.969 93.7912
          376.87 94.6287 376.673 95.3356H337.695C337.892 99.0745 338.795 102.235
          340.403 104.816C342.014 107.395 344.046 109.328 346.499
          110.616C349.012 111.907 351.623 112.552 354.332 112.552C360.652
          112.552 365.52 109.587 368.937 103.656L375.901 107.04C373.773 111.038
          370.871 114.198 367.196 116.52C363.586 118.84 359.201 120.001 354.044
          120.001L354.047 119.975ZM368.264 88.5412C368.136 86.4772 367.557
          84.4144 366.528 82.3528C365.493 80.2888 363.849 78.5474 361.596
          77.1287C359.379 75.7099 356.608 75.0006 353.283 75.0006C349.416
          75.0006 346.128 76.2567 343.418 78.7691C340.775 81.2198 339.034 84.476
          338.194 88.5375H368.275L368.264 88.5412ZM386.493
          69.1003H394.326V77.0326H394.714C395.682 74.3232 397.551 72.0991
          400.322 70.3602C403.095 68.5548 405.997 67.6521 409.027
          67.6521C411.283 67.6521 413.216 67.9747 414.827 68.62V77.5166C412.763
          76.4821 410.442 75.9649 407.863 75.9649C405.474 75.9649 403.281
          76.6422 401.286 77.9969C399.286 79.3516 397.685 81.189 396.483
          83.5092C395.326 85.7654 394.747 88.2284 394.747
          90.8984V118.46H386.527V69.1373L386.493 69.1003Z"
          fill="#696969" />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(3.56714 32.1788) scale(146.805)">
          <stop stop-color="white" stop-opacity="0.1" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </radialGradient>
        <clipPath id="clip0">
          <rect
            width="413.982"
            height="168"
            fill="white"
            transform="translate(0.844727)" />
        </clipPath>
      </defs>
    </svg>

    <p class="mx-2 w-3/4 text-md tracking-tight leading-tight">
      Flutter is Google’s UI toolkit for building applications for
      <a class="text-blue-500 font-medium" href="https://tailwindcss.com/">
        mobile, web, and desktop from a single codebase.
      </a>
      You can test your creations by pasting them here:
    </p>
  </div>

  <a href="https://codepen.io/bernardoferrari/pen/pogpBLB" target="_blank">
    <button
      class="mt-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2
      px-4 border border-gray-400 rounded shadow">
      Flutter on CodePen
    </button>
  </a>

</div>

<div class="px-2 pt-2">

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
