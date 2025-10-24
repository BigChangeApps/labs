import { useState } from "react";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { Button } from "@/registry/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/ui/card";
import { Check, Copy } from "lucide-react";

interface TokenDisplay {
  name: string;
  cssVar: string;
  tailwindClass: string;
  description: string;
}

const tokenCategories = {
  typography: {
    title: "Typography",
    description: "Text color tokens for content hierarchy",
    tokens: [
      {
        name: "Foreground",
        cssVar: "--hw-foreground",
        tailwindClass: "text-hw-foreground",
        description: "Primary text color",
      },
      {
        name: "Foreground Subtle",
        cssVar: "--hw-foreground-subtle",
        tailwindClass: "text-hw-foreground-subtle",
        description: "Secondary/de-emphasized text",
      },
    ],
  },
  surfaces: {
    title: "Surfaces",
    description: "Background colors for different elevation levels",
    tokens: [
      {
        name: "Background",
        cssVar: "--hw-background",
        tailwindClass: "bg-hw-background",
        description: "Page background",
      },
      {
        name: "Surface",
        cssVar: "--hw-surface",
        tailwindClass: "bg-hw-surface",
        description: "Elevated surfaces (cards, panels)",
      },
      {
        name: "Surface Hover",
        cssVar: "--hw-surface-hover",
        tailwindClass: "bg-hw-surface-hover",
        description: "Surface hover state",
      },
      {
        name: "Surface Subtle",
        cssVar: "--hw-surface-subtle",
        tailwindClass: "bg-hw-surface-subtle",
        description: "Subtle surface overlay",
      },
      {
        name: "Surface Subtle Hover",
        cssVar: "--hw-surface-subtle-hover",
        tailwindClass: "bg-hw-surface-subtle-hover",
        description: "Subtle surface hover",
      },
    ],
  },
  interactive: {
    title: "Interactive",
    description: "Colors for buttons and interactive elements",
    tokens: [
      {
        name: "Interactive",
        cssVar: "--hw-interactive",
        tailwindClass: "bg-hw-interactive",
        description: "Primary interactive (buttons)",
      },
      {
        name: "Interactive Hover",
        cssVar: "--hw-interactive-hover",
        tailwindClass: "bg-hw-interactive-hover",
        description: "Primary interactive hover",
      },
      {
        name: "Interactive Foreground",
        cssVar: "--hw-interactive-foreground",
        tailwindClass: "text-hw-interactive-foreground",
        description: "Text on interactive backgrounds",
      },
      {
        name: "Interactive Subtle",
        cssVar: "--hw-interactive-subtle",
        tailwindClass: "bg-hw-interactive-subtle",
        description: "Secondary interactive",
      },
      {
        name: "Interactive Subtle Hover",
        cssVar: "--hw-interactive-subtle-hover",
        tailwindClass: "bg-hw-interactive-subtle-hover",
        description: "Secondary interactive hover",
      },
      {
        name: "Interactive Subtle Foreground",
        cssVar: "--hw-interactive-subtle-foreground",
        tailwindClass: "text-hw-interactive-subtle-foreground",
        description: "Text on subtle interactive",
      },
    ],
  },
  status: {
    title: "Status",
    description: "Semantic colors for status and feedback",
    tokens: [
      {
        name: "Critical",
        cssVar: "--hw-critical",
        tailwindClass: "bg-hw-critical",
        description: "Critical/error state",
      },
      {
        name: "Critical Foreground",
        cssVar: "--hw-critical-foreground",
        tailwindClass: "text-hw-critical-foreground",
        description: "Text on critical backgrounds",
      },
      {
        name: "Critical Subtle",
        cssVar: "--hw-critical-subtle",
        tailwindClass: "bg-hw-critical-subtle",
        description: "Subtle critical background",
      },
      {
        name: "Warning",
        cssVar: "--hw-warning",
        tailwindClass: "bg-hw-warning",
        description: "Warning state",
      },
      {
        name: "Warning Foreground",
        cssVar: "--hw-warning-foreground",
        tailwindClass: "text-hw-warning-foreground",
        description: "Text on warning backgrounds",
      },
      {
        name: "Warning Subtle",
        cssVar: "--hw-warning-subtle",
        tailwindClass: "bg-hw-warning-subtle",
        description: "Subtle warning background",
      },
      {
        name: "Success",
        cssVar: "--hw-success",
        tailwindClass: "bg-hw-success",
        description: "Success state",
      },
      {
        name: "Success Foreground",
        cssVar: "--hw-success-foreground",
        tailwindClass: "text-hw-success-foreground",
        description: "Text on success backgrounds",
      },
      {
        name: "Success Subtle",
        cssVar: "--hw-success-subtle",
        tailwindClass: "bg-hw-success-subtle",
        description: "Subtle success background",
      },
      {
        name: "Informative",
        cssVar: "--hw-informative",
        tailwindClass: "bg-hw-informative",
        description: "Informative state",
      },
      {
        name: "Informative Foreground",
        cssVar: "--hw-informative-foreground",
        tailwindClass: "text-hw-informative-foreground",
        description: "Text on informative backgrounds",
      },
      {
        name: "Informative Subtle",
        cssVar: "--hw-informative-subtle",
        tailwindClass: "bg-hw-informative-subtle",
        description: "Subtle informative background",
      },
      {
        name: "Inactive",
        cssVar: "--hw-inactive",
        tailwindClass: "bg-hw-inactive",
        description: "Inactive state",
      },
      {
        name: "Inactive Foreground",
        cssVar: "--hw-inactive-foreground",
        tailwindClass: "text-hw-inactive-foreground",
        description: "Text on inactive backgrounds",
      },
      {
        name: "Inactive Subtle",
        cssVar: "--hw-inactive-subtle",
        tailwindClass: "bg-hw-inactive-subtle",
        description: "Subtle inactive background",
      },
    ],
  },
  destructive: {
    title: "Destructive",
    description: "Colors for destructive actions",
    tokens: [
      {
        name: "Destructive",
        cssVar: "--hw-destructive",
        tailwindClass: "bg-hw-destructive",
        description: "Destructive action",
      },
      {
        name: "Destructive Hover",
        cssVar: "--hw-destructive-hover",
        tailwindClass: "bg-hw-destructive-hover",
        description: "Destructive action hover",
      },
      {
        name: "Destructive Foreground",
        cssVar: "--hw-destructive-foreground",
        tailwindClass: "text-hw-destructive-foreground",
        description: "Text on destructive backgrounds",
      },
    ],
  },
  utility: {
    title: "Utility",
    description: "Utility colors for borders, focus, etc.",
    tokens: [
      {
        name: "Border",
        cssVar: "--hw-border",
        tailwindClass: "border-hw-border",
        description: "Default border color",
      },
      {
        name: "Focus",
        cssVar: "--hw-focus",
        tailwindClass: "ring-hw-focus",
        description: "Focus ring color",
      },
      {
        name: "Disabled",
        cssVar: "--hw-disabled",
        tailwindClass: "bg-hw-disabled",
        description: "Disabled state",
      },
      {
        name: "Disabled Foreground",
        cssVar: "--hw-disabled-foreground",
        tailwindClass: "text-hw-disabled-foreground",
        description: "Disabled text",
      },
      {
        name: "Overlay",
        cssVar: "--hw-overlay",
        tailwindClass: "bg-hw-overlay",
        description: "Modal overlay",
      },
    ],
  },
};

