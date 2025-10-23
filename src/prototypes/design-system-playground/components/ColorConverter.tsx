import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { hexToOKLCH, oklchToHex, oklchToString, type OKLCHColor } from "../utils/colorConversion";

export function ColorConverter() {
  const [hexValue, setHexValue] = useState("#086DFF");
  const [oklchValue, setOklchValue] = useState<OKLCHColor>({ l: 0.577, c: 0.232, h: 260.121 });

  const handleHexChange = (value: string) => {
    setHexValue(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const oklch = hexToOKLCH(value);
      setOklchValue(oklch);
    }
  };

  const handleOKLCHChange = (key: keyof OKLCHColor, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newOklch = { ...oklchValue, [key]: numValue };
    setOklchValue(newOklch);

    try {
      const hex = oklchToHex(newOklch);
      setHexValue(hex);
    } catch (e) {
      // Invalid color
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Converter</CardTitle>
        <CardDescription>Convert between Hex and OKLCH color formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="w-24 h-24 rounded-lg border-2 border-border shadow-sm"
            style={{ backgroundColor: hexValue }}
          />
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hex">Hex</Label>
              <Input
                id="hex"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#086DFF"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>OKLCH</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l" className="text-xs text-muted-foreground">
                Lightness (0-1)
              </Label>
              <Input
                id="l"
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={oklchValue.l}
                onChange={(e) => handleOKLCHChange("l", e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c" className="text-xs text-muted-foreground">
                Chroma (0-0.4)
              </Label>
              <Input
                id="c"
                type="number"
                step="0.001"
                min="0"
                max="0.4"
                value={oklchValue.c}
                onChange={(e) => handleOKLCHChange("c", e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h" className="text-xs text-muted-foreground">
                Hue (0-360)
              </Label>
              <Input
                id="h"
                type="number"
                step="0.001"
                min="0"
                max="360"
                value={oklchValue.h}
                onChange={(e) => handleOKLCHChange("h", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <code className="text-sm">{oklchToString(oklchValue)}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
