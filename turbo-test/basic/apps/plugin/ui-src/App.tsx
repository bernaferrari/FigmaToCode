import React, { useEffect } from "react";
import { PluginUI } from "plugin-ui";

export default function App() {
  const [code, setCode] = React.useState("");

  // useEffect(() => {
  //   // Add event listener for messages from Figma plugin
  //   window.onmessage = (event: MessageEvent) => {
  //     const message = event.data.pluginMessage;

  //     if (message.type === "code") {
  //       setCode(message.code);
  //     }
  //   };

  //   // Clean up the event listener when the component is unmounted
  //   return () => {
  //     window.onmessage = null;
  //   };
  // }, []);

  return (
    <div className="">
      <PluginUI code={code} />
    </div>
  );
}
