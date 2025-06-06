import { initDevtools } from "@pixi/devtools";
import { Application, Assets, Container, Ticker } from "pixi.js";
import {
  BackGroundInstance,
  GlobalState,
  instanceCreate,
  ReelInstance,
  UIBalanceText,
  UIWinText,
} from "./classes/class-library";
import { canvasCenterX, canvasCenterY } from "./utilities/tools";
import { FromSprite } from "./types/types";

import { REEL, TILE01 } from "./utilities/imageLibrary";
import { SYMBOLS_LIST } from "./utilities/symbols-library";

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

  const bgContainer = new Container();
  bgContainer.label = "bgContainer";
  bgContainer.addChild(BGTiled.self);

  const instanceContainer = new Container();
  instanceContainer.label = "instanceContainer";

  instanceContainer.addChild(reel.self);

  const uiContainer = new Container();
  uiContainer.label = "uiContainer";
  uiContainer.addChild(GUIWinText.self);
  uiContainer.addChild(GUIBalanceText.self);

  const gameContainer = new Container();
  gameContainer.label = "gameContainer";
  gameContainer.sortableChildren = true;

  gameContainer.addChild(bgContainer);

  gameContainer.addChild(instanceContainer);

  gameContainer.addChild(uiContainer);

  // global.soundtrack = initSound(choose(track0, track2), 0.3, true);
  global.reset();

  // array of anonymous function to run each instances own update function
  // with their proper function parameters that they need
  const updatables = [
    () => GUIWinText.update({ inst: global }),
    () => GUIBalanceText.update({ inst: global }),
    () => BGTiled.update(),
  ];

  global.app.stage.addChild(gameContainer);
  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Listen for animate update

  app.ticker.add((time: Ticker) => {
    updatables.forEach((fn) => fn());
    // add logic to update state
  });
})();
