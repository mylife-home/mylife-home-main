import { components } from 'mylife-home-core';
import { HUE, PERCENT } from './constants';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class HueToRgb {
  constructor() {
    this.compute();
  }

  @m.state({ type: PERCENT })
  red: number;

  @m.state({ type: PERCENT })
  green: number;

  @m.state({ type: PERCENT })
  blue: number;

  @m.state
  white: boolean = false;

  @m.state({ type: HUE })
  hue: number = 0;

  @m.state({ type: PERCENT })
  brightness: number = 0;

  @m.action
  setWhite(arg: boolean) {
    this.white = arg;
    this.compute();
  }

  @m.state({ type: HUE })
  setHue(arg: number) {
    this.hue = arg;
    this.compute();
  }

  @m.state({ type: PERCENT })
  setBrightness(arg: number) {
    this.brightness = arg;
    this.compute();
  }

  private compute() {
    if (this.white) {
      this.red = this.green = this.blue = this.brightness;
      return;
    }

    // blue = 240deg => 0
    const hue = ((this.hue * 360 / 255) + 240) % 360;
    const { r, g, b } = hsv2rgb(hue, 1, this.brightness / 100);
    this.red = Math.round(r * 100);
    this.green = Math.round(g * 100);
    this.blue = Math.round(b * 100);
  }
};

// http://en.wikipedia.org/wiki/HSL_color_space
function hsv2rgb(h: number, s: number, v: number) {
  h /= 60;
  const c = v * s;
  const x = c * (1 - Math.abs(h % 2 - 1));
  if (h < 1) { return { r: c, g: x, b: 0 }; }
  if (h < 2) { return { r: x, g: c, b: 0 }; }
  if (h < 3) { return { r: 0, g: c, b: x }; }
  if (h < 4) { return { r: 0, g: x, b: c }; }
  if (h < 5) { return { r: x, g: 0, b: c }; }
  if (h < 6) { return { r: c, g: 0, b: x }; }
}
