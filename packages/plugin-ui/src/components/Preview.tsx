import { HTMLPreview } from "types";

const Preview: React.FC<{
  htmlPreview: HTMLPreview;
}> = (props) => {
  const targetWidth = 240;
  const targetHeight = 120;
  const scaleFactor = Math.min(
    targetWidth / props.htmlPreview.size.width,
    targetHeight / props.htmlPreview.size.height,
  );

  return (
    <div className="flex flex-col w-full">
      <div className="py-1.5 flex gap-2 w-full text-lg font-medium text-center dark:text-white rounded-lg justify-between">
        <span>Responsive Preview</span>
      </div>
      <div className="flex gap-2 justify-center items-center">
        <div
          className="relative flex flex-col items-center"
          style={{
            width: targetWidth,
            resize: "both",
            overflow: "auto",
            minWidth: "100px",
            minHeight: "100px",
          }}
        >
          <div
            className="flex flex-col justify-center items-center border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm w-full h-full"
            style={{
              clipPath: "inset(0px round 6px)",
            }}
          >
            <div
              style={{
                zoom: scaleFactor,
                width: "100%",
                height: "100%",
              }}
              dangerouslySetInnerHTML={{
                __html: props.htmlPreview.content,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Preview;
