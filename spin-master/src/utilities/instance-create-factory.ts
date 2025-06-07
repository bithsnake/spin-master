import {
  BackGroundInstance,
  ButtonInstance,
  instanceCreate,
  PointerInstance,
  ReelInstance,
  UIBalanceText,
  UISpinSecondsText,
  UIWinText,
} from "../classes/class-library";
import { FromSprite } from "../types/types";
import { REEL, TILE01 } from "./imageLibrary";
import { canvasCenterX, canvasCenterY } from "./tools";

import { GlobalState } from "../classes/class-library";
import { playButtonAction } from "../classes/button-class-actions";
import {
  playButtonAtlas,
  POINTER_HAND_ANIMS,
  pointerAtlasHand,
} from "./atlas-library";
import { SYMBOLS_LIST } from "./symbols-library";

// --- CENTER ---

export async function createGuiTextInstances(global: GlobalState) {
  const canvasCenter = {
    x: canvasCenterX(global.app),
    y: canvasCenterY(global.app),
  };

  const GUIBalanceTextInstance = await instanceCreate(
    canvasCenter.x - 580,
    32,
    UIBalanceText,
    {
      anchorPoint: "topLeft",
      title: "Balance: ",
      textSize: 1.5,
    },
  );

  const GUIWinTextInstance = await instanceCreate(
    canvasCenter.x + 225,
    32,
    UIWinText,
    {
      anchorPoint: "topLeft",
      title: "Win: ",
      textSize: 1.5,
    },
  );

  const GUISpinSecondsTextInstance = await instanceCreate(
    canvasCenter.x + 512,
    canvasCenter.y + 128,
    UISpinSecondsText,
    {
      anchorPoint: "topLeft",
      title: "Sec: ",
      textSize: 1.5,
    },
  );

  return [
    GUIWinTextInstance,
    GUISpinSecondsTextInstance,
    GUIBalanceTextInstance,
  ];
}

export async function createInteractiveInstances(global: GlobalState) {
  const canvasCenter = {
    x: canvasCenterX(global.app),
    y: canvasCenterY(global.app),
  };
  const pointerHandInstance = await instanceCreate(
    canvasCenter.x,
    canvasCenter.y,
    PointerInstance,
    {
      _pickerAtlas: pointerAtlasHand,
      anim: POINTER_HAND_ANIMS.pick,
      animate: false,
      speed: 0.1,
      anchorPoint: { x: 0.6, y: 0.4 },
    },
  );

  const reelInstance = await instanceCreate(
    canvasCenter.x,
    canvasCenter.y + 200,
    ReelInstance,
    {
      anchorPoint: "topCenter",
      size: { w: 1, h: 1 },
      reelSprite: REEL,
      symbolIds: SYMBOLS_LIST,
      global: global,
    },
  );

  reelInstance.self.position.set(
    canvasCenter.x - 70,
    canvasCenter.y - 140 * 2.5,
  );

  const playButtonInstance = await instanceCreate(
    canvasCenter.x,
    canvasCenter.y + 280,
    ButtonInstance,
    {
      atlasData: playButtonAtlas,
      anchorPoint: { x: 0.5, y: 0.5 },
      size: 1,
      global: global,
      action: playButtonAction,
    },
  );

  return [reelInstance, playButtonInstance, pointerHandInstance];
}

export async function createBackgroundInstances(global: GlobalState) {
  // const canvasCenter = {
  //   x: canvasCenterX(global.app),
  //   y: canvasCenterY(global.app),
  // };
  const BGTiledInstance = await instanceCreate(0, 0, BackGroundInstance, {
    sprite: <FromSprite>TILE01,
    global: global,
  });

  return [BGTiledInstance];
}
