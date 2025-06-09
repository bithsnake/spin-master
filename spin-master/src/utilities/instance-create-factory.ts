import {
  BackGroundInstance,
  ButtonInstance,
  instanceCreate,
  PointerInstance,
  ReelInstance,
  UIGeneralText,
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
import { BALANCE_INSTANCE, WIN_INSTANCE } from "./container-name-library";

export async function createGuiTextInstances(global: GlobalState) {
  const canvasCenter = {
    x: canvasCenterX(global.app),
    y: canvasCenterY(global.app),
  };

  const GUIBalanceTextInstance = await instanceCreate(
    canvasCenter.x - 580,
    32,
    UIGeneralText,
    {
      label: BALANCE_INSTANCE,
      anchorPoint: "topLeft",
      title: "Balance: ",
      textSize: 1.5,
    },
  );

  GUIBalanceTextInstance.title = "Balance: $";

  const GUIWinTextInstance = await instanceCreate(
    canvasCenter.x + 225,
    32,
    UIGeneralText,
    {
      label: WIN_INSTANCE,
      anchorPoint: "topLeft",
      title: "Win: ",
      textSize: 1.5,
    },
  );

  GUIWinTextInstance.title = "Win: $";

  return [GUIWinTextInstance, GUIBalanceTextInstance];
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
      _pointerAtlas: pointerAtlasHand,
      anim: POINTER_HAND_ANIMS.pick,
      animate: false,
      speed: 0.1,
      anchorPoint: { x: 0.6, y: 0.4 },
    },
  );

  const reelInstance = await instanceCreate(0, 0, ReelInstance, {
    anchorPoint: "topLeft",
    size: { w: 1, h: 1 },
    reelSprite: REEL,
    symbolIds: SYMBOLS_LIST,
    global: global,
  });

  const playButtonInstance = await instanceCreate(
    canvasCenter.x,
    canvasCenter.y + 280,
    ButtonInstance,
    {
      atlasData: playButtonAtlas,
      anchorPoint: { x: 0, y: 0 },
      size: 1,
      global: global,
      action: playButtonAction,
      other: reelInstance,
    },
  );
  const p = playButtonInstance;
  p.self.position.x = canvasCenter.x - p.self.width / 2 - 8;

  return [reelInstance, playButtonInstance, pointerHandInstance];
}

export async function createBackgroundInstances(global: GlobalState) {
  const BGTiledInstance = await instanceCreate(0, 0, BackGroundInstance, {
    sprite: <FromSprite>TILE01,
    global: global,
  });

  return [BGTiledInstance];
}
