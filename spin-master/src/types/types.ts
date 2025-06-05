import { COLOR_TYPE } from "../utilities/colorLibrary";
import {
  PLAY_DISABLED,
  PLAY_ENABLED,
  REEL,
  SYM01,
  SYM02,
  SYM03,
  SYM04,
  SYM05,
  SYM06,
  WIN_BG,
} from "../utilities/imageLibrary";

export type FromSprite =
  | typeof PLAY_DISABLED
  | typeof PLAY_ENABLED
  | typeof REEL
  | typeof SYM01
  | typeof SYM02
  | typeof SYM03
  | typeof SYM04
  | typeof SYM05
  | typeof SYM06
  | typeof WIN_BG;

export type PointAndSizeData = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Size = {
  w: number;
  h: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Meta = {
  app: string;
  version: string;
  name: string;
  image: string;
  format: string;
  size: Size;
  scale: string;
};

export type Frame = {
  frame: PointAndSizeData;
  sourceSize: Size;
  spriteSourceSize: PointAndSizeData;
  anchor: Point;
  [key: string]: unknown;
};

export type Animations = string[];

export type AtlasData = {
  frames: { [key: string]: Frame };
  meta: Meta;
  animations: { [key: string]: Animations };
};

export interface MousePosition {
  x: number;
  y: number;
  hsp: number;
  vsp: number;
}

export type MouseDownType = { hold: boolean; event: MouseEvent };

export type StyleType = "normal" | "title";

export type AlignType = "left" | "center" | "right";

export type AnchorPoint =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "center"
  | "centerTop"
  | "centerBottom"
  | "centerLeft"
  | "centerRight";

export interface SpineAssetPath {
  atlas: string;
  json: string;
  animation: string[];
}

export type SpineInstanceSettings = {
  size: number;
  color: COLOR_TYPE;
  eventMode: "none" | "static" | "auto";
  alpha: number;
  interactive: boolean;
};
