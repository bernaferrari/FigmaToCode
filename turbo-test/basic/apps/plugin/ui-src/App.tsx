import { useEffect, useState } from "react";
import { FrameworkTypes, PluginUI } from "plugin-ui";

export default function App() {
  const [code, setCode] = useState("");
  const [selectedFramework, setSelectedFramework] =
    useState<FrameworkTypes | null>(null);

  useEffect(() => {
    // Add event listener for messages from Figma plugin
    window.onmessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;

      if (message.type === "code") {
        setCode(message.data);
        setSelectedFramework(message.framework);
      } else if (message.type === "empty") {
        setCode("empty");
      }
    };

    // Clean up the event listener when the component is unmounted
    return () => {
      window.onmessage = null;
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  // Only show loading if it takes too long to load.
  useEffect(() => {
    if (selectedFramework === null) {
      const timer = setTimeout(() => {
        setIsLoading(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [selectedFramework]);

  if (selectedFramework === null) {
    if (isLoading) {
      return (
        <div className="w-full h-96 justify-center text-center items-center dark:text-white text-lg">
          Opening Plugin...
        </div>
      );
    } else {
      return <></>;
    }
  }

  const handleFrameworkChange = (newFramework: FrameworkTypes) => {
    setSelectedFramework(newFramework);
    parent.postMessage(
      { pluginMessage: { type: "tabChange", data: newFramework } },
      "*"
    );
  };

  return (
    <div className="">
      <PluginUI
        code={code}
        emptySelection={false}
        selectedFramework={selectedFramework}
        setSelectedFramework={handleFrameworkChange}
      />
    </div>
  );
}
