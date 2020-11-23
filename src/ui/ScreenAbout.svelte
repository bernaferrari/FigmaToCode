<script>
  import Prism from "svelte-prism";
  import "prism-theme-night-owl";
  import "prismjs/components/prism-dart";
</script>

<div class="w-full px-8 py-4 bg-blue-50">
  <p class="text-xl font-bold text-center">Responsive Layout</p>
  <div class="flex items-center justify-center w-full pt-4 space-x-4">
    <div
      class="inline-flex flex-col items-center justify-center p-5 border-2 border-red-600">
      <div class="relative w-32 h-24">
        <div
          p
          class="absolute bottom-0 left-0 inline-flex items-center justify-center h-10 px-3 py-3 border-2 border-red-600">
          <p class="text-xs font-medium text-center text-red-600">BAD</p>
        </div>
        <div
          class="absolute top-0 left-0 inline-flex items-center justify-center h-10 px-3 py-3 border-2 border-red-600">
          <p class="text-xs font-medium text-center text-red-600">BAD</p>
        </div>
        <div
          class="absolute inset-y-0 right-0 inline-flex items-center justify-center h-10 px-3 py-3 my-auto border-2 border-red-600">
          <p class="text-xs font-medium text-center text-red-600">BAD</p>
        </div>
      </div>
    </div>

    <div
      class="inline-flex items-center justify-center p-4 space-x-4 border-2 border-blue-600">
      <div
        class="inline-flex flex-col items-center justify-center p-1 space-y-3 border-2 border-blue-600">
        <div
          class="inline-flex items-center justify-center h-10 p-3 border-2 border-blue-600">
          <p class="text-xs font-medium text-center text-blue-600">GOOD</p>
        </div>
        <div
          class="inline-flex items-center justify-center h-10 p-3 border-2 border-blue-600">
          <p class="text-xs font-medium text-center text-blue-600">GOOD</p>
        </div>
      </div>
      <div
        class="inline-flex items-center justify-center h-10 p-3 border-2 border-blue-600">
        <p class="text-xs font-medium text-center text-blue-600">GOOD</p>
      </div>
    </div>
  </div>
  <div class="h-4" />

  <p class="text-base text-center">
    The plugin works
    <span class="font-bold">perfectly</span>
    when layers are vertically or horizontally aligned, even if AutoLayout is
    off. When the layout is more complex, you can manually group layers to make
    them aligned.
  </p>

</div>

<div class="w-full px-8 py-4 bg-blue-200">
  <p class="text-xl font-bold text-center">Info</p>
  <div class="h-2" />

  <p class="text-base text-center">
    I have tried to think what would make sense for
   most people. Still, bugs can and will happen; ideas will appear. Your mission, should you
    choose to accept, is to share them with me.
  </p>

</div>
<div class="w-full px-8 py-4 bg-blue-900">
  <p class="text-xl font-bold text-center text-white">Figma to Code</p>
  <div class="h-2" />
  <p class="font-semibold text-center text-white text-base">
    Designed and developed by Bernardo Ferrari.
  </p>
  <div class="h-4" />
  <div class="flex content-center justify-center space-x-4">
    <a href="https://twitter.com/@bernaferrari" target="_blank">
      <button
        class="p-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded-lg shadow hover:bg-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path
            d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574
            2.163-2.723-.951.555-2.005.959-3.127
            1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92
            4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64
            3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188
            4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946
            4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631
            1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39
            0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0
            13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56
            2.46-2.548l-.047-.02z" />
        </svg>
      </button>
    </a>
    <a href="https://reddit.com/u/bernaferrari" target="_blank">
      <button
        class="p-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded-lg shadow hover:bg-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path
            d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12
            0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0
            1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674
            1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0
            .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13
            4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87
            0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754
            1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43
            4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1
            .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8
            12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561
            1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687
            0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561
            1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0
            0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0
            2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464
            0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0
            0 0-.232-.095z" />
        </svg>

      </button>
    </a>
    <a href="mailto:bernaferrari2@gmail.com" target="_blank">
      <button
        class="p-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded-lg shadow hover:bg-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-mail">
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1
            0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </button>
    </a>
    <a href="https://github.com/bernaferrari" target="_blank">
      <button
        class="p-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded-lg shadow hover:bg-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205
            11.385.6.113.82-.258.82-.577
            0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422
            18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084
            1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305
            3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93
            0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0
            1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3
            .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12
            3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475
            5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0
            .315.21.69.825.57C20.565 22.092 24 17.592 24
            12.297c0-6.627-5.373-12-12-12" />
        </svg>
      </button>
    </a>
  </div>
  <div class="flex justify-center mt-2 text-white">
    <a
      class="px-4 py-2 text-xs text-center text-white"
      href="https://github.com/bernaferrari/FigmaToCode"
      target="_blank">
      This project is open source and has no tracking.
    </a>
  </div>
</div>
