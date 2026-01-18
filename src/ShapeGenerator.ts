import * as PIXI from 'pixi.js';

export const ShapeType = {
  Triangle: 3,
  Square: 4,
  Pentagon: 5,
  Hexagon: 6,
  Circle: 0,
  Ellipse: -1,
  Star: -2,
} as const;

export type ShapeType = (typeof ShapeType)[keyof typeof ShapeType];

export class ShapeGenerator {
  private shapeTypes = [
    ShapeType.Triangle,
    ShapeType.Square,
    ShapeType.Pentagon,
    ShapeType.Hexagon,
    ShapeType.Circle,
    ShapeType.Ellipse,
    ShapeType.Star,
  ];

  private colors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800,
    0x8800ff, 0xff0088, 0x00ff88,
  ];

  createRandomShape(x: number, y: number): PIXI.Graphics {
    const type = this.getRandomShapeType();
    const color = this.getRandomColor();
    const size = this.getRandomSize();

    return this.createShape(type, x, y, color, size);
  }

  private createShape(
    type: ShapeType,
    x: number,
    y: number,
    color: number,
    size: number,
  ): PIXI.Graphics {
    const shape = new PIXI.Graphics();

    shape.x = x;
    shape.y = y;

    (shape as any).velocity = { x: 0, y: 0 };
    (shape as any).shapeType = type;
    (shape as any).size = size;

    switch (type) {
      case ShapeType.Circle:
        shape.circle(0, 0, size);
        break;
      case ShapeType.Ellipse:
        shape.ellipse(0, 0, size * 1.2, size * 0.7);
        break;
      case ShapeType.Star:
        this.drawStar(shape, size);
        break;
      default:
        this.drawPolygon(shape, type, size);
    }

    shape.fill(color);
    shape.stroke({ width: 2, color: 0x000000 });

    return shape;
  }

  private drawPolygon(graphics: PIXI.Graphics, sides: number, radius: number) {
    const points: number[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    graphics.poly(points);
  }

  private drawStar(graphics: PIXI.Graphics, size: number) {
    const points: number[] = [];
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    graphics.poly(points);
  }

  private getRandomShapeType(): ShapeType {
    return this.shapeTypes[Math.floor(Math.random() * this.shapeTypes.length)];
  }

  private getRandomColor(): number {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  private getRandomSize(): number {
    return Math.random() * 15 + 25;
  }
}
