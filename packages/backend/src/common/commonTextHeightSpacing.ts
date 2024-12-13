export const commonLineHeight = (
  lineHeight: LineHeight,
  fontSize: number,
): number => {
  switch (lineHeight.unit) {
    case "AUTO":
      return 0;
    case "PIXELS":
      return lineHeight.value;
    case "PERCENT":
      return (fontSize * lineHeight.value) / 100;
  }
};

export const commonLetterSpacing = (
  letterSpacing: LetterSpacing,
  fontSize: number,
): number => {
  switch (letterSpacing.unit) {
    case "PIXELS":
      return letterSpacing.value;
    case "PERCENT":
      return (fontSize * letterSpacing.value) / 100;
  }
};
