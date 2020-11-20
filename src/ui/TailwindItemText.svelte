<script>
  import { createEventDispatcher } from "svelte";

  export let name = "";
  export let attr = "";
  export let style = "";
  export let contrastBlack;

  const dispatch = createEventDispatcher();
  const clipboard = () => dispatch("clipboard");

  // avoid white text in white background scenario
  let backgroundColor = "";
  $: if (contrastBlack) {
    if (contrastBlack > 7) {
      backgroundColor = "black";
    } else {
      backgroundColor = "white";
    }
  }
</script>
<button
  class="flex items-center w-full px-2 py-1 space-x-2 text-left transition duration-300 ease-in-out transform bg-white border rounded-lg hover:scale-105"
  on:click={clipboard}>
  <div
    class="flex items-center justify-center h-8 p-1 rounded-lg"
    style="background-color:{backgroundColor}">
    <p class="text-xs text-center text-gray-700" {style}>Aa</p>
  </div>
  <div class="flex flex-col min-w-0">
    <p class="w-full text-sm font-medium truncate">{name}</p>
    <p class="w-full text-xs tracking-wide truncate">{attr}</p>
  </div>
</button>
