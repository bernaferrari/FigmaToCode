import { type Node } from "./api_types";

export type AltNode = Node & {
  styledTextSegments: Array<
    Pick<StyledTextSegment, any | "characters" | "start" | "end">
  >;
  cumulativeRotation: number;
  uniqueName: string;
  canBeFlattened: boolean;
  isRelative: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
};
