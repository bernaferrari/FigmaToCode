<script>
  import ItemColor from "./TailwindItemColor.svelte";
  import ItemText from "./TailwindItemText.svelte";

  import Prism from "svelte-prism";
  import "prism-theme-night-owl";
  import "prismjs/components/prism-swift";

  let codeData = "";
  let emptySelection = false;

  $: codeObservable = codeData;
  $: emptyObservable = emptySelection;

  if (false) {
    // DEBUG
    codeData = `<div class="inline-flex space-x-1 items-center justify-center p-1 border-gray-700 border-2 rounded-lg">
<div class="flex items-center justify-center p-1 h-4 bg-white rounded-lg"><p class="h-4 w-4 text-xs font-bold text-center text-gray-700">Aa</p></div>
<div class="inline-flex flex-col items-center justify-center p-1 self-start w-16"><p class="self-start text-xs font-medium text-black">Header</p><p class="self-start text-xs text-black">font-xs bold arhhh</p></div></div>
`;
  }

  onmessage = event => {
    console.log("got this from the plugin code", event.data);
    if (!event.data.pluginMessage) {
      return;
    }

    if (emptySelection !== (event.data.pluginMessage.type === "empty")) {
      emptySelection = event.data.pluginMessage.type === "empty";
    }

    if (event.data.pluginMessage.type === "colors") {
      colorData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "text") {
      textData = event.data.pluginMessage.data;
    } else if (event.data.pluginMessage.type === "result") {
      codeData = event.data.pluginMessage.data;
    }
  };

  import Switch from "./Switch.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const clipboard = data => dispatch("clipboard", { text: data });

  // INIT
  import { onMount } from "svelte";
  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "swiftui" } }, "*");
  });

  const sectionStyle = "border rounded-lg bg-white";
</script>

