import {
  AnimatedSprite,
  Application,
  Container,
  FederatedPointerEvent,
  Graphics,
  Rectangle,
  Sprite,
  Text,
  TilingSprite,
} from "pixi.js";
import { IRenderable, IUpdatable } from "../interfaces/interfaces";
import {
  AnchorPoint,
  AtlasData,
  Direction,
  FromSprite,
  Point,
  Size,
  TextOptions,
} from "../types/types";
import {
  approach,
  createAnimatedSprite,
  createSprite,
  createText,
  createTiledSprite,
  getAppScreenHeight,
  getAppScreenWidth,
  getAppStageHeight,
  getAppStageWidth,
  lerp,
} from "../utilities/tools";

import { STYLE_KEY } from "../utilities/style-library";
import { playButtonAtlas, pointerAtlasHand } from "../utilities/atlas-library";
import {
  GAME_CONTAINER,
  REEL_CONTAINER,
} from "../utilities/container-name-library";

export class GlobalState implements IUpdatable {
  app!: Application;
  canPress = false;
  spinTimerMax = 2;
  spinTimer = 0;
  timerSpeed = 2;
  intervalMax = 5;
  interval = this.intervalMax;
  count = 0;
  time = 0;
  declare reel: ReelInstance;
  elapsedTime = 0;
  dollarsMax = 100;
  currentDollars = this.dollarsMax;
  currentWinAmount = 0;
  currentWinAmountBuffer = 0;
  betAmount = 1;
  winAmountTextPos: Point = { x: 0, y: 0 };
  soundtrack: Howl | null = null;
  timeOut = null;
  gameCanRun = false;
  textInst: UIText[] = [];
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

  update(delta?: number): void {
    this.routine(delta || 0);
  }

  reset(): void {
    this.spinTimer = 0;
    this.interval = this.intervalMax;
    this.count = 0;
    this.time = 0;
    this.elapsedTime = 0;
    this.currentDollars = this.dollarsMax;
    this.currentWinAmount = 0;
    this.currentWinAmountBuffer = 0;
    this.timeOut = null;
    this.textInst = [];
  }

  routine(delta: number): void {
    if (!this.gameIsStarted || this.finishedStage) {
      this.gameCanRun = false;
    } else {
      this.gameCanRun = true;
    }

    // if game is not started, do not run code
    if (!this.gameIsStarted) return;

    if (this.textInst.length > 0) {
      this.textInst.forEach((text) => {
        text.update(this);
      });
    }

    // this.timer = this.timer < minute ? this.timer++ : 0;

    // elapsed time is incremented by delta
    if (this.spinTimer > 0) {
      this.elapsedTime += delta * (1000 / 60);
    } else {
      this.elapsedTime = 0;
    }

    if (this.elapsedTime >= 1000 && this.spinTimer > 0) {
      this.spinTimer--;
      this.elapsedTime -= 1000;
      console.log("this.spinTimer: ", this.spinTimer);
    }
    if (this.spinTimer === 0) {
      // something
    }
  }
}

// --- ABSTRACT CLASSES ---
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
  protected abstract stepEvent(...args: unknown[]): void;
  // protected abstract drawEvent(delta: number, ...args: unknown[]): void;

  initDefaultSizes() {
    this.size = {
      m: this.self.scale.x,
      l: this.self.scale.x * 1.2,
      xl: this.self.scale.x * 1.5,
    };
  }

  isOutsideStage(
    global: GlobalState,
    sprite:
      | Sprite
      | AnimatedSprite
      | Graphics
      | TilingSprite
      | Container
      | Text,
  ) {
    return (
      sprite.position.x + this.self.width < 0 ||
      sprite.position.x > getAppStageWidth(global.app) ||
      sprite.position.y + this.self.height < 0 ||
      sprite.position.y > getAppStageHeight(global.app)
    );
  }
}

