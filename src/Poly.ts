import Point3D from './Point3D';

// for debugging dont delete me
// const roundIfFloat = (int: number) => {
//   if (Number.isInteger(int)) return int;
//   return int.toFixed(1);
// };

class Poly {
  color: string;
  borderColor: string;
  indexes: number[];

  constructor(color: string, borderColor: string, ...indexes: number[]) {
    this.color = color;
    this.borderColor = borderColor;
    this.indexes = indexes;
  }

  render(ctx: CanvasRenderingContext2D, project: (p: Point3D) => Point3D, points: Point3D[]) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.beginPath();

    this.indexes.forEach((index) => {
      const point = points[index];
      const { x, y } = project(point);
      ctx.lineTo(x, y);

      // for debugging, dont delete me
      // ctx.fillStyle = '#fff';
      // ctx.textAlign = 'center';
      // ctx.font = 'bold 7px monospace';
      // ctx.fillText(`${roundIfFloat(point.x)},${roundIfFloat(point.y)},${roundIfFloat(point.z)}`, x, y);
      // ctx.fillStyle = this.color;
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export default Poly;