<div>
  <div class="bg-gray-100 p-4 flex flex-col items-center">

    <div class="flex">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-1/4 m-auto px-2"
        viewBox="0 0 160 50">
        <path
          d="m49.4889167
          13.7084167c-.0029167-.49775-.0084167-.99525-.0221667-1.4935834-.029-1.084-.0930833-2.1778333-.28575-3.25024997-.1955-1.08908333-.5150833-2.10175-1.01875-3.09108333-.4944167-.97158333-1.14075-1.86066667-1.91175-2.63166667-.7708333-.771-1.6599167-1.41725-2.6319167-1.91191666-.9885-.50308334-2.0013333-.82258334-3.0894166-1.01808334-1.073-.19325-2.1668334-.25691666-3.2516667-.28625-.4980833-.0135-.9956667-.01916666-1.4935833-.02225-.591-.00333333-1.1824167-.00333333-1.77325-.00333333h-13.1013334-5.4275833c-.5914167
          0-1.1821667
          0-1.773.00341667-.4980833.00308333-.99625.00875-1.4935833.02225-.2711667.00733333-.5429167.01683333-.8148334.02991666-.8156666.03933334-1.6325833.11141667-2.43691663.25633334-.81608334.14666666-1.58991667.363-2.34275.67425-.25091667.10366666-.49958334.218-.74675.34375-.729.371-1.4115.82725-2.03225
          1.35741666-.20691667.17675-.407.36166667-.59966667.55441667-.77116667.771-1.4175
          1.66008333-1.91191667 2.63166667-.50366666.98933333-.82283333
          2.002-1.0185 3.09108333-.1925 1.0724167-.2565 2.16625-.28566666
          3.25025-.01366667.4983333-.01941667.9958333-.02266667
          1.4935833-.00375.5911667-.00325 1.1824167-.00325 1.7734167v8.06825
          10.4604167c0 .5915833-.00058333 1.18225.00325
          1.7738333.00325.49775.009.99525.02266667 1.49275.02916666
          1.0845833.09308333 2.1786667.28566666 3.2505833.19566667
          1.08875.51483334 2.1023334 1.0185 3.0914167.49441667.9718333 1.14075
          1.8606667 1.91191667 2.6313333.77058333.7713334 1.65991667 1.4175
          2.632 1.9125.98858333.5031667 2.00133333.82225 3.08966667 1.01775
          1.07233333.193 2.16700003.2571667
          3.25158333.2861667.4973333.01325.9955.0191667
          1.4935833.022.5908334.00425 1.1815834.0036667
          1.773.0036667h18.5288334c.5908333 0 1.18225.0005833
          1.7731666-.0036667.4979167-.0028333.9955-.00875 1.4935834-.022
          1.0848333-.029 2.1786666-.09325 3.2516666-.2861667 1.0880834-.1955
          2.1009167-.5146666 3.0894167-1.01775.972-.4949166 1.8610833-1.1411666
          2.6319167-1.9125.771-.77075 1.4174166-1.6595
          1.91175-2.6313333.5036666-.9890833.82325-2.0025833
          1.01875-3.0914167.1926666-1.0719166.25675-2.166.28575-3.2505833.0136666-.4975.0191666-.9949167.0221666-1.49275.0038334-.5915833.0035-1.18225.0035-1.7738333v-18.5286667c.0000834-.591.0003334-1.18225-.0034166-1.7733333z"
          fill="#f05138" />
        <path
          d="m39.2171667
          30.5505833c-.0011667-.0015-.00225-.0025833-.0035-.004.05475-.1863333.11125-.3715.1591666-.5625
          2.0541667-8.1840833-2.95925-17.8599166-11.443-22.95449997 3.71775
          5.03991667 5.3615834 11.14441667 3.9010834
          16.48291667-.13025.4761667-.2868334.9331667-.4599167
          1.3773333-.1878333-.1234166-.4245-.2635-.7423333-.43875 0
          0-8.4390834-5.2105833-17.5856667-14.4268333-.24-.24191667 4.8773333
          7.3141667 10.6849167
          13.4499167-2.7361667-1.5355834-10.3615-7.0836667-15.18883337-11.5019167.59308334.9890833
          1.2985 1.9415 2.07391667 2.8584167 4.03125 5.1124166 9.2885 11.4203333
          15.5869167 16.2640833-4.4253334 2.7081667-10.6784167
          2.91875-16.90433337.0028333-1.53991666-.7216666-2.98758333-1.5924166-4.32766666-2.58175
          2.63541666 4.2154167 6.69433333 7.8524167 11.63441663 9.9756667
          5.89125 2.53175 11.7496667 2.3600833
          16.113.0415l-.0034166.005c.0199166-.0125833.04525-.0263333.0659166-.0390833.1791667-.0963334.357-.1944167.5309167-.298
          2.0964167-1.0881667 6.23725-2.1921667 8.4598333 2.1323333.5443334
          1.0583333 1.701-4.5503333-2.5514166-9.7826667z"
          fill="#fff" />
        <path
          d="m68.2754997 32.1185833c.3866666 3.4335834 3.6615 5.68475 8.2095
          5.68475 4.3211666 0 7.4365833-2.2511666 7.4365833-5.3660833
          0-2.6835833-1.8873333-4.3216667-6.2313333-5.41275l-4.207-1.06875c-6.0491667-1.5010833-8.7783334-4.2303333-8.7783334-8.7326667
          0-5.54875 4.8439167-9.39241663 11.7349167-9.39241663 6.6855 0
          11.4385833 3.86600003 11.5979167
          9.43808333h-4.4343334c-.3415-3.41125-3.1159166-5.5040833-7.27725-5.5040833-4.1166666
          0-6.9819166 2.1151666-6.9819166 5.20775 0 2.4105 1.7741666 3.8436666
          6.1405 4.9580833l3.5020833.9094167c6.7769167 1.6605 9.55125 4.2983333
          9.55125 9.0514166 0 6.0491667-4.79875 9.8471667-12.4398333
          9.8471667-7.0950834
          0-11.939-3.7756667-12.3028334-9.61975h4.4800834zm48.4318333
          9.07375h-4.457667l-5.20775-18.1475h-.090833l-5.184917
          18.1475h-4.4571663l-6.5951667-23.76525h4.3206667l4.5936666
          19.08025h.0913334l5.1849163-19.08025h4.184167l5.230583
          19.08025h.091334l4.59375-19.08025h4.275zm9.45025-30.1555c0-1.4320833
          1.182917-2.59216663 2.615583-2.59216663 1.4555 0 2.637917 1.16008333
          2.637917 2.59216663 0 1.4330834-1.182417 2.6155834-2.637917
          2.6155834-1.432666 0-2.615583-1.1824167-2.615583-2.6155834zm.455167
          6.39025h4.3435v23.76525h-4.3435zm32.708583
          3.5025834v-3.5026667h-4.59375v-5.68475h-4.321167v5.68475h-3.524916-4.777917v-2.0918333c.022333-2.1151667.841333-3.00225
          2.79725-3.00225.636333 0 1.27325.069
          1.7965.1593333v-3.41125c-.773417-.11366667-1.478333-.18166667-2.296833-.18166667-4.639417
          0-6.595167 1.93349997-6.595167
          6.36783337v2.1598333h-3.319917v3.5026667h3.319917v20.2625833h4.320667v-20.2625833h4.755583
          3.524917v14.03175c0 4.59375 1.751333 6.3668333 6.299333
          6.3668333.977917 0 2.092333-.068
          2.59275-.1816667v-3.54725c-.295833.0456667-1.160167.1136667-1.637583.1136667-2.023834
          0-2.93325-.9550833-2.93325-3.0925833v-13.69075z" />
      </svg>
      <p class="mx-2 w-3/4 text-md tracking-tight leading-tight">
        SwiftUI an innovative, exceptionally simple way to build user interfaces
        <a
          class="text-orange-500 font-medium"
          href="https://developer.apple.com/xcode/swiftui/">
          across all Apple platforms with the power of Swift.
        </a>
        You can test your creations in Xcode or
        <a
          class="text-orange-500 font-medium"
          href="https://www.apple.com/swift/playgrounds/">
          Swift Playgrounds
        </a>
        (iPad and Mac).
      </p>
    </div>
    <p class="mt-2">
      Tip:
      <a
        class="text-orange-500 font-medium"
        href="https://stackoverflow.com/a/7828337/4418073">
        how to indent the code.
      </a>
    </p>

  </div>

</div>

<div class="px-2 pt-2 bg-gray-100">

  {#if emptySelection}
    <div
      class="flex flex-col space-y-2 m-auto items-center justify-center p-4 {sectionStyle}">
      <p class="text-lg font-bold">Nothing is selected</p>
      <p class="text-xs">Try selecting a layer, any layer</p>
    </div>
  {:else}
    <div class="w-full pt-2 {sectionStyle}">
      <div class="flex items-center px-2 space-x-2 justify-between">
        <p
          class="text-lg font-medium text-center bg-gray-300 py-2 px-4
          rounded-lg">
          Code
        </p>
        <button
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold
          hover:text-white py-2 px-4 border border-blue-500
          hover:border-transparent rounded"
          on:click={clipboard(codeObservable)}>
          Copy to Clipboard
        </button>
      </div>

      <Prism language="swift" source={codeObservable} />

    </div>
    <div class="h-2" />
  {/if}
</div>
