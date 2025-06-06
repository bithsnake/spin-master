import { FederatedPointerEvent, AnimatedSprite } from "pixi.js";
import { sfxCashRegister } from "../utilities/soundLibrary";
import { playSound } from "../utilities/tools";
import {
  GlobalState,
  ButtonInstance,
  instanceCreate,
  UIScrollingText,
} from "./class-library";

export const playButtonAction = (
  global: GlobalState,
  selfInst: ButtonInstance,
  event: FederatedPointerEvent,
) => {
  console.log("PLAY");
  console.log("the event: ", event);
  if (!global.gameCanRun) return;
  if (global.spinTimer > 0) return;
  if (!global.gameIsStarted) {
    global.gameIsStarted = true;
    global.elapsedTime -= 1000;
  }

  global.spinTimer = global.spinTimerMax;
  if (global.currentDollars > 0) {
    playSound(sfxCashRegister, 1);
    global.currentDollars -= global.betAmount;

    console.log("PLAY");

    instanceCreate(
      selfInst.self.x - 64,
      selfInst.self.y - 256,
      UIScrollingText,
      {
        label: "bet",
        anchorPoint: "topLeft",
        value: `-${global.betAmount}`,
        global: global,
        dir: "up",
      },
    );
  }
  // set frame
  (<AnimatedSprite>selfInst.self).currentFrame =
    global.currentDollars > 0 ? 0 : 1;
};
