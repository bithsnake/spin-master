import { initDevtools } from "@pixi/devtools";
import { Application, Assets, Container, Ticker } from "pixi.js";
import {
  BackGroundInstance,
  ButtonInstance,
  GlobalState,
  instanceCreate,
  PointerInstance,
  ReelInstance,
  UIBalanceText,
  UISpinSecondsText,
  UIWinText,
} from "./classes/class-library";
import {
  canvasCenterX,
  canvasCenterY,
  choose,
  initSound,
} from "./utilities/tools";
import { FromSprite } from "./types/types";

import { REEL, TILE01 } from "./utilities/imageLibrary";
import { SYMBOLS_LIST } from "./utilities/symbols-library";
import {
  playButtonAtlas,
  POINTER_HAND_ANIMS,
  pointerAtlasHand,
} from "./utilities/atlas-library";
import { playButtonAction } from "./classes/button-class-actions";
import { track0, track2 } from "./utilities/soundLibrary";

(async () => {
  await Assets.init();

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    resizeTo: window,
    antialias: true,
    backgroundColor: 0x000000,
    backgroundAlpha: 0.99,
  });
  app.canvas.style.position = "absolute";
  app.renderer.resolution = window.devicePixelRatio || 1;

  // DEV TOOLS
  initDevtools({ app });

  // --- GLOBAL STATE ---
  const global = new GlobalState();
  global.app = app;
  global.gameIsStarted = true;
  global.gameCanRun = true;

  // --- CENTER ---
  const canvasCenter = {
    x: canvasCenterX(global.app),
    y: canvasCenterY(global.app),
  };

  const GUIWinText = await instanceCreate(canvasCenter.x - 512, 32, UIWinText, {
    anchorPoint: "topLeft",
    title: "Win: ",
    textSize: 1.5,
  });
  const GUISSpinSecondsText = await instanceCreate(
    canvasCenter.x - 512,
    128,
    UISpinSecondsText,
    {
      anchorPoint: "topLeft",
      title: "Sec: ",
      textSize: 1.5,
    },
  );

  const GUIBalanceText = await instanceCreate(
    canvasCenter.x + 112,
    32,
    UIBalanceText,
    {
      anchorPoint: "topLeft",
      title: "Balance: ",
      textSize: 1.5,
    },
  );

  const GUIPlayButton = await instanceCreate(
    canvasCenter.x,
    canvasCenter.y + 334,
    ButtonInstance,
    {
      atlasData: playButtonAtlas,
      anchorPoint: { x: 0.5, y: 0.5 },
      size: 1,
      global: global,
      action: playButtonAction,
    },
  );

  const BGTiled = await instanceCreate(0, 0, BackGroundInstance, {
    sprite: <FromSprite>TILE01,
    global: global,
  });

  const reel = await instanceCreate(
    canvasCenter.x,
    canvasCenter.y,
    ReelInstance,
    {
      anchorPoint: "center",
      size: { w: 1, h: 1 },
      reelSprite: REEL,
      symbolIds: SYMBOLS_LIST,
      global: global,
    },
  );

  const pointer = await instanceCreate(
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

  const bgContainer = new Container();
  bgContainer.label = "bgContainer";
  bgContainer.addChild(BGTiled.self);

  const instanceContainer = new Container();
  instanceContainer.label = "instanceContainer";

  instanceContainer.addChild(reel.self);

  const uiContainer = new Container();
  uiContainer.label = "uiContainer";
  uiContainer.addChild(GUIWinText.self);
  uiContainer.addChild(GUISSpinSecondsText.self);
  uiContainer.addChild(GUIBalanceText.self);
  uiContainer.addChild(GUIPlayButton.self);
  uiContainer.addChild(pointer.self);

  const gameContainer = new Container();
  gameContainer.label = "gameContainer";
  gameContainer.sortableChildren = true;

  gameContainer.addChild(bgContainer); // back layer
  gameContainer.addChild(instanceContainer); // middle layer
  gameContainer.addChild(uiContainer); // front layer

  global.soundtrack = initSound(choose(track0, track2), 0.3, true);
  global.soundtrack.play();
  global.reset();

  // array of anonymous function to run each instances own update function
  // with their proper function parameters that they need
  let deltaTime = 0;
  const updatables = [
    () => global.update(deltaTime),
    () => GUIWinText.update({ inst: global }),
    () => GUISSpinSecondsText.update({ inst: global }),
    () => GUIBalanceText.update({ inst: global }),
    () => GUIPlayButton.update({ inst: global }),
    () => pointer.update(),
    () => BGTiled.update(),
  ];

  global.app.stage.addChild(gameContainer);
  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Listen for animate update
  app.ticker.add((time: Ticker) => {
    // add logic to update state
    deltaTime = time.deltaTime;
    updatables.forEach((fn) => fn());
  });

  // GLOBAL LISTENERS
})();
