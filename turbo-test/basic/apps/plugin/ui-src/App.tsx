import { useEffect, useState } from "react";
import { FrameworkTypes, PluginUI } from "plugin-ui";

export default function App() {
  const [code, setCode] = useState("");
  const [selectedFramework, setSelectedFramework] =
    useState<FrameworkTypes>("HTML");

  useEffect(() => {
    // Add event listener for messages from Figma plugin
    window.onmessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;

      if (message.type === "code") {
        setCode(message.data);
      } else if (message.type === "empty") {
        setCode("empty");
      }
    };

    parent.postMessage({ pluginMessage: { type: "html" } }, "*");

    // Clean up the event listener when the component is unmounted
    return () => {
      window.onmessage = null;
    };
  }, []);

  useEffect(() => {
    console.log("pushing message");
    parent.postMessage({ pluginMessage: { type: selectedFramework } }, "*");
  }, [selectedFramework]);

  return (
    <div className="">
      <PluginUI
        code={code}
        emptySelection={false}
        selectedFramework={selectedFramework}
        setSelectedFramework={setSelectedFramework}
      />
    </div>
  );
}
