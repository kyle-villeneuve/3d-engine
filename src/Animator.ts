class Animator<TArgs extends any[], TReturn> {
  raf: number | null = null;
  callback: (...args: TArgs) => TReturn;

  constructor(callback: (...args: TArgs) => TReturn) {
    this.callback = callback;
    this.animate = this.animate.bind(this);
  }

  animate(...args: TArgs) {
    this.callback(...args);
    this.raf = window.requestAnimationFrame(() => this.animate(...args));
  }

  cancel() {
    this.raf && window.cancelAnimationFrame(this.raf);
  }
}

export default Animator;
