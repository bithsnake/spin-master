import { TextStyle } from "pixi.js";
import { COLOR } from "./colorLibrary";
import { StyleType } from "../types/types";

export const STYLE: { [key: string]: (size?: number) => TextStyle } = {
  normal: (size = 1): TextStyle =>
    new TextStyle({
      fontFamily: "Roboto",
      fontSize: 36 * size,
      fill: COLOR.white,
      align: "left",
    }),
  title: (size = 1): TextStyle =>
    new TextStyle({
      fontSize: 128 * size,
      fill: COLOR.melange,
      fontWeight: "bold",
      letterSpacing: 4,
      align: "center",
      stroke: COLOR.greenLight,
    }),
};

export const STYLE_KEY: { normal: StyleType; title: StyleType } = {
  normal: "normal",
  title: "title",
};
