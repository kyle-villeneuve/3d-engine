import Point2D from "./Point2D";

class Point3D extends Point2D {
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    super(x, y);
    this.z = z;
  }
}

export default Point3D;
