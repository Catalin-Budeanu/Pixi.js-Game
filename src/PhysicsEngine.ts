import * as PIXI from 'pixi.js';

export class PhysicsEngine {
  private gravity: number;
  private readonly GRAVITY_SCALE = 250;

  constructor(gravityValue: number) {
    this.gravity = gravityValue;
  }

  setGravity(value: number) {
    this.gravity = value;
  }

  update(
    shape: PIXI.Graphics,
    deltaTime: number,
    bounds: { x: number; y: number; width: number; height: number },
  ): void {
    const velocity = (shape as any).velocity;
    const shapeSize = (shape as any).size || 30;

    velocity.y += this.gravity * this.GRAVITY_SCALE * deltaTime;

    shape.x += velocity.x * deltaTime;
    shape.y += velocity.y * deltaTime;

    const shapeBounds = shape.getBounds();

    if (shape.x - shapeBounds.width / 2 <= bounds.x) {
      shape.x = bounds.x + shapeBounds.width / 2;
      velocity.x = 0;
    } else if (shape.x + shapeBounds.width / 2 >= bounds.width) {
      shape.x = bounds.width - shapeBounds.width / 2;
      velocity.x = 0;
    }

    const isOutsideTop = shape.y + shapeSize < bounds.y;
    const isOutsideBottom = shape.y - shapeSize > bounds.height;
    const isOutsideLeft = shape.x + shapeSize < bounds.x;
    const isOutsideRight = shape.x - shapeSize > bounds.width;

    if (isOutsideTop || isOutsideBottom || isOutsideLeft || isOutsideRight) {
      shape.visible = false;
    } else {
      shape.visible = true;
    }
  }
}
