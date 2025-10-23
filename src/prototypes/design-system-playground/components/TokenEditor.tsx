import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface TokenEditorProps {
  tokens: Record<string, string>;
  onTokenChange: (token: string, value: string) => void;
}

const colorScales = [
  "blue", "light-blue", "purple", "pink", "red",
  "orange", "yellow", "lime", "green", "teal",
  "gray", "neutral"
];

const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

const semanticTokens = {
  core: [
    { key: "background", label: "Background" },
    { key: "foreground", label: "Foreground" },
    { key: "card", label: "Card" },
    { key: "card-foreground", label: "Card Foreground" },
    { key: "popover", label: "Popover" },
    { key: "popover-foreground", label: "Popover Foreground" },
  ],
  primary: [
    { key: "primary", label: "Primary" },
    { key: "primary-foreground", label: "Primary Foreground" },
  ],
  secondary: [
    { key: "secondary", label: "Secondary" },
    { key: "secondary-foreground", label: "Secondary Foreground" },
  ],
  muted: [
    { key: "muted", label: "Muted" },
    { key: "muted-foreground", label: "Muted Foreground" },
  ],
  accent: [
    { key: "accent", label: "Accent" },
    { key: "accent-foreground", label: "Accent Foreground" },
  ],
  destructive: [
    { key: "destructive", label: "Destructive" },
    { key: "destructive-foreground", label: "Destructive Foreground" },
  ],
  borders: [
    { key: "border", label: "Border" },
    { key: "input", label: "Input" },
    { key: "ring", label: "Ring" },
  ],
};

export function TokenEditor({ tokens, onTokenChange }: TokenEditorProps) {
  const parseTokenValue = (value: string): { scale: string; shade: string } | null => {
    const match = value.match(/var\(--color-([a-z-]+)-(\d+)\)/);
    if (match) {
      return { scale: match[1], shade: match[2] };
    }
    // Special cases for white/black
    if (value === "var(--color-white)") return { scale: "white", shade: "white" };
    if (value === "var(--color-black)") return { scale: "black", shade: "black" };
    return null;
  };

  const handleTokenChange = (token: string, scale: string, shade: string) => {
    if (scale === "white") {
      onTokenChange(token, "var(--color-white)");
    } else if (scale === "black") {
      onTokenChange(token, "var(--color-black)");
    } else {
      onTokenChange(token, `var(--color-${scale}-${shade})`);
    }
  };

  const renderTokenControl = (token: { key: string; label: string }) => {
    const currentValue = tokens[token.key] || "";
    const parsed = parseTokenValue(currentValue);

    return (
      <div key={token.key} className="space-y-2">
        <Label className="text-sm">{token.label}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={parsed?.scale || ""}
            onValueChange={(scale) => {
              const shade = scale === "white" || scale === "black" ? scale : "500";
              handleTokenChange(token.key, scale, shade);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              {colorScales.map((scale) => (
                <SelectItem key={scale} value={scale}>
                  {scale}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {parsed && parsed.scale !== "white" && parsed.scale !== "black" && (
            <Select
              value={parsed.shade}
              onValueChange={(shade) => handleTokenChange(token.key, parsed.scale, shade)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Shade" />
              </SelectTrigger>
              <SelectContent>
                {shades.map((shade) => (
                  <SelectItem key={shade} value={shade}>
                    {shade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: `var(--${token.key})` }}
          />
          <code className="text-xs text-muted-foreground">{currentValue}</code>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Token Editor</CardTitle>
        <CardDescription>
          Map semantic tokens to your base color palette
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="borders">Borders</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="space-y-4 mt-4">
            {semanticTokens.core.map(renderTokenControl)}
          </TabsContent>

          <TabsContent value="variants" className="space-y-4 mt-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Primary</h3>
                {semanticTokens.primary.map(renderTokenControl)}
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Secondary</h3>
                {semanticTokens.secondary.map(renderTokenControl)}
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Accent</h3>
                {semanticTokens.accent.map(renderTokenControl)}
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Muted</h3>
                {semanticTokens.muted.map(renderTokenControl)}
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Destructive</h3>
                {semanticTokens.destructive.map(renderTokenControl)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="borders" className="space-y-4 mt-4">
            {semanticTokens.borders.map(renderTokenControl)}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="space-y-6">
              {Object.entries(semanticTokens).map(([category, tokens]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground capitalize">
                    {category}
                  </h3>
                  {tokens.map(renderTokenControl)}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
