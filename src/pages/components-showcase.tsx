import { useState, useMemo } from "react";
import { Search, Menu, Mail, CreditCard, Settings, User, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/registry/ui/input";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { Checkbox } from "@/registry/ui/checkbox";
import { Label } from "@/registry/ui/label";
import { Separator } from "@/registry/ui/separator";
import { Switch } from "@/registry/ui/switch";
import { Textarea } from "@/registry/ui/textarea";
import { Skeleton } from "@/registry/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/registry/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/ui/table";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/registry/ui/drawer";
import { Calendar } from "@/registry/ui/calendar";
import { Combobox } from "@/registry/ui/combobox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/ui/command";
import { Kbd } from "@/registry/ui/kbd";

// Auto-discover all registry components
const registryModules = import.meta.glob("@/registry/ui/*.tsx", { eager: true });

// Extract component names from file paths
const allComponentNames = Object.keys(registryModules)
  .map((path) => path.replace(/^.*\/([^/]+)\.tsx$/, "$1"))
  .sort();

// Component demos - only define for components that need custom rendering
const componentDemos: Record<string, () => React.ReactNode> = {
  accordion: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default styles that match your theme.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  alert: () => (
    <div className="space-y-4">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app using the cli.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </Alert>
    </div>
  ),
  avatar: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </div>
  ),
  badge: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  button: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon"><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  ),
  calendar: () => (
    <Calendar mode="single" className="rounded-md border" />
  ),
  card: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some example text.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
  checkbox: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="marketing" defaultChecked />
        <Label htmlFor="marketing">Receive marketing emails</Label>
      </div>
    </div>
  ),
  combobox: () => (
    <Combobox
      options={[
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "angular", label: "Angular" },
        { value: "svelte", label: "Svelte" },
      ]}
      placeholder="Select framework..."
      emptyText="No framework found."
      className="w-[200px]"
    />
  ),
  command: () => (
    <Command className="rounded-lg border shadow-md w-[300px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  dialog: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>This is a dialog description.</DialogDescription>
        </DialogHeader>
        <div className="py-4">Dialog content goes here.</div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  drawer: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>This is a drawer description.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">Drawer content goes here.</div>
        <DrawerFooter>
          <Button>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  "dropdown-menu": () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Options <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
        <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" /> Billing</DropdownMenuItem>
        <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  input: () => (
    <div className="space-y-4 max-w-sm">
      <Input placeholder="Default input" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
  kbd: () => (
    <div className="flex flex-wrap gap-2">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <span className="text-muted-foreground">or</span>
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </div>
  ),
  label: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="Enter your email" className="max-w-sm" />
    </div>
  ),
  popover: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Popover Title</h4>
          <p className="text-sm text-muted-foreground">This is the popover content.</p>
        </div>
      </PopoverContent>
    </Popover>
  ),
  "responsive-modal": () => {
    // This is a controlled component demo - requires state management
    return (
      <div className="text-center text-muted-foreground py-4">
        <p className="mb-2">ResponsiveModal is a controlled component.</p>
        <p className="text-sm">It shows as a Dialog on desktop and Drawer on mobile.</p>
        <p className="text-sm mt-2">Requires <code className="bg-muted px-1 rounded">open</code> and <code className="bg-muted px-1 rounded">onOpenChange</code> props.</p>
      </div>
    );
  },
  select: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  separator: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">Section 1</h4>
        <p className="text-sm text-muted-foreground">Content above separator</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Section 2</h4>
        <p className="text-sm text-muted-foreground">Content below separator</p>
      </div>
    </div>
  ),
  sheet: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetHeader>
        <div className="py-4">Sheet content goes here.</div>
      </SheetContent>
    </Sheet>
  ),
  skeleton: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
  switch: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="airplane" />
        <Label htmlFor="airplane">Airplane Mode</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="notifications" defaultChecked />
        <Label htmlFor="notifications">Notifications</Label>
      </div>
    </div>
  ),
  table: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell><Badge>Active</Badge></TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  textarea: () => (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),
  tooltip: () => (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

// Convert kebab-case to Title Case
function toTitle(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Convert kebab-case to PascalCase
function toPascalCase(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export function ComponentsShowcase() {
  const [search, setSearch] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(allComponentNames[0] ?? "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredComponents = useMemo(() => {
    if (!search.trim()) return allComponentNames;
    const query = search.toLowerCase();
    return allComponentNames.filter(
      (name) =>
        name.toLowerCase().includes(query) ||
        toTitle(name).toLowerCase().includes(query)
    );
  }, [search]);

  const renderDemo = componentDemos[selectedComponent];

  // Navigation component
  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-0.5">
      {filteredComponents.map((name) => (
        <button
          key={name}
          onClick={() => {
            setSelectedComponent(name);
            onClick?.();
          }}
          className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
            selectedComponent === name
              ? "bg-hw-surface-subtle text-hw-text font-medium"
              : "text-hw-text hover:bg-accent"
          }`}
        >
          {toTitle(name)}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Left Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-[240px] md:border-r md:bg-background">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Components ({filteredComponents.length})
            </div>
            <NavigationLinks />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden border-b bg-background shrink-0">
            <div className="flex items-center gap-3 px-4 py-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Components</SheetTitle>
                  </SheetHeader>
                  <div className="p-3">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                    <NavigationLinks onClick={() => setMobileMenuOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
              <span className="font-medium">{toTitle(selectedComponent)}</span>
            </div>
          </div>

          {/* Component Preview */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-hw-text mb-1">
                  {toTitle(selectedComponent)}
                </h1>
                <code className="text-sm text-muted-foreground">
                  @/registry/ui/{selectedComponent}
                </code>
              </div>

              <div className="border rounded-lg p-6 bg-card">
                {renderDemo ? (
                  renderDemo()
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="mb-2">No demo available for this component.</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {`import { ${toPascalCase(selectedComponent)} } from "@/registry/ui/${selectedComponent}"`}
                    </code>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Import: <code className="bg-muted px-1.5 py-0.5 rounded">
                  {`import { ${toPascalCase(selectedComponent)} } from "@/registry/ui/${selectedComponent}"`}
                </code>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