export abstract class UIText extends GameObject {
  declare self: Text;
  value: string;
  timer = 0;
  constructor(text: Text, value: string, global: GlobalState) {
    super();
    this.self = text;
    this.initDefaultSizes();
    this.value = value;
    global.app.stage.children.forEach((container) => {
      if (container.label === GAME_CONTAINER) {
        global.textInst.push(this);
        container.addChild(this.self);
      }
    });
  }
  destroyInstRef(global: GlobalState) {
    const idx = global.textInst.indexOf(this);
    if (idx !== -1) {
      global.textInst.splice(idx, 1);
    }
  }
}

// --- INTERACTIVE CLASSES ---
export class PointerInstance extends GameObject {
  self: AnimatedSprite;
  mousePosition: Point = { x: 0, y: 0 };
  mouseDown: { hold: boolean; event: MouseEvent | null } = {
    hold: false,
    event: null,
  };
  private constructor(sprite: AnimatedSprite) {
    super();
    this.self = sprite;
    this.self.label = "pointer";
    this.self.visible = true;
    this.initDefaultSizes();

    window.addEventListener("mousemove", (event) => {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
      if (this.mouseDown.hold) {
        this.mouseDown.event = event;
      }
    });
    window.addEventListener("mouseup", (event) => {
      this.mouseDown = { hold: false, event: event };
    });
    window.addEventListener("mousedown", (event) => {
      this.mouseDown = { hold: true, event: event };
    });
  }

  static async create(
    x: number,
    y: number,
    options?: {
      _pointerAtlas: AtlasData;
      anim: string;
      animate: boolean;
      speed: number;
      anchorPoint: Point;
    },
  ): Promise<PointerInstance> {
    if (!options)
      return new PointerInstance(
        await createAnimatedSprite(pointerAtlasHand, x, y, { x: 0, y: 0 }, 5, {
          anim: "pick",
          animate: false,
          speed: 0.1,
        }),
      );
    const { _pointerAtlas, anim, animate, speed, anchorPoint } = options;
    const sprite = await createAnimatedSprite(
      _pointerAtlas || pointerAtlasHand,
      x,
      y,
      anchorPoint,
      5,
      {
        anim,
        animate,
        speed,
      },
    );
    return new PointerInstance(sprite);
  }

  update() {
    this.stepEvent();
  }

  protected stepEvent() {
    this.self.currentFrame = this.mouseDown.hold ? 1 : 0;
    document.body.style.cursor = "none";
    this.self.position.set(this.mousePosition.x, this.mousePosition.y);
  }
}

export class ReelInstance extends GameObject {
  declare self: Sprite;
  declare visibleCounter: UIGeneralText;
  declare symbolIds: FromSprite[];
  symbols: { id: number; yStart: number; sprite: Sprite }[] = [];
  count = 0;
  countMax = 0;
  timer = 0;
  timerMax = 0;
  firstPosition = 0;
  lastYPosition = 0;
  reelContainer: Container = new Container();
  constructor(reel: Sprite, symbolIds: FromSprite[], global: GlobalState) {
    super();
    // reel
    this.symbolIds = symbolIds;
    this.self = reel;
    this.self.label = "reel";
    this.self.interactive = true;
    this.reelContainer.label = REEL_CONTAINER;
    // this.reelContainer.cullable = true;
    // this.reelContainer.cullableChildren = true;
    // this.reelContainer.position.set(
    //   this.self.x - this.self.width / 2,
    //   this.self.y,
    // );
    // this.reelContainer.cullArea = new Rectangle(
    //   0,
    //   0,
    //   this.self.width,
    //   this.self.height,
    // );

    (async () => {
      // this.symbolIds.forEach(async (symbol, index) => {
      //   const symbolSprite = await createSprite(
      //     6,
      //     0,
      //     "topLeft",
      //     { w: 1, h: 1 },
      //     symbol,
      //   );
      //   symbolSprite.label = `${symbol}_${index}`;
      //   symbolSprite.position.y = -index * symbolSprite.height;
      //   this.reelContainer.addChild(symbolSprite);
      //   this.symbols.push({
      //     id: index,
      //     yStart: symbolSprite.y,
      //     sprite: symbolSprite,
      //   });
      //   // all symbols added
      //   if (index === this.symbolIds.length - 1) {
      //     // sort the symbols since they were added asynchronously
      //     this.symbols.sort((a, b) => {
      //       return a.id - b.id;
      //     });
      //     this.reelContainer.children.sort((a, b) => {
      //       const firstIndex = +a.label.split("_")[1];
      //       const compareIndex = +b.label.split("_")[1];
      //       return firstIndex - compareIndex;
      //     });
      //     this.countMax = this.symbolIds.length;
      //     this.lastYPosition = this.symbols[this.symbols.length - 1].yStart;
      //     this.timerMax = global.spinTimerMax;
      //     this.timer = this.timerMax;
      //     this.reelContainer.children.forEach((symbol) => {
      //       symbol.label = symbol.label.split("_")[0];
      //       // @ts-expect-error force a property on sprite
      //       symbol.startPosition = symbol.position.y;
      //     });
      //     this.visibleCounter = await instanceCreate(0, 512, UIGeneralText, {
      //       anchorPoint: "topLeft",
      //       title: "COUNTER: ",
      //       textSize: 1.5,
      //     });
      //   }
      // });
    })();

    this.initDefaultSizes();
  }

