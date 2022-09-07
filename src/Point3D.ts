import Point2D from './Point2D';

class Point3D extends Point2D {
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    super(x, y);
    this.z = z;
  }

  clone() {
    return new Point3D(this.x, this.y, this.z);
  }

  add(x: number, y = x, z = x) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  addPoint(p: Point3D) {
    return this.add(p.x, p.y, p.z);
  }

  multiply(x: number, y = x, z = x) {
    this.x *= x;
    this.y *= y;
    this.z *= z;
    return this;
  }
}

export default Point3D;
