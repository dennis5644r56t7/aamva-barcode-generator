declare module 'bwip-js' {
  interface BwipJsOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    parse?: boolean;
    includetext?: boolean;
    textxalign?: 'center' | 'left' | 'right';
    textyalign?: 'center' | 'below' | 'above';
    backgroundcolor?: string;
    barcolor?: string;
    paddingwidth?: number;
    paddingheight?: number;
  }

  const toCanvas: (canvasId: string | HTMLCanvasElement, options: BwipJsOptions) => Promise<HTMLCanvasElement>;
}
