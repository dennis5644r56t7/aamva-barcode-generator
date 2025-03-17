declare module 'bwip-js' {
  interface BwipJsOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    rows?: number;
    columns?: number;
    eclevel?: number;
    guardwhitespace?: number;
    inkspread?: number;
    parsefnc?: boolean;
    includetext?: boolean;
    textxalign?: string;
  }

  const toCanvas: (canvasId: string, options: BwipJsOptions) => Promise<HTMLCanvasElement>;
}
