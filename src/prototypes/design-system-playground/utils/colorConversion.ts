export interface OKLCHColor {
  l: number; // Lightness (0-1)
  c: number; // Chroma (0-0.4+)
  h: number; // Hue (0-360)
}

export function hexToOKLCH(hex: string): OKLCHColor {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Convert RGB to linear RGB
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  // Convert linear RGB to XYZ (using D65 illuminant)
  const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin;
  const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.072175 * bLin;
  const z = 0.0193339 * rLin + 0.119192 * gLin + 0.9503041 * bLin;

  // Convert XYZ to OKLab
  const l_ = Math.cbrt(
    0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
  );
  const m_ = Math.cbrt(
    0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
  );
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // Convert OKLab to OKLCH
  const c = Math.sqrt(a * a + b_ * b_);
  let h = (Math.atan2(b_, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(c * 1000) / 1000,
    h: Math.round(h * 1000) / 1000,
  };
}

export function oklchToHex(oklch: OKLCHColor): string {
  const { l: L, c, h } = oklch;

  // Convert OKLCH to OKLab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // Convert OKLab to XYZ
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const x = 1.2270138511 * l - 0.5577999807 * m + 0.281256149 * s;
  const y = -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s;
  const z = -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s;

  // Convert XYZ to linear RGB
  const rLin = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const gLin = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const bLin = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  // Convert linear RGB to sRGB
  const toSRGB = (c: number) => {
    c = Math.max(0, Math.min(1, c)); // Clamp
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSRGB(rLin) * 255);
  const g = Math.round(toSRGB(gLin) * 255);
  const b_ = Math.round(toSRGB(bLin) * 255);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b_.toString(16).padStart(2, "0")}`;
}

export function oklchToString(oklch: OKLCHColor): string {
  return `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
}

export function parseOKLCH(oklchString: string): OKLCHColor | null {
  const match = oklchString.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/
  );
  if (!match) return null;

  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}
