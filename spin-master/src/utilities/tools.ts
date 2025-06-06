import {
  Sprite,
  Assets,
  TilingSprite,
  Text,
  Application,
  Renderer,
} from "pixi.js";
import { SoundLibrary } from "./soundLibrary";
import { Howl } from "howler";
import {
  AlignType,
  AnchorPoint,
  FromSprite,
  Size,
  StyleType,
} from "../types/types";
import { STYLE } from "./style-library";

export function setAnchorPoint(
  anchorPoint: AnchorPoint,
  width: number,
  height: number,
) {
  switch (anchorPoint) {
    case "topLeft":
      return { x: 0, y: 0 };
    case "topRight":
      return { x: width, y: 0 };
    case "bottomLeft":
      return { x: 0, y: height };
    case "bottomRight":
      return { x: width, y: height };
    case "center":
      return { x: width / 2, y: height / 2 };
    case "centerTop":
      return { x: width / 2, y: 0 };
    case "centerBottom":
      return { x: width / 2, y: height };
    case "centerLeft":
      return { x: 0, y: height / 2 };
    case "centerRight":
      return { x: width, y: height / 2 };
    default:
      return { x: 0, y: 0 };
  }
}

// --- GLOBAL ---

export function getAppScreenWidth(app: Application) {
  return app?.screen ? app.screen.width : 0;
}
export function getAppScreenHeight(app: Application) {
  return app?.screen ? app.screen.height : 0;
}

export function canvasCenterX(app: Application<Renderer>) {
  return app?.canvas ? app.canvas.width / 2 : 0;
}
export function canvasCenterY(app: Application<Renderer>) {
  return app?.canvas ? app.canvas.height / 2 : 0;
}

// --- SOUND ---
export function playSound(
  src: SoundLibrary,
  vol = 0.5,
  loop = false,
  pitch = 1,
) {
  const sound = new Howl({
    src: [src],
    loop,
    volume: vol,
    rate: pitch,
  });
  sound.play();
  return sound;
}

export function initSound(src: SoundLibrary, vol = 0.7, loop = false) {
  return new Howl({
    src: [src],
    loop,
    volume: vol,
  });
}

export async function createSprite(
  x: number,
  y: number,
  anchorPoint: AnchorPoint,
  size: Size = { w: 1, h: 1 },
  spriteName: FromSprite,
): Promise<Sprite> {
  const texture = await Assets.load("/assets/" + spriteName + ".png");
  texture.source.scaleMode = "nearest";
  const sprite = Sprite.from(texture);
  sprite.position.set(x, y);
  const _anchorPoint = setAnchorPoint(anchorPoint, sprite.width, sprite.height);
  sprite.anchor.set(_anchorPoint.x, _anchorPoint.y);
  sprite.scale.set(1, 1);
  sprite.position.set(size.w, size.h);
  return sprite;
}

export async function createText(
  x: number,
  y: number,
  anchorPoint: AnchorPoint,
  text: string,
  styleType: StyleType,
  size = 1,
  align: AlignType | null = null,
): Promise<Text> {
  const style = STYLE[styleType](size);
  const font = await Assets.load("/fonts/Roboto_Condensed-Regular.ttf");
  style.fontFamily = font.family.split(" ")[0];
  style.fontSize = style.fontSize * size;
  if (align) style.align = align;
  const textData = new Text({ text, style });
  const _anchorPoint = setAnchorPoint(
    anchorPoint,
    textData.width,
    textData.height,
  );
  textData.position.set(x, y);
  textData.anchor.set(_anchorPoint.x, _anchorPoint.y);
  return textData;
}

export async function createTiledSprite(
  image: string,
  x: number,
  y: number,
  width = 32,
  height = 32,
  textureSize = 1,
  interpolation = false,
): Promise<TilingSprite> {
  const texture = await Assets.load("/public/assets/" + image + ".png");
  const tile = new TilingSprite({ texture });
  tile.position.set(x, y);
  tile.tileScale.set(textureSize, textureSize);
  tile.width = width;
  tile.height = height;
  if (!interpolation) {
    tile.texture.source.scaleMode = "nearest";
  }
  return tile;
}

export function approach(target: number, value: number, increment: number) {
  if (target < value) return target + increment;
  if (target > value) return target - increment;
  return target;
}

export function choose<T>(...args: T[]): T {
  return args[Math.floor(Math.random() * args.length)];
}
