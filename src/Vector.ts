import Point2D from "./Point2D";
import { D2R } from "./utils";

class Vector extends Point2D {
  angle: number;
  magnitude: number;

  constructor(angle: number, magnitude = 1) {
    const radians = D2R(angle);
    const x = Math.cos(radians) * magnitude;
    const y = Math.sin(radians) * magnitude;

    super(x, y);
    this.angle = angle;
    this.magnitude = magnitude;
  }

  pan(delta: number) {
    this.angle = (this.angle + delta) % 360;
    const radians = D2R(this.angle);
    const x = Math.cos(radians) * this.magnitude;
    const y = Math.sin(radians) * this.magnitude;
    this.x = x;
    this.y = y;
  }
}

export default Vector;
