import * as PIXI from 'pixi.js';
import { CanvasArea } from './CanvasArea';
import { ShapeGenerator } from './ShapeGenerator';
import { PhysicsEngine } from './PhysicsEngine';
import './style.css';

class Application {
  private app!: PIXI.Application;
  private canvasArea!: CanvasArea;
  private shapeGenerator!: ShapeGenerator;
  private physicsEngine!: PhysicsEngine;

  private shapes: PIXI.Graphics[] = [];
  private lastSpawnTime: number = 0;
  private spawnRate: number = 1;
  private gravity: number = 1;

  private shapeCountElement!: HTMLElement;
  private surfaceAreaElement!: HTMLElement;
  private spawnRateValueElement!: HTMLElement;
  private gravityValueElement!: HTMLElement;

  constructor() {
    this.init();
  }

  private async init() {
    const canvasSize = this.getCanvasSize();

    this.app = new PIXI.Application();
    await this.app.init({
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 0x2c2c2c,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const appDiv = document.getElementById('pixi-container')!;
    appDiv.appendChild(this.app.canvas);

    this.canvasArea = new CanvasArea(
      this.app.screen.width,
      this.app.screen.height,
    );
    this.app.stage.addChild(this.canvasArea.view);

    this.shapeGenerator = new ShapeGenerator();
    this.physicsEngine = new PhysicsEngine(this.gravity);

    this.createUI();

    this.setupInteractions();

    this.app.ticker.add(() => this.gameLoop());

    window.addEventListener('resize', () => this.handleResize());
  }

  private getCanvasSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width < 1024) {
      return {
        width: width,
        height: height,
      };
    }
    return {
      width: 800,
      height: 600,
    };
  }

  private createUI() {
    const statsContainer = document.getElementById('stats-container')!;
    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-label">NUMBER OF CURRENT SHAPES</div>
        <div class="stat-value" id="shapeCount">0</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">SURFACE AREA OCCUPIED BY SHAPES</div>
        <div class="stat-value" id="surfaceArea">0 px²</div>
      </div>
    `;

    const controlsContainer = document.getElementById('controls-container')!;
    controlsContainer.innerHTML = `
      <div class="control-group">
        <div class="control-label">NUMBER OF SHAPES PER SECOND</div>
        <div class="control-buttons">
          <button id="decreaseSpawn" class="btn">−</button>
          <span class="value" id="spawnRateValue">${this.spawnRate.toFixed(1)}</span>
          <button id="increaseSpawn" class="btn">+</button>
        </div>
      </div>
      <div class="control-group">
        <div class="control-label">GRAVITY VALUE</div>
        <div class="control-buttons">
          <button id="decreaseGravity" class="btn">−</button>
          <span class="value" id="gravityValue">${this.gravity.toFixed(1)}</span>
          <button id="increaseGravity" class="btn">+</button>
        </div>
      </div>
    `;

    this.shapeCountElement = document.getElementById('shapeCount')!;
    this.surfaceAreaElement = document.getElementById('surfaceArea')!;
    this.spawnRateValueElement = document.getElementById('spawnRateValue')!;
    this.gravityValueElement = document.getElementById('gravityValue')!;

    this.setupControlListeners();
  }

  private setupControlListeners() {
    document.getElementById('decreaseSpawn')!.addEventListener('click', () => {
      this.spawnRate = Math.max(0.1, this.spawnRate - 0.5);
      this.spawnRateValueElement.textContent = this.spawnRate.toFixed(1);
    });

    document.getElementById('increaseSpawn')!.addEventListener('click', () => {
      this.spawnRate += 0.5;
      this.spawnRateValueElement.textContent = this.spawnRate.toFixed(1);
    });

    document
      .getElementById('decreaseGravity')!
      .addEventListener('click', () => {
        this.gravity = Math.max(0.1, this.gravity - 0.5);
        this.gravityValueElement.textContent = this.gravity.toFixed(1);
        this.physicsEngine.setGravity(this.gravity);
      });

    document
      .getElementById('increaseGravity')!
      .addEventListener('click', () => {
        this.gravity += 0.5;
        this.gravityValueElement.textContent = this.gravity.toFixed(1);
        this.physicsEngine.setGravity(this.gravity);
      });
  }

  private setupInteractions() {
    this.canvasArea.view.eventMode = 'static';
    this.canvasArea.view.on('pointerdown', (event) => {
      const localPos = event.global;
      this.spawnShapeAtPosition(localPos.x, localPos.y);
    });
  }

  private gameLoop() {
    const deltaTime = this.app.ticker.deltaMS / 1000;
    const currentTime = Date.now();

    const timeSinceLastSpawn = (currentTime - this.lastSpawnTime) / 1000;
    if (timeSinceLastSpawn >= 1 / this.spawnRate) {
      this.spawnRandomShape();
      this.lastSpawnTime = currentTime;
    }

    const bounds = this.canvasArea.getBounds();
    this.shapes.forEach((shape) => {
      this.physicsEngine.update(shape, deltaTime, bounds);
    });

    this.shapes = this.shapes.filter((shape) => {
      if (shape.y > bounds.height + 500) {
        this.app.stage.removeChild(shape);
        shape.destroy();
        return false;
      }
      return true;
    });

    this.updateUI();
  }

  private spawnRandomShape() {
    const bounds = this.canvasArea.getBounds();
    const x = bounds.x + Math.random() * bounds.width;
    const y = bounds.y - 60;
    const shape = this.shapeGenerator.createRandomShape(x, y);
    this.addShape(shape);
  }

  private spawnShapeAtPosition(x: number, y: number) {
    const bounds = this.canvasArea.getBounds();

    if (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    ) {
      const shape = this.shapeGenerator.createRandomShape(x, y);
      this.addShape(shape);
    }
  }

  private addShape(shape: PIXI.Graphics) {
    shape.eventMode = 'static';
    shape.cursor = 'pointer';
    shape.on('pointerdown', (event) => {
      event.stopPropagation();
      this.removeShape(shape);
    });

    this.app.stage.addChild(shape);
    this.shapes.push(shape);
  }

  private removeShape(shape: PIXI.Graphics) {
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
      this.app.stage.removeChild(shape);
      shape.destroy();
    }
  }

  private updateUI() {
    this.shapeCountElement.textContent = this.shapes.length.toString();
    const totalArea = this.calculateTotalArea();
    this.surfaceAreaElement.textContent = `${Math.round(totalArea)} px²`;
  }

  private calculateTotalArea(): number {
    return this.shapes.reduce((total, shape) => {
      const bounds = shape.getBounds();
      return total + bounds.width * bounds.height;
    }, 0);
  }

  private handleResize() {
    const newSize = this.getCanvasSize();
    this.app.renderer.resize(newSize.width, newSize.height);
    this.app.stage.removeChild(this.canvasArea.view);
    this.canvasArea.destroy();
    this.canvasArea = new CanvasArea(newSize.width, newSize.height);
    this.app.stage.addChild(this.canvasArea.view);
    this.setupInteractions();
  }
}

new Application();
