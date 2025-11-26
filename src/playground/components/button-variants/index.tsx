import { Button } from "@/registry/ui/button";
import { Download, Heart, Settings } from "lucide-react";

export function ButtonVariantsDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">Button Variants</h1>
        <p className="text-sm text-muted-foreground">
          Tweaking button variants
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card space-y-8">
        {/* Variants */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* Icon Sizes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Icon Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon-sm">
              <Settings />
            </Button>
            <Button size="icon">
              <Settings />
            </Button>
            <Button size="icon-lg">
              <Settings />
            </Button>
          </div>
        </div>

        {/* Buttons with Icons */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">With Icons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Download />
              Download
            </Button>
            <Button variant="outline">
              <Heart />
              Favorite
            </Button>
            <Button variant="secondary">
              <Settings />
              Settings
            </Button>
          </div>
        </div>

        {/* Disabled States */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Disabled States</h2>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled Default</Button>
            <Button variant="destructive" disabled>Disabled Destructive</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
            <Button variant="ghost" disabled>Disabled Ghost</Button>
            <Button variant="link" disabled>Disabled Link</Button>
          </div>
        </div>

        {/* All Variants × All Sizes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">All Variants × All Sizes</h2>
          <div className="space-y-6">
            {(["default", "destructive", "outline", "secondary", "ghost", "link"] as const).map((variant) => (
              <div key={variant} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground capitalize">{variant}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant={variant} size="sm">Small</Button>
                  <Button variant={variant} size="default">Default</Button>
                  <Button variant={variant} size="lg">Large</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

