type SelectableToggleProps = {
  onSelect: (isSelected: boolean) => void;
  isSelected?: boolean;
  title: string;
  description?: string;
  buttonClass: string;
  checkClass: string;
};

const SelectableToggle = ({
  onSelect,
  isSelected = false,
  title,
  description,
  buttonClass,
  checkClass,
}: SelectableToggleProps) => {
  const handleClick = () => {
    onSelect(!isSelected);
  };

  return (
    <button
      onClick={handleClick}
      title={description}
      className={`h-8 px-2 truncate flex items-center justify-center rounded-md cursor-pointer transition-all duration-300
      hover:bg-neutral-200 dark:hover:bg-neutral-700 gap-2 text-sm ring-1 
      ${
        isSelected
          ? buttonClass
          : "bg-neutral-100 dark:bg-neutral-800 dark:ring-neutral-700 ring-neutral-300"
      }`}
    >
      <span
        className={`h-3 w-3 flex-shrink-0 border-2 ${
          isSelected
            ? checkClass
            : "bg-transparent border-neutral-500 dark:border-neutral-500"
        }`}
        style={{
          borderRadius: 4,
        }}
      />
      {title}
    </button>
  );
};
export default SelectableToggle;
