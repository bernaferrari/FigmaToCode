<script>
  import { createEventDispatcher } from "svelte";

  export let hex = "";
  export let contrastBlack;
  export let contrastWhite;

  const dispatch = createEventDispatcher();
  const clipboard = () => dispatch("clipboard");

  let textColor;

  // avoid undeterministic scenarios, where toFixed can't be called in undefined
  let fixedBlack = "";
  let fixedWhite = "";

  $: if (contrastBlack || contrastWhite) {
    if (contrastBlack > contrastWhite) {
      textColor = "black";
    } else {
      textColor = "white";
    }

    fixedBlack = contrastBlack.toFixed(2);
    fixedWhite = contrastWhite.toFixed(2);
  }

  function calculateLetter(ratio) {
    if (ratio < 3) {
      return "FAIL";
    } else if (ratio < 4.5) {
      return "AA+";
    } else if (ratio < 7) {
      return "AA";
    } else {
      return "AAA";
    }
  }
</script>

<button
  class="flex space-x-2 items-center px-2 py-1 border rounded-lg w-full
  text-left content-start justify-start transition duration-300 ease-in-out
  bg-white transform hover:scale-105"
  style="background-color:{hex}"
  on:click={clipboard}>
  <div class="flex flex-col content-start">
    <!-- <p class="text-sm font-medium truncate w-full">{name}</p> -->
    <p class="text-base tracking-widest w-full" style="color:{textColor}">
      {hex}
    </p>
    <div class="flex space-x-2 items-center py-1">
      <div class="flex items-center justify-center p-1 bg-white rounded-lg">
        <p class="text-xs" style="color:{hex}">
          {calculateLetter(contrastWhite)} {fixedWhite}
        </p>
      </div>
      <div class="flex items-center justify-center p-1 bg-black rounded-lg">
        <p class="text-xs" style="color:{hex}">
          {calculateLetter(contrastBlack)} {fixedBlack}
        </p>
      </div>
    </div>
  </div>
</button>
