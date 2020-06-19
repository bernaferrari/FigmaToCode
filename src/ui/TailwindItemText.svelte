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
  class="flex space-x-2 items-center px-2 py-1 text-left border rounded-lg
  w-full transition duration-300 ease-in-out bg-white transform hover:scale-105"
  on:click={clipboard}>
  <div
    class="flex items-center justify-center p-1 h-8 rounded-lg"
    style="background-color:{backgroundColor}">
    <p class="text-xs text-center text-gray-700" {style}>Aa</p>
  </div>
  <div class="flex flex-col min-w-0">
    <p class="text-sm font-medium truncate w-full">{name}</p>
    <p class="text-xs tracking-wide truncate w-full">{attr}</p>
  </div>
</button>
