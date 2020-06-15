<script>
  import { createEventDispatcher } from "svelte";

  export let value = "";

  export let name = "";
  export let hex = "";

  const dispatch = createEventDispatcher();

  const select = num => () => (value += num);
  const clear = () => (value = "");
  const submit = () => dispatch("submit");
</script>

<div
  class="flex space-x-2 items-center px-2 py-1 border rounded-lg w-full"
  style="border-color:{hex}">
  <div
    class="w-8 h-8 flex-shrink-0 rounded-lg"
    style="background-color:{hex}" />
  <div class="flex flex-col content-start min-w-0">
    <p class="text-sm font-medium truncate w-full">{name}</p>
    <p class="text-xs tracking-wide truncate w-full">{hex}</p>
  </div>
</div>
