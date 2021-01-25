<script>
  import { createEventDispatcher } from "svelte";

  export let colorName = "";
  export let hex = "";

  const dispatch = createEventDispatcher();
  const clipboard = () => dispatch("clipboard");

  console.log("making it with hex", hex);
</script>

<button
  class="flex space-x-2 items-center px-2 py-1 border rounded-lg w-full
  text-left content-start justify-start transition duration-300 ease-in-out
  bg-white transform hover:scale-105"
  style="border-color:{hex}"
  on:click={clipboard}>
  <div
    class="w-4 h-8 flex-shrink-0 rounded-md"
    style="background-color:{hex}" />
  <div class="flex flex-col content-start min-w-0">
    <p class="text-sm font-medium truncate w-full">{colorName}</p>
    <p class="text-xs tracking-wide truncate w-full">{hex}</p>
  </div>
</button>
