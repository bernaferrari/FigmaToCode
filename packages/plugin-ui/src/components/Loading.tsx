interface LoadingProps {}
const Loading = (_props: LoadingProps) => (
  <div
    style={{ animation: "fadeIn 600ms" }}
    className={`flex w-full h-full p-4 dark:text-white text-lg`}
  >
    <div className="dark:text-white">
      <p className="text-lg font-medium dark:text-white rounded-lg">
        Converting...
      </p>
      <p className="text-xs italic max-w-56">
        This can take a while if the selection has many images or paths
      </p>
    </div>
    <style>{`
      @keyframes fadeIn {
        0% { opacity: 0; }
        25% {opacity: 0; }
        100% { opacity: 1; }
      }
    `}</style>
  </div>
);
export default Loading;
