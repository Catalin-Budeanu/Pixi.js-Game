import * as PIXI from 'pixi.js';

export class CanvasArea {
  view: PIXI.Graphics;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.view = new PIXI.Graphics();
    this.draw();
  }

  private draw() {
    this.view.clear();

    this.view.rect(0, 0, this.width, this.height);
    this.view.stroke({ width: 4, color: 0xffffff });

    this.view.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);
  }

  getBounds() {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  destroy() {
    this.view.destroy();
  }
}
