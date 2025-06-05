import { initDevtools } from "@pixi/devtools";
import { Application, Assets, Sprite, Ticker } from "pixi.js";

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

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // // Load the bunny texture
  // const texture = await Assets.load("/assets/bunny.png");

  // // Create a bunny Sprite
  // const bunny = new Sprite(texture);

  // // Center the sprite's anchor point
  // bunny.anchor.set(0.5);

  // // Move the sprite to the center of the screen
  // bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // // Add the bunny to the stage
  // app.stage.addChild(bunny);

  // Listen for animate update
  let timer = 0;
  app.ticker.add((time: Ticker) => {
    if (timer < 10) {
      timer++;
      console.log(`Ticker time: ${time.elapsedMS} ms`);
    }
    // add logic to update state
  });
})();
