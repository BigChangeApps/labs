import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";
import { Button } from "@/registry/ui/button";
import { BarChart3, Info, Star } from "lucide-react";

export function CardDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">Card</h1>
        <p className="text-sm text-muted-foreground">
          Card component examples with different layouts
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card space-y-8">
        {/* Basic Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Basic Card</h2>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content area</p>
            </CardContent>
          </Card>
        </div>

        {/* Card with Footer */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Card with Footer</h2>
          <Card>
            <CardHeader>
              <CardTitle>Card with Actions</CardTitle>
              <CardDescription>This card includes a footer with buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content with some information</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="default">Action</Button>
              <Button variant="secondary">Cancel</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Multiple Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Card Grid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
                <CardDescription>First card in the grid</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for card one</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
                <CardDescription>Second card in the grid</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for card two</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
                <CardDescription>Third card in the grid</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for card three</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card without Header */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Card without Header</h2>
          <Card>
            <CardContent className="pt-6">
              <p>This card only has content, no header or footer</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-hw-text">Dashboard Card</h2>
          <Card className="w-[272px]">
            <CardHeader className="flex flex-row items-center justify-between gap-4 p-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-[22px] rounded bg-[#5e4db2] shrink-0">
                  <BarChart3 className="size-[10px] text-white" />
                </div>
                <CardTitle className="text-sm font-bold leading-5">Operations</CardTitle>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon-sm">
                  <Info className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Star className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription className="text-xs leading-4">
                Live overview of today's jobs, bottlenecks, and on-the-day performance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