function TokenCard({ token }: { token: TokenDisplay }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getComputedColor = (cssVar: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar);
    return value.trim();
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{token.name}</h3>
        <div
          className="w-12 h-12 rounded border border-border shadow-sm"
          style={{ backgroundColor: `var(${token.cssVar})` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{token.description}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
            {token.cssVar}
          </code>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => copyToClipboard(token.cssVar, "css")}
          >
            {copied === "css" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
            {token.tailwindClass}
          </code>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => copyToClipboard(token.tailwindClass, "tailwind")}
          >
            {copied === "tailwind" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          {getComputedColor(token.cssVar)}
        </div>
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-hw-background">
      {/* Header */}
      <header className="border-b border-hw-border bg-hw-surface sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-hw-foreground">Design Tokens</h1>
              <p className="text-hw-foreground-subtle mt-1">
                Highway (hw) semantic token system
              </p>
            </div>
            <BrandSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Token Usage Examples</CardTitle>
              <CardDescription>
                See how the tokens work in real components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button className="bg-hw-interactive hover:bg-hw-interactive-hover text-hw-interactive-foreground">
                  Primary Button
                </Button>
                <Button className="bg-hw-interactive-subtle hover:bg-hw-interactive-subtle-hover text-hw-interactive-subtle-foreground border border-hw-interactive">
                  Secondary Button
                </Button>
                <Button className="bg-hw-destructive hover:bg-hw-destructive-hover text-hw-destructive-foreground">
                  Destructive Button
                </Button>
              </div>

              <div className="space-y-2">
                <div className="bg-hw-critical-subtle text-hw-critical border border-hw-critical rounded p-3">
                  Critical alert with subtle background
                </div>
                <div className="bg-hw-warning-subtle text-hw-warning border border-hw-warning rounded p-3">
                  Warning alert with subtle background
                </div>
                <div className="bg-hw-success-subtle text-hw-success border border-hw-success rounded p-3">
                  Success alert with subtle background
                </div>
                <div className="bg-hw-informative-subtle text-hw-informative border border-hw-informative rounded p-3">
                  Informative alert with subtle background
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Categories */}
          {Object.entries(tokenCategories).map(([key, category]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tokens.map((token) => (
                    <TokenCard key={token.cssVar} token={token} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