  static async create(
    x: number,
    y: number,
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
    this.stepEvent(global);
    // this.reelContainer.children.forEach((symbol) => {
    //   if (
    //     symbol.position.y + symbol.height < 0 ||
    //     symbol.position.y > this.self.height
    //   ) {
    //     symbol.renderable = false;
    //     symbol.visible = false;
    //   } else {
    //     symbol.renderable = true;
    //     symbol.visible = true;
    //   }
    // });
  }

  protected stepEvent(global: { inst: GlobalState }): void {
    const gl = global.inst;
    const gameContainer = gl.app.stage.getChildByLabel(GAME_CONTAINER);
    if (gameContainer !== null) {
      if (gameContainer.children.indexOf(this.visibleCounter.self) === -1) {
        gameContainer.addChild(this.visibleCounter.self);
      }
    }

    if (!gl.gameCanRun) return;

    if (gl.spinTimer > 0) {
      global.inst.canPress = false;
      // lerp
      this.timer = lerp(this.timer, 0, 0.01);
      this.count = this.count >= this.countMax - 1 ? 0 : this.count + 1;
      this.reelContainer.children.forEach((symbol, index) => {
        symbol.position.y += 32 * this.timer * 0.5;
        if (
          Math.floor(symbol.position.y + symbol.height) > this.lastYPosition
        ) {
          console.log("my index: ", index);
          const lastSymbol =
            this.reelContainer.children[
              this.reelContainer.children.length - 1 - index
            ];
          console.log("lastSymbol: ", lastSymbol, lastSymbol.position.y);
          // go back to first position - 1 position to keep the reel infinite
          // const firstPosition = -128 * (this.countMax - 1);
          const firstPosition = -128 * 4;
          symbol.position.y = firstPosition;
          console.log("my new position: ", symbol.position.y);
        }
      });
      console.log(this.count);
    } else {
      let canPress = false;
      this.reelContainer.children.forEach((symbol, index) => {
        if (Math.floor(symbol.position.y) % symbol.height !== 0) {
          symbol.position.y = Math.floor((symbol.position.y -= 1));
        }
      });

      this.reelContainer.children.every((symbol, index) => {
        if (Math.floor(symbol.position.y) % symbol.height === 0) {
          canPress = true;
        }
      });

      if (canPress) {
        global.inst.canPress = true;
      }
      this.timer = this.timerMax;
    }
    this.visibleCounter.value = this.count.toString();
    this.visibleCounter.update(global.inst);
  }
}

export class ButtonInstance extends GameObject {
  self: Sprite | AnimatedSprite;
  yStart = 0;
  scaleStart: Point = { x: 0, y: 0 };
  action: (
    global: GlobalState,
    selfInst: ButtonInstance,
    event: FederatedPointerEvent,
  ) => void;

