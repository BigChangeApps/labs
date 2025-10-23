import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Alert } from "@/shared/components/ui/alert";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";

export function ComponentShowcase() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Component Showcase</CardTitle>
          <CardDescription>
            Preview how design tokens affect common shadcn components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" size="sm">Small</Button>
              <Button variant="default" size="default">Default</Button>
              <Button variant="default" size="lg">Large</Button>
              <Button variant="default" disabled>Disabled</Button>
            </div>
          </div>

          <Separator />

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <Separator />

          {/* Form Elements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Form Elements</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" disabled placeholder="Disabled input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="select">Select</Label>
                <Select>
                  <SelectTrigger id="select">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="checkbox"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(checked as boolean)}
                />
                <Label htmlFor="checkbox">Checkbox</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="switch"
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
                <Label htmlFor="switch">Switch</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Alerts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Alerts</h3>
            <div className="space-y-3">
              <Alert>
                <CardTitle className="text-sm">Default Alert</CardTitle>
                <CardDescription className="text-sm">
                  This is a default alert message with some information.
                </CardDescription>
              </Alert>
              <Alert variant="destructive">
                <CardTitle className="text-sm">Destructive Alert</CardTitle>
                <CardDescription className="text-sm">
                  This is a destructive alert for errors or warnings.
                </CardDescription>
              </Alert>
            </div>
          </div>

          <Separator />

          {/* Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Cards</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">This is the card content area.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Another Card</CardTitle>
                  <CardDescription>With different content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">Cards can contain various content types.</p>
                    <Badge>Status</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Tabs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tabs</h3>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="space-y-2">
                <p className="text-sm">Content for tab 1</p>
              </TabsContent>
              <TabsContent value="tab2" className="space-y-2">
                <p className="text-sm">Content for tab 2</p>
              </TabsContent>
              <TabsContent value="tab3" className="space-y-2">
                <p className="text-sm">Content for tab 3</p>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
