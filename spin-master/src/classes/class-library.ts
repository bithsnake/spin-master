import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TilingSprite,
} from "pixi.js";
import { IRenderable, IUpdatable } from "../interfaces/interfaces";
import { AnchorPoint, FromSprite, Point, Size } from "../types/types";
import {
  approach,
  createSprite,
  createText,
  playSound,
} from "../utilities/tools";
import { sfxPoint } from "../utilities/soundLibrary";
import { STYLE_KEY } from "../utilities/style-library";

const minute = 60 * 60;

export class GlobalState implements IUpdatable {
  app!: Application;
  timer = 0;
  timerSpeed = 2;
  intervalMax = 5;
  interval = this.intervalMax;
  count = 0;
  winsMax = 3;
  wins = 0;
  time = 0;
  timeMax = 3;
  elapsedTime = 0;
  dollarsMax = 100;
  currentDollars = this.dollarsMax;
  winAmountTextPos: Point = { x: 0, y: 0 };
  soundtrack = null;
  timeOut = null;
  gameCanRun = false;
  winAmountInst: UIText[] = []; // UiScoreText[];
  doBlur = false;
  private _gameIsStared = false;
  private _finishedStage = false;

  get finishedStage(): boolean {
    return this._finishedStage;
  }
  set finishedStage(value: boolean) {
    this._finishedStage = value;
  }
  get gameIsStarted(): boolean {
    return this._gameIsStared;
  }

  set gameIsStarted(value: boolean) {
    this._gameIsStared = value;
  }

  update(delta: number): void {
    this.globalStateRoutine(delta);
  }

  reset(): void {
    this.timer = 0;
    this.interval = this.intervalMax;
    this.count = 0;
    this.wins = 0;
    this.time = 0;
    this.elapsedTime = 0;
    this.currentDollars = this.dollarsMax;
    this.timeOut = null;
    this.winAmountInst = [];
  }

  globalStateRoutine(delta: number): void {
    if (!this.gameIsStarted || this.finishedStage) {
      this.gameCanRun = false;
    } else {
      this.gameCanRun = true;
    }

    // if game is not started, do not run code
    if (!this.gameIsStarted) return;

    this.timer = this.timer < minute ? this.timer++ : 0;

    // elapsed time is incremented by delta
    this.elapsedTime += delta * (1000 / 60);
  }
}

export abstract class GameObject implements IRenderable, IUpdatable {
  declare self:
    | Sprite
    | AnimatedSprite
    | Graphics
    | TilingSprite
    | Container
    | Text;
  other?: unknown;
  isGrounded = false;
  hsp = 0;
  vsp = 0;
  size = { m: 5, l: 5 * 1.2, xl: 5 * 1.5 };
  abstract update(...args: unknown[]): void;

  initDefaultSizes() {
    this.size = {
      m: this.self.scale.x,
      l: this.self.scale.x * 1.2,
      xl: this.self.scale.x * 1.5,
    };
  }
}

export class Button extends GameObject {
  self: Sprite | AnimatedSprite;
  action: () => unknown;

  constructor(
    button: Sprite | AnimatedSprite,
    action: (...args: unknown[]) => unknown,
  ) {
    super();
    this.self = button;
    this.action = action;
    this.initDefaultSizes();
  }

  static async create(
    x: number = 0,
    y: number = 0,
    anchorPoint: AnchorPoint = "topLeft",
    size: Size = { w: 1, h: 1 },
    sprite: FromSprite,
    action: (...args: unknown[]) => unknown,
  ) {
    const button = await createSprite(x, y, anchorPoint, size, sprite);
    return new Button(button, action);
  }
  update(): void {
    // no-op
  }
}

export class UIText extends GameObject {
  self: Text;
  value: number;
  static: boolean = true;
  timer = 0;
  private constructor(text: Text, value: number, global: GlobalState) {
    super();
    this.self = text;
    this.self.label = "scoreText";
    this.initDefaultSizes();
    playSound(sfxPoint, 1);
    this.value = value;
    global.app.stage.children.forEach((container) => {
      if (container.label === "gameContainer") {
        global.winAmountInst.push(this);
        container.addChild(this.self);
      }
    });
  }

  static async create(
    x: number,
    y: number,
    anchorPoint: AnchorPoint,
    score: number,
    global: GlobalState,
  ) {
    const text = await createText(x, y, anchorPoint, "", STYLE_KEY.normal, 2);
    return new UIText(text, score, global);
  }

  update(global: { inst: GlobalState }): boolean {
    return this.scoreTextRoutine(global.inst);
  }

  private scoreTextRoutine(global: GlobalState): boolean {
    this.timer++;
    this.self.text = `+${this.value}`;

    if (this.timer % 6 === 0) {
      this.self.alpha = approach(this.self.alpha, 0, 0.05);
      this.self.position.y -= 4;
      this.self.scale.set(this.self.scale.x - 0.01, this.self.scale.y - 0.01);
    }
    if (this.self.alpha <= 0) {
      this.self.alpha = 0;
      this.self.visible = false;
      this.self.destroy();
      // remove reference of text instance in the global state object
      const idx = global.winAmountInst.indexOf(this);
      if (idx !== -1) {
        global.winAmountInst.splice(idx, 1);
      }
      return true;
    }
    return false;
  }
}

/**
 * Class to create instances of classes asynchronously.
 */
export class Instance {
  /**
   * Create an instance of the given class asynchronously.
   * @param {number} x - x pos.
   * @param {number} y - y pos.
   * @param {C} cls - the class to create the instance of.
   * @param {Options} [options] - options to pass to the class constructor.
   * @returns {Promise<T>} - returns the instance of the class.
   */
  static async create<
    C extends {
      create: (x: number, y: number, options: unknown) => Promise<T>;
    },
    T = Awaited<ReturnType<C["create"]>>,
    Options = Parameters<C["create"]>[2],
  >(x: number, y: number, cls: C, options?: Options): Promise<T> {
    return await cls.create(x, y, options);
  }
}
