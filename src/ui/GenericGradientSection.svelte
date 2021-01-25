<script>
  import { createEventDispatcher } from "svelte";
  import { onDestroy } from "svelte";

  const dispatch = createEventDispatcher();
  const clipboard = data => dispatch("clipboard", { text: data });

  export let sectionStyle;

  let gradientsData = [];
  $: gradientsObservable = gradientsData;

  function handleMessage(event) {
    console.log("handleMessage gradientSection got", event.data);
    if (!event.data.pluginMessage) {
      return;
    }

    if (event.data.pluginMessage.type === "gradients") {
      gradientsData = event.data.pluginMessage.data;
    }
  }

  addEventListener("message", handleMessage);

  onDestroy(() => {
    removeEventListener("message", handleMessage);
  });
</script>

{#if gradientsObservable.length > 0}
  <div
    class="flex flex-col space-y-2 items-center w-full p-2 mb-2 {sectionStyle}">
    <div class="flex flex-wrap w-full">
      <div class="w-1/2 p-1">
        <div
          class="flex items-center justify-center w-full h-full bg-gray-200
          rounded-lg">
          <p class="text-xl font-semibold">Gradients</p>
        </div>
      </div>

      {#each gradientsObservable as item}
        <div class="w-1/2 p-1">
          <button
            class="flex space-x-2 items-center px-2 py-1 border rounded-lg
            w-full h-16 text-left content-start justify-start transition
            duration-300 ease-in-out bg-white transform hover:scale-105"
            style="background-image: {item.css}"
            on:click={clipboard(item.exported)} />
        </div>
      {/each}
    </div>
  </div>
{/if}
