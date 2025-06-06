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
import {
  AnchorPoint,
  FromSprite,
  Point,
  Size,
  TextOptions,
} from "../types/types";
import {
  approach,
  canvasCenterX,
  canvasCenterY,
  createSprite,
  createText,
  createTiledSprite,
  getAppScreenHeight,
  getAppScreenWidth,
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
  time = 0;
  declare reel: Reel;
  elapsedTime = 0;
  dollarsMax = 100;
  currentDollars = this.dollarsMax;
  currentWinAmount = 0;
  currentWinAmountBuffer = 0;
  betAmount = 1;
  winAmountTextPos: Point = { x: 0, y: 0 };
  soundtrack = null;
  timeOut = null;
  gameCanRun = false;
  winAmountInst: UICurrentWinText[] = [];
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
    this.time = 0;
    this.elapsedTime = 0;
    this.currentDollars = this.dollarsMax;
    this.currentWinAmount = 0;
    this.currentWinAmountBuffer = 0;
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

export class UICurrentWinText extends GameObject {
  self: Text;
  value: number;
  timer = 0;
  private constructor(text: Text, value: number, global: GlobalState) {
    super();
    this.self = text;
    this.self.label = "scoreText";
    this.initDefaultSizes();
    playSound(sfxPoint, 1);
    this.value = value;
    global.currentWinAmountBuffer = this.value;
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
    win: number,
    global: GlobalState,
  ) {
    const text = await createText(x, y, anchorPoint, "", STYLE_KEY.normal, 2);
    return new UICurrentWinText(text, win, global);
  }

  update(global: { inst: GlobalState }): boolean {
    return this.routine(global.inst);
  }

  private routine(global: GlobalState): boolean {
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

export class UIBalanceText extends GameObject {
  self: Text;
  title: string;
  private constructor(text: Text) {
    super();
    this.title = text.text;
    this.self = text;
    this.self.label = "uiBalanceText";
    this.initDefaultSizes();
  }

  static async create(x: number, y: number, options: TextOptions) {
    const { anchorPoint, title, textSize } = options;
    const text = await createText(
      x,
      y,
      anchorPoint || "topLeft",
      title,
      STYLE_KEY.normal,
      textSize || 1.5,
    );
    return new UIBalanceText(text);
  }

  update(global: { inst: GlobalState }): void {
    this.routine(global.inst);
  }

  private routine(global: GlobalState): void {
    this.self.text = `${this.title} ${global.currentDollars}`;
  }
}

export class UIWinText extends GameObject {
  self: Text;
  title: string;
  timer = 0;
  private constructor(text: Text) {
    super();
    this.title = text.text;
    this.self = text;
    this.self.label = "uiWinText";
    this.initDefaultSizes();
  }

  static async create(x: number, y: number, options: TextOptions) {
    const { anchorPoint, title, textSize } = options;
    const text = await createText(
      x,
      y,
      anchorPoint || "topLeft",
      title,
      STYLE_KEY.normal,
      textSize || 1.5,
    );
    return new UIWinText(text);
  }

  update(global: { inst: GlobalState }): void {
    this.routine(global.inst);
  }

  private routine(global: GlobalState): void {
    this.timer++;
    this.self.text = `${this.title} ${global.currentWinAmount}`;

    if (global.currentWinAmount != global.currentWinAmountBuffer) {
      if (this.timer % 6 === 0) {
        global.currentWinAmount = approach(
          global.currentWinAmount,
          global.currentWinAmountBuffer,
          1,
        );
      }
    } else if (this.timer !== 0) {
      this.timer = 0;
    }
  }
}

export class BackGroundInstance extends GameObject {
  self: TilingSprite;
  constructor(x: number, y: number, bg: TilingSprite) {
    super();
    this.self = bg;
    this.self.position.set(x, y);
  }

  static async create(
    x: number,
    y: number,
    options: { sprite: FromSprite; global: GlobalState },
  ) {
    const { sprite, global } = options;
    const _sprite = await createTiledSprite(
      sprite,
      x,
      y,
      getAppScreenWidth(global.app),
      getAppScreenHeight(global.app),
      5,
      false,
    );
    return new BackGroundInstance(x, y, _sprite);
  }

  update(): void {
    this.scrollingBackgroundRoutine(-0.1, -0.1);
  }
  private scrollingBackgroundRoutine(hsp: number, vsp: number) {
    this.self.tilePosition.x += hsp;
    this.self.tilePosition.y += vsp;
  }
}
export class ReelInstance extends GameObject {
  declare self: Sprite;
  declare symbols: Sprite[];
  declare symbolIds: FromSprite[];
  container: Container = new Container();
  constructor(reel: Sprite, symbolIds: FromSprite[], global: GlobalState) {
    super();
    // reel
    this.symbolIds = symbolIds;
    this.self = reel;
    this.self.label = "reel";
    this.container.label = "reelContainer";
    this.container.position.set(
      canvasCenterX(global.app),
      canvasCenterY(global.app),
    );
    this.container.addChild(this.self);
    // symbols array
    this.symbolIds.forEach(async (symbol, index) => {
      const symbolSprite = await createSprite(
        0,
        0,
        "topLeft",
        { w: 1, h: 1 },
        symbol,
      );
      symbolSprite.anchor.set(0.5, 0);
      symbolSprite.position.set(reel.width / 2, index * symbolSprite.height);
      symbolSprite.label = `${symbol}_${index}`;
      this.self.addChild(symbolSprite);
      this.symbols.push(symbolSprite);
    });

    this.initDefaultSizes();
  }
  static async create(
    x: number = 0,
    y: number = 0,
    options: {
      anchorPoint: AnchorPoint;
      size: Size;
      reelSprite: FromSprite;
      symbolIds: FromSprite[];
      global: GlobalState;
    },
  ) {
    const { anchorPoint, size, reelSprite, symbolIds, global } = options;
    const reel = await createSprite(x, y, anchorPoint, size, reelSprite);
    return new ReelInstance(reel, symbolIds, global);
  }
  update(global: { inst: GlobalState }): void {
    this.reelRoutine(global);
  }

  reelRoutine(global: { inst: GlobalState }): void {
    if (!global.inst.gameCanRun) return;
  }
}

export async function instanceCreate<
  C extends { create: (...args: any[]) => Promise<any> },
>(
  x: number,
  y: number,
  cls: C,
  options: Parameters<C["create"]>[2],
): Promise<Awaited<ReturnType<C["create"]>>> {
  return cls.create(x, y, options);
}
