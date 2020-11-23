<script>
  export let id = "";
  export let text = "";
  export let checked = false;
  export let disabled = false;
</script>

<style>
  .switch {
    @apply relative inline-block align-middle cursor-pointer select-none;
  }

  .track {
    @apply w-12 h-6 bg-gray-600 rounded-full shadow-inner;
  }

  .thumb {
    @apply transition-all duration-300 ease-in-out absolute top-0 left-0 w-6 h-6 bg-white border-2 border-gray-600 rounded-full;
  }

  input[type="checkbox"]:checked ~ .thumb {
    @apply transform translate-x-full border-green-500;
  }

  input[type="checkbox"]:checked ~ .track {
    @apply transform transition-colors bg-green-500;
  }

  input[type="checkbox"]:disabled ~ .track {
    @apply bg-gray-500;
  }

  input[type="checkbox"]:disabled ~ .thumb {
    @apply bg-gray-100 border-gray-500;
  }

  input[type="checkbox"]:focus + .track,
  input[type="checkbox"]:active + .track {
    @apply ring-black;
  }
</style>

<label for={id}>
  <div class="switch">
    <input
      {id}
      name={id}
      type="checkbox"
      class="sr-only"
      {disabled}
      bind:checked />
    <div class="track" />
    <div class="thumb" />
  </div>
  <span class="ml-2 cursor-pointer">{text}</span>
</label>
