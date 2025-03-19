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
    columns?: number;
    rows?: number;
    rowmult?: number;
  }

  const toCanvas: (canvasId: string | HTMLCanvasElement, options: BwipJsOptions) => Promise<HTMLCanvasElement>;
}

declare module '@bwip-js/browser' {
  export interface BwipJsOptions {
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
    columns?: number;
    rows?: number;
    rowmult?: number;
  }

  export function toCanvas(canvas: HTMLCanvasElement, options: BwipJsOptions): Promise<void>;
}
