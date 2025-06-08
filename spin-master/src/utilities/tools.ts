import {
  Sprite,
  Assets,
  TilingSprite,
  Text,
  Application,
  Renderer,
  AnimatedSprite,
  Spritesheet,
} from "pixi.js";
import { SoundLibrary } from "./soundLibrary";
import { Howl } from "howler";
import {
  AlignType,
  AnchorPoint,
  AtlasData,
  FromSprite,
  Point,
  Size,
  StyleType,
} from "../types/types";
import { STYLE } from "./style-library";

export function setAnchorPoint(anchorPoint: AnchorPoint) {
  switch (anchorPoint) {
    case "topLeft":
      return { x: 0, y: 0 };
    case "topRight":
      return { x: 1, y: 0 };
    case "topCenter":
      return { x: 0.5, y: 0 };
    case "bottomLeft":
      return { x: 0, y: 1 };
    case "bottomRight":
      return { x: 1, y: 1 };
    case "bottomCenter":
      return { x: 0.5, y: 1 };
    case "center":
      return { x: 0.5, y: 0.5 };
    case "centerLeft":
      return { x: 0, y: 0.5 };
    case "centerRight":
      return { x: 1, y: 0.5 };
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
export function getAppStageWidth(app: Application) {
  return app?.stage ? app.stage.width : 0;
}
export function getAppStageHeight(app: Application) {
  return app?.stage ? app.stage.height : 0;
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

export function initSound(src: SoundLibrary, vol = 0.7, loop = false): Howl {
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
  const _anchorPoint = setAnchorPoint(anchorPoint);
  sprite.anchor.set(_anchorPoint.x, _anchorPoint.y);
  sprite.position.set(x, y);
  sprite.scale.set(size.w, size.h);
  return sprite;
}

export async function createAnimatedSprite(
  atlasData: AtlasData,
  x: number,
  y: number,
  anchorPoint: Point = { x: 0, y: 0 },
  scale = 1,
  animate = {
    anim: "sit",
    animate: true,
    speed: 0.1,
  },
): Promise<AnimatedSprite> {
  const texture = await Assets.load(atlasData.meta.image);
  texture.source.scaleMode = "nearest";
  const spriteSheet = new Spritesheet(texture, atlasData);
  await spriteSheet.parse();
  const anim = spriteSheet.animations[animate.anim];
  const animatedSprite = new AnimatedSprite(anim);

  if (anchorPoint) {
    animatedSprite.anchor.set(anchorPoint.x, anchorPoint.y);
  }
  animatedSprite.position.set(x, y);
  animatedSprite.scale.set(scale, scale);
  if (animate.animate) {
    animatedSprite.animationSpeed = animate.speed;
    animatedSprite.play();
  }
  animatedSprite.label = atlasData.meta.name;
  return animatedSprite;
}

export async function createText(
  x: number,
  y: number,
  anchorPoint: AnchorPoint,
  text: string,
  styleType: StyleType,
  size = 1,
  align: AlignType | null = null,
  label: string = "newText",
): Promise<Text> {
  const style = STYLE[styleType](size);
  const font = await Assets.load("/fonts/Roboto_Condensed-Regular.ttf");
  style.fontFamily = font.family.split(" ")[0];
  style.fontSize = style.fontSize * size;
  if (align) style.align = align;
  const textData = new Text({ text, style });
  textData.label = label;
  const _anchorPoint = setAnchorPoint(anchorPoint);
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
  if (target < value) {
    target += increment;
    if (target > value) return value;
  } else {
    target -= increment;
    if (target < value) return value;
  }
  return target;

  // if (target < value) return target + increment;
  // if (target > value) return target - increment;
  // return target;
}

export function choose<T>(...args: T[]): T {
  return args[Math.floor(Math.random() * args.length)];
}

// Basic lerp funtion.
export function lerp(a1: number, a2: number, t: number) {
  return a1 * (1 - t) + a2 * t;
}
