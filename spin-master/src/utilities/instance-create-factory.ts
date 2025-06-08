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
import { canvasCenterX, canvasCenterY, createSprite } from "./tools";

import { GlobalState } from "../classes/class-library";
import { playButtonAction } from "../classes/button-class-actions";
import {
  playButtonAtlas,
  POINTER_HAND_ANIMS,
  pointerAtlasHand,
} from "./atlas-library";
import { SYMBOLS_LIST } from "./symbols-library";
import { BALANCE_INSTANCE, WIN_INSTANCE } from "./container-name-library";

// --- CENTER ---

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
      anchorPoint: "topLeft",
      title: "Balance: ",
      textSize: 1.5,
    },
  );
  GUIBalanceTextInstance.title = "Balance: ";
  GUIBalanceTextInstance.self.label = BALANCE_INSTANCE;

  const GUIWinTextInstance = await instanceCreate(
    canvasCenter.x + 225,
    32,
    UIGeneralText,
    {
      anchorPoint: "topLeft",
      title: "Win: ",
      textSize: 1.5,
    },
  );

  GUIWinTextInstance.title = "Win: ";
  GUIWinTextInstance.self.label = WIN_INSTANCE;

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

  const ri = reelInstance as ReelInstance;
  let index = 0;
  for (const symbol of ri.symbolIds) {
    const symbolSprite = await createSprite(
      6,
      0,
      "topLeft",
      { w: 1, h: 1 },
      symbol,
    );

    symbolSprite.label = `${symbol}_${index}`;
    symbolSprite.position.y =
      symbolSprite.height * 2 + -index * symbolSprite.height;

    ri.reelContainer.addChild(symbolSprite);

    ri.symbols.push({
      id: index,
      yStart: symbolSprite.y,
      sprite: symbolSprite,
    });

    index++;

    // all symbols added
    if (index === ri.symbolIds.length) {
      // sort the symbols since they were added asynchronously
      ri.symbols.sort((a, b) => {
        return a.id - b.id;
      });

      ri.reelContainer.children.sort((a, b) => {
        const firstIndex = +a.label.split("_")[1];
        const compareIndex = +b.label.split("_")[1];
        return firstIndex - compareIndex;
      });

      ri.countMax = ri.symbolIds.length;
      ri.lastYPosition = Math.abs(ri.symbols[ri.symbols.length - 1].yStart);
      ri.firstPosition = Math.abs(ri.symbols[0].yStart);
      ri.timerMax = global.spinTimerMax;
      ri.timer = ri.timerMax;

      for (const _symbol of ri.reelContainer.children) {
        _symbol.label = _symbol.label.split("_")[0];
        // @ts-expect-error force a property on sprite
        _symbol.startPosition = _symbol.position.y;
      }
      // ri.reelContainer.children.forEach((symbol) => {

      // });

      ri.visibleCounter = await instanceCreate(0, 512, UIGeneralText, {
        anchorPoint: "topLeft",
        title: "COUNTER: ",
        textSize: 1.5,
      });
    }
  }

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
