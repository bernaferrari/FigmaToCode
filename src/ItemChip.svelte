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

<div
  class="inline-flex items-center justify-center px-2 py-1 h-3 border-black
  border-2 rounded-lg">
  <p class="text-xs font-bold text-black">Tailwind</p>
</div>
