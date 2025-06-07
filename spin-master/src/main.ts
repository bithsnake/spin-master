import { initDevtools } from "@pixi/devtools";
import { Application, Container, Ticker } from "pixi.js";
import { GameObject, GlobalState } from "./classes/class-library";

// import { track0, track2 } from "./utilities/soundLibrary";
import {
  BG_CONTAINER,
  GAME_CONTAINER,
  INSTANCE_CONTAINER,
  UI_CONTAINER,
} from "./utilities/container-name-library";
import {
  createBackgroundInstances,
  createGuiTextInstances,
  createInteractiveInstances,
} from "./utilities/instance-create-factory";

(async () => {
  // await Assets.init();

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

  // --- instances ---
  const guiInstArray = <GameObject[]>await createGuiTextInstances(global);
  const instArray = <GameObject[]>await createInteractiveInstances(global);
  const bgInstArray = <GameObject[]>await createBackgroundInstances(global);

  // --- containers ---

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
    () => guiInstArray.forEach((inst) => inst.update({ inst: global })),
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
