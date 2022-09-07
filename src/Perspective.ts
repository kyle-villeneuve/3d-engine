import { execFn } from '@skusavvy/common';
import Axis from './Axis';
import Cuboid from './Cuboid';
import Point2D from './Point2D';
import Point3D from './Point3D';
import Vector from './Vector';

class Perspective {
  private scale: number = 20;
  originAxesColor?: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  xAxis = new Vector(130);
  yAxis = new Vector(-130);
  zAxis = new Vector(0);
  depth = new Point3D(this.xAxis.y, this.yAxis.y, -this.zAxis.y); // projections have z as depth
  origin = new Point2D();

  axes: [Axis, Axis, Axis];
  shapes: Cuboid[] = [];

  constructor(canvas: HTMLCanvasElement, width: number, height: number, originAxesColor?: string) {
    this.canvas = canvas;
    canvas.width = width;
    canvas.height = height;
    this.originAxesColor = originAxesColor;
    this.ctx = canvas.getContext('2d')!;
    this.scale = 10;
    this.render = this.render.bind(this);
    this.project = this.project.bind(this);
    this.renderOrigin = this.renderOrigin.bind(this);
    this.origin = new Point2D(width / 2, height / 2);

    this.axes = [
      new Axis('x', 1000, this.originAxesColor),
      new Axis('y', 1000, this.originAxesColor),
      new Axis('z', 1000, this.originAxesColor),
    ];
  }

  setDimensions(width: number, height = width) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.origin = new Point2D(width / 2, height / 2);
    return this.render();
  }

  setScale(size: number | ((size: number) => number)) {
    this.scale = execFn(size, this.scale);

    this.render();
    return this;
  }

  addShape(...shape: Cuboid[]) {
    this.shapes.push(...shape);
    this.render();
    return this;
  }

  replaceShape(...shape: Cuboid[]) {
    this.shapes = [];
    return this.addShape(...shape);
  }

  project(p: Point3D): Point3D {
    const x = this.scale * (p.x * this.xAxis.x + p.y * this.yAxis.x + p.z * this.zAxis.x) + this.origin.x;
    const y = this.scale * (p.x * this.xAxis.y + p.y * this.yAxis.y + p.z * this.zAxis.y) + this.origin.y;
    const z = this.scale * (p.x * this.depth.x + p.y * this.depth.y + p.z * this.depth.z);

    return new Point3D(x, y, z);
  }

  rotate(axis: 'x' | 'y' | 'z', delta: number) {
    switch (axis) {
      case 'x': {
        this.xAxis.pan(delta);
        this.yAxis.pan(delta);
        break;
      }
      case 'y': {
        // this.zAxis.pan(-delta);
        this.yAxis.pan(-delta);
        this.xAxis.pan(delta);
        break;
      }
      case 'z': {
        // TODO ?
        break;
      }
    }

    return this.render();
  }

  pan(axis: 'x' | 'y', delta: number) {
    this.origin[axis] += delta;
    return this.render();
  }

  renderOrigin() {
    if (!this.originAxesColor) return;
    this.axes[0].render(this.ctx, this.project, this.origin);
    this.axes[1].render(this.ctx, this.project, this.origin);
    this.axes[2].render(this.ctx, this.project, this.origin);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    this.renderOrigin();

    this.shapes.forEach((shape) => {
      shape.render(this.ctx, this.project);
    });

    return this;
  }
}

export default Perspective;
