class Poly {
  colour: string;
  indexes: number[];

  constructor(colour: string, first: number, ...indexes: number[]) {
    this.colour = colour;
    this.indexes = [first, ...indexes, first];
  }
}

export default Poly;
