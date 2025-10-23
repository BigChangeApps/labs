import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { ArrowLeft, Sun, Moon, Download, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ColorConverter } from "./components/ColorConverter";
import { TokenEditor } from "./components/TokenEditor";
import { ComponentShowcase } from "./components/ComponentShowcase";

// Default token mappings from globals.css
const defaultTokens: Record<string, string> = {
  background: "var(--color-white)",
  foreground: "var(--color-neutral-900)",
  card: "var(--color-neutral-50)",
  "card-foreground": "var(--color-neutral-900)",
  popover: "var(--color-neutral-100)",
  "popover-foreground": "var(--color-neutral-900)",
  primary: "var(--color-blue-600)",
  "primary-foreground": "var(--color-white)",
  secondary: "var(--color-neutral-200)",
  "secondary-foreground": "var(--color-neutral-900)",
  muted: "var(--color-neutral-200)",
  "muted-foreground": "var(--color-neutral-600)",
  accent: "var(--color-blue-50)",
  "accent-foreground": "var(--color-blue-600)",
  destructive: "var(--color-red-500)",
  "destructive-foreground": "var(--color-white)",
  border: "var(--color-neutral-200)",
  input: "var(--color-neutral-200)",
  ring: "var(--color-blue-500)",
};

const defaultDarkTokens: Record<string, string> = {
  background: "var(--color-neutral-950)",
  foreground: "var(--color-neutral-50)",
  card: "var(--color-neutral-900)",
  "card-foreground": "var(--color-neutral-50)",
  popover: "var(--color-neutral-900)",
  "popover-foreground": "var(--color-neutral-50)",
  primary: "var(--color-blue-500)",
  "primary-foreground": "var(--color-neutral-900)",
  secondary: "var(--color-neutral-800)",
  "secondary-foreground": "var(--color-neutral-50)",
  muted: "var(--color-neutral-800)",
  "muted-foreground": "var(--color-neutral-400)",
  accent: "var(--color-blue-950)",
  "accent-foreground": "var(--color-blue-400)",
  destructive: "var(--color-red-600)",
  "destructive-foreground": "var(--color-white)",
  border: "var(--color-neutral-800)",
  input: "var(--color-neutral-800)",
  ring: "var(--color-blue-400)",
};

function App() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [tokens, setTokens] = useState(defaultTokens);
  const [darkTokens, setDarkTokens] = useState(defaultDarkTokens);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    const currentTokens = isDark ? darkTokens : tokens;

    Object.entries(currentTokens).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [tokens, darkTokens, isDark]);

  const handleTokenChange = (token: string, value: string) => {
    if (isDark) {
      setDarkTokens((prev) => ({ ...prev, [token]: value }));
    } else {
      setTokens((prev) => ({ ...prev, [token]: value }));
    }
  };

  const handleReset = () => {
    setTokens(defaultTokens);
    setDarkTokens(defaultDarkTokens);
  };

  const handleCopyTokens = async () => {
    const tokenOutput = `const defaultTokens: Record<string, string> = ${JSON.stringify(tokens, null, 2)};

const defaultDarkTokens: Record<string, string> = ${JSON.stringify(darkTokens, null, 2)};`;

    try {
      await navigator.clipboard.writeText(tokenOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExport = () => {
    const cssOutput = `
/* Light Mode Tokens */
:root {
${Object.entries(tokens)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join("\n")}
}

/* Dark Mode Tokens */
.dark {
${Object.entries(darkTokens)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join("\n")}
}
    `.trim();

    const blob = new Blob([cssOutput], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design-tokens.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Labs
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">Design System Playground</h1>
                <p className="text-sm text-muted-foreground">
                  Experiment with design tokens and components
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDark} onCheckedChange={setIsDark} />
                <Moon className="h-4 w-4" />
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyTokens} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Tokens
                  </>
                )}
              </Button>
              <Button size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tools */}
          <div className="lg:col-span-1 space-y-6">
            <TokenEditor
              tokens={isDark ? darkTokens : tokens}
              onTokenChange={handleTokenChange}
            />
            <ColorConverter />
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <ComponentShowcase />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
