declare module "gsap-trial/SplitText" {
  export class SplitText {
    chars: Element[];
    words: Element[];
    lines: Element[];
    constructor(target: string | Element | Element[] | string[] | NodeList, vars?: object);
    revert(): void;
  }
}