  constructor(
    button: Sprite | AnimatedSprite,
    global: GlobalState,
    action: (
      global: GlobalState,
      selfInst: ButtonInstance,
      event: FederatedPointerEvent,
    ) => void,
  ) {
    super();
    this.self = button;
    this.self.interactive = true;
    this.action = action;

    this.self.on("pointerdown", (_event: FederatedPointerEvent) => {
      this.action(global, this, _event);
    });
    this.initDefaultSizes();
  }

  static async create(
    x: number,
    y: number,
    options: {
      atlasData: AtlasData;
      anchorPoint: Point;
      size: number;
      global: GlobalState;
      action: (
        global: GlobalState,
        selfInst: ButtonInstance,
        event: FederatedPointerEvent,
      ) => void;
    },
  ) {
    const { atlasData, anchorPoint, size, global, action } = options;

    const button = await createAnimatedSprite(
      atlasData || playButtonAtlas,
      x,
      y,
      anchorPoint,
      size,
      {
        anim: "normal",
        animate: false,
        speed: 0,
      },
    );
    return new ButtonInstance(button, global, action);
  }
  update(global: { inst: GlobalState }): void {
    this.stepEvent(global.inst);
  }

  protected stepEvent(global: GlobalState): void {
    if (!global.gameCanRun) return;
  }
}
// --- UI CLASSES ---
export class UIScrollingText extends UIText {
  declare self: Text;
  value: string;
  timer = 0;
  dir: Direction = "up";
  private constructor(
    text: Text,
    dir: Direction,
    value: string,
    global: GlobalState,
  ) {
    super(text, value, global);
    this.initDefaultSizes();
    this.dir = dir;
    this.value = value;
  }

  static async create(
    x: number,
    y: number,
    options: {
      label: string;
      anchorPoint: AnchorPoint;
      value: string;
      global: GlobalState;
      dir: Direction;
    },
  ) {
    const { label, anchorPoint, dir, value, global } = options;
    const text = await createText(
      x,
      y,
      anchorPoint,
      value,
      STYLE_KEY.normal,
      2,
      null,
      label,
    );
    text.label = label;
    return new UIScrollingText(text, dir, value, global);
  }

  update(global: GlobalState): void {
    this.stepEvent(global);
  }

  protected stepEvent(global: GlobalState): void {
    this.timer++;
    this.self.text = `${this.value}`;

    if (this.timer % 6 === 0) {
      this.self.alpha = approach(this.self.alpha, 0, 0.05);

      if (this.dir === "up") {
        this.self.position.y -= 4;
      } else if (this.dir === "down") {
        this.self.position.y += 4;
      }
      this.self.position.x += 0.4;

      // to compesate the x position to keep it in its x positiion while the scaling down that happens, fix later
      this.self.scale.set(this.self.scale.x - 0.01, this.self.scale.y - 0.01);
    }
    if (this.self.alpha <= 0) {
      this.self.alpha = 0;
      this.self.visible = false;
      this.self.destroy();
      this.destroyInstRef(global);
    }
  }
}

export class UIGeneralText extends GameObject {
  self: Text;
  title: string;
  value = "";
  private constructor(text: Text) {
    super();
    this.title = text.text;
    this.self = text;
    this.self.label = "uiGeneralText";
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
    return new UIGeneralText(text);
  }

  update(global: GlobalState): void {
    this.stepEvent(global);
  }

  protected stepEvent(global: GlobalState): void {
    if (global.gameCanRun === false) {
      this.self.text = "GAME NOT RUNNING";
    }
    this.self.text = `${this.title} ${this.value}`;
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
    this.stepEvent(-0.1, -0.1);
  }
  protected stepEvent(hsp: number, vsp: number) {
    this.self.tilePosition.x += hsp;
    this.self.tilePosition.y += vsp;
  }
}

export async function instanceCreate<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends { create: (...args: any[]) => Promise<any> },
>(
  x: number,
  y: number,
  cls: C,
  options: Parameters<C["create"]>[2],
): Promise<Awaited<ReturnType<C["create"]>>> {
  return cls.create(x, y, options);
}
