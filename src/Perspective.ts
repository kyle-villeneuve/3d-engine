import Point2D from "./Point2D";
import Point3D from "./Point3D";
import Poly from "./Poly";
import Vector from "./Vector";

class Perspective {
  private _size = 20;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  xAxis = new Vector(120);
  yAxis = new Vector(-120);
  zAxis = new Vector(0);
  depth = new Point3D(this.xAxis.y, this.yAxis.y, -this.zAxis.y); // projections have z as depth
  origin = new Point2D(window.innerWidth / 2, window.innerHeight / 2); // (0,0) default 2D point;

  // @ts-ignore assigned by setter `size`
  _vertices: [
    Point3D,
    Point3D,
    Point3D,
    Point3D,
    Point3D,
    Point3D,
    Point3D,
    Point3D,
    Point3D
  ];

  // prettier-ignore
  static polygons = [
    new Poly(false ? 'rgba(255, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.33)', 1, 2, 6, 5), // right face
    new Poly(false ? 'rgba(255, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.33)', 2, 3, 7, 6), // front face
    new Poly(false ? 'rgba(255, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.33)', 4, 5, 6, 7), // top face
    new Poly(false ? 'rgba(255, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.33)', 1, 5, 4, 8), // back right
    new Poly(false ? 'rgba(255, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.33)', 8, 4, 7, 3), // back left
    new Poly(false ? 'rgba(255, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.33)', 1, 2, 3, 8), // bottom
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.size = 30;
    this.render = this.render.bind(this);
    this.project = this.project.bind(this);
    this.renderAxis = this.renderAxis.bind(this);
    this.renderAxes = this.renderAxes.bind(this);
  }

  get size() {
    return this._size;
  }

  set size(size: number) {
    const hs = size / 2;
    this._size = size;

    this._vertices = [
      new Point3D(-hs, -hs, -hs), // lower top left  index 0
      new Point3D(hs, -hs, -hs), // lower top right
      new Point3D(hs, hs, -hs), // lower bottom right
      new Point3D(-hs, hs, -hs), // lower bottom left
      new Point3D(-hs, -hs, hs), // upper top left  index 4
      new Point3D(hs, -hs, hs), // upper top right
      new Point3D(hs, hs, hs), // upper bottom right
      new Point3D(-hs, hs, hs), // upper  bottom left index 7
      new Point3D(-hs, -hs, -hs),
    ];
  }

  project(p: Point3D, retP = new Point3D()) {
    retP.x =
      p.x * this.xAxis.x +
      p.y * this.yAxis.x +
      p.z * this.zAxis.x +
      this.origin.x;
    retP.y =
      p.x * this.xAxis.y +
      p.y * this.yAxis.y +
      p.z * this.zAxis.y +
      this.origin.y;
    retP.z = p.x * this.depth.x + p.y * this.depth.y + p.z * this.depth.z;
    return retP;
  }

  pan(axis: "x" | "y" | "z", delta: number) {
    switch (axis) {
      case "x": {
        this.xAxis.pan(delta);
        this.yAxis.pan(delta);
        break;
      }
      case "y": {
        // this.zAxis.pan(-delta);
        // this.yAxis.pan(-delta);
        this.xAxis.pan(delta);
        break;
      }
      case "z": {
        // TODO ?
        break;
      }
    }
  }

  renderAxis(vert: Point3D, color = "red") {
    const pt = new Point3D(
      vert.x * this.size,
      vert.y * this.size,
      vert.z * this.size
    );
    const projected = this.project(pt);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.origin.x, this.origin.y);
    this.ctx.lineTo(projected.x, projected.y);
    this.ctx.fill();
    this.ctx.stroke();
  }

  renderAxes() {
    this.renderAxis(this._vertices[1], "blue");
    this.renderAxis(this._vertices[2], "red");
    this.renderAxis(this._vertices[3], "yellow");
    this.renderAxis(this._vertices[4], "fuchsia");
    this.renderAxis(this._vertices[5], "green");
    this.renderAxis(this._vertices[6], "orange");
    this.renderAxis(this._vertices[7], "teal");
    this.renderAxis(this._vertices[8], "purple");
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderAxes();

    const shapes = [];

    for (let z = -0.5; z <= 0.5; z++) {
      for (let y = -0.5; y <= 0.5; y++) {
        for (let x = -0.5; x <= 0.5; x++) {
          const shape = this._vertices
            .map((vert) => {
              return new Point3D(
                vert.x + x * this.size,
                vert.y + y * this.size,
                vert.z + z * this.size
              );
            })
            .map((vert) => this.project(vert));

          shapes.push(shape);
        }
      }
    }

    shapes.forEach((shape) => {
      Perspective.polygons.forEach((poly) => {
        this.ctx.fillStyle = poly.colour;
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        poly.indexes.forEach((index) => {
          const { x, y } = shape[index];
          this.ctx.lineTo(x, y);
        });
        this.ctx.fill();
        this.ctx.stroke();
      });
    });
  }
}

export default Perspective;
