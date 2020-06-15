<script>
  import { createEventDispatcher } from "svelte";

  export let value = "";

  export let name = "";
  export let attr = "";

  const dispatch = createEventDispatcher();

  const select = num => () => (value += num);
  const clear = () => (value = "");
  const submit = () => dispatch("submit");
</script>

<div class="flex space-x-2 items-center px-2 py-1 border-2 rounded-lg w-full">
  <div class="flex items-center justify-center p-1 h-8 rounded-lg border-2">
    <p class="text-xs text-center text-gray-700">Aa</p>
  </div>
  <div class="flex flex-col min-w-0">
    <p class="text-sm font-medium truncate w-full">{name}</p>
    <p class="text-xs tracking-wide truncate w-full">{attr}</p>
  </div>
</div>
