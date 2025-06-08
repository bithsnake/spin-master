import { initDevtools } from "@pixi/devtools";
import {
  Application,
  Container,
  CullerPlugin,
  extensions,
  Graphics,
  Rectangle,
  Ticker,
} from "pixi.js";
import {
  GameObject,
  GlobalState,
  ReelInstance,
  UIGeneralText,
} from "./classes/class-library";

// import { track0, track2 } from "./utilities/soundLibrary";
import {
  BALANCE_INSTANCE,
  BG_CONTAINER,
  GAME_CONTAINER,
  INSTANCE_CONTAINER,
  UI_CONTAINER,
  WIN_INSTANCE,
} from "./utilities/container-name-library";
import {
  createBackgroundInstances,
  createGuiTextInstances,
  createInteractiveInstances,
} from "./utilities/instance-create-factory";
import { canvasCenterX } from "./utilities/tools";

(async () => {
  // await Assets.init();

  // Create a new application
  extensions.add(CullerPlugin);

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

  // --- instances ---
  const guiInstArray = <GameObject[]>await createGuiTextInstances(global);
  const instArray = <GameObject[]>await createInteractiveInstances(global);
  const reel = <ReelInstance>instArray[0];
  instArray.splice(0, 1);
  const bgInstArray = <GameObject[]>await createBackgroundInstances(global);

  // cover top and bottom
  const SYMBOL_AMOUNT = 3;
  const SYMBOL_SIZE = 128;
  const REEL_EDGE = 12;
  const REEL_WIDTH = SYMBOL_SIZE + REEL_EDGE * SYMBOL_AMOUNT;

  const margin = (app.screen.height - SYMBOL_SIZE * SYMBOL_AMOUNT) / 2;
  reel.self.y = margin;
  reel.self.x = canvasCenterX(app) - REEL_WIDTH / 2;
  reel.reelContainer.y = reel.self.y;
  reel.reelContainer.x = reel.self.x;

  const top = new Graphics().rect(0, 0, app.screen.width, margin).fill("black");
  const bottom = new Graphics()
    .rect(
      0,
      SYMBOL_SIZE * SYMBOL_AMOUNT + margin + REEL_EDGE,
      app.screen.width,
      margin,
    )
    .fill("black");

  // --- containers ---

  const reelContainer = new Container({
    label: "REEL_CONTAINER",
  });
  reelContainer.cullable = true;
  reelContainer.cullableChildren = true;
  reelContainer.addChild(reel.self);
  reelContainer.addChild(reel.reelContainer);

  // BG
  const bgContainer = new Container({
    label: BG_CONTAINER,
  });
  bgInstArray.forEach((inst) => {
    bgContainer.addChild(inst.self);
  });

  // INST
  const instanceContainer = new Container({
    label: INSTANCE_CONTAINER,
  });

  instanceContainer.addChild(reelContainer);
  instanceContainer.addChild(top);
  instanceContainer.addChild(bottom);
  instArray.forEach((inst) => {
    instanceContainer.addChild(inst.self);
  });

  // GUI
  const uiContainer = new Container({
    label: UI_CONTAINER,
  });
  guiInstArray.forEach((inst) => {
    console.log("inst: ", inst.self);
    uiContainer.addChild(inst.self);
  });

  const gameContainer = new Container({
    label: GAME_CONTAINER,
    sortableChildren: true,
    cullable: true,
    cullableChildren: true,
    cullArea: new Rectangle(0, 0, app.screen.width, app.screen.height),
  });

  gameContainer.addChild(bgContainer); // back layer
  gameContainer.addChild(instanceContainer); // middle layer

  gameContainer.addChild(uiContainer); // front layer

  // global.soundtrack = initSound(choose(track0, track2), 0.3, true);
  // global.soundtrack.play();
  global.reset();

  // array of anonymous function to run each instances own update function
  // with their proper function parameters that they need
  let deltaTime = 0;
  const updatables = [
    () => global.update(deltaTime),
    () => instArray.forEach((inst) => inst.update({ inst: global })),
    () => reel.update({ inst: global }),
    () =>
      guiInstArray.forEach((inst) => {
        if (inst.self.label === BALANCE_INSTANCE) {
          (<UIGeneralText>inst).value = global.currentDollars.toString();
          inst.update({ inst: global });
        }
        if (inst.self.label === WIN_INSTANCE) {
          (<UIGeneralText>inst).value = global.currentWinAmount.toString();
          inst.update({ inst: global });
        }
      }),
    () => bgInstArray.forEach((inst) => inst.update({ inst: global })),
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
})();
