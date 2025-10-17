import { Lock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAttributeStore } from "@/lib/store";
import type { Attribute, Category, CategoryAttributeConfig } from "@/types";

type SystemAttributeItem = CategoryAttributeConfig & {
  attribute: Attribute;
};

export function SystemDefaults() {
  const { currentCategoryId, categories, attributeLibrary, toggleAttribute } =
    useAttributeStore();

  const currentCategory = categories.find(
    (c: Category) => c.id === currentCategoryId
  );
  if (!currentCategory) return null;

  const systemAttributes = currentCategory.systemAttributes.map(
    (config: CategoryAttributeConfig): SystemAttributeItem => {
      const attribute = attributeLibrary.find(
        (a: Attribute) => a.id === config.attributeId
      );
      return { ...config, attribute: attribute as Attribute };
    }
  );

  const hasDisabled = systemAttributes.some(
    (item: SystemAttributeItem) => !item.isEnabled
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          System Defaults (Fixed)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasDisabled && (
          <Alert variant="default" className="text-xs">
            <AlertDescription>
              Hidden system attributes are not deleted, just hidden for this
              category.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {systemAttributes.map((item: SystemAttributeItem) => (
            <div
              key={item.attributeId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {item.attribute.label}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  </div>
                  {item.attribute.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.attribute.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {item.attribute.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        System attributes are read-only and pre-mapped. You can
                        only hide them for this category.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Switch
                  checked={item.isEnabled}
                  onCheckedChange={() =>
                    toggleAttribute(currentCategoryId, item.attributeId, true)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
