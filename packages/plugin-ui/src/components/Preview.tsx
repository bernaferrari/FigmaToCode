import { HTMLPreview } from "types";
import ExpandIcon from "./ExpandIcon";

const Preview: React.FC<{
  htmlPreview: HTMLPreview;
  isResponsiveExpanded: boolean;
  setIsResponsiveExpanded: (value: boolean) => void;
}> = (props) => {
  const previewWidths = [45, 80, 140];
  const labels = ["sm", "md", "lg"];

  return (
    <div className="flex flex-col w-full">
      <div className="py-1.5 flex gap-2 w-full text-lg font-medium text-center dark:text-white rounded-lg justify-between">
        <span>Responsive Preview</span>
        <button
          className={`px-2 py-1 text-sm font-semibold border border-green-500 rounded-md shadow-sm hover:bg-green-500 dark:hover:bg-green-600 hover:text-white hover:border-transparent transition-all duration-300 ${"bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"}`}
          onClick={() => {
            props.setIsResponsiveExpanded(!props.isResponsiveExpanded);
          }}
        >
          <ExpandIcon size={16} />
        </button>
      </div>
      <div className="flex gap-2 justify-center items-center">
        {previewWidths.map((targetWidth, index) => {
          const targetHeight = props.isResponsiveExpanded ? 260 : 120;
          const scaleFactor = Math.min(
            targetWidth / props.htmlPreview.size.width,
            targetHeight / props.htmlPreview.size.height,
          );
          return (
            <div
              key={"preview " + index}
              className="relative flex flex-col items-center"
              style={{ width: targetWidth }}
            >
              <div
                className="flex flex-col justify-center items-center border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm"
                style={{
                  width: targetWidth,
                  height: targetHeight,
                  clipPath: "inset(0px round 6px)",
                }}
              >
                <div
                  style={{
                    zoom: scaleFactor,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: props.htmlPreview.content,
                  }}
                />
              </div>
              <span className="mt-auto text-xs text-gray-500">
                {labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Preview;
