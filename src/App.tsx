import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySidebar } from "@/components/category-sidebar";
import { SystemDefaults } from "@/components/system-defaults";
import { CustomAttributes } from "@/components/custom-attributes";
import { ManufacturersView } from "@/components/manufacturers-view";
import { useAttributeStore } from "@/lib/store";

function App() {
  const { categories, currentCategoryId } = useAttributeStore();
  const currentCategory = categories.find((c) => c.id === currentCategoryId);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <CategorySidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b px-8 py-6">
            <h1 className="text-3xl font-bold">Attribute Management</h1>
            <p className="text-muted-foreground mt-1">
              Configure attributes and manufacturers for your asset categories
            </p>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="attributes" className="h-full flex flex-col">
              <div className="border-b px-8">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="attributes">
                    Attributes {currentCategory && `- ${currentCategory.name}`}
                  </TabsTrigger>
                  <TabsTrigger value="manufacturers">
                    Manufacturers & Models
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <TabsContent value="attributes" className="mt-0 space-y-6">
                  <SystemDefaults />
                  <CustomAttributes />
                </TabsContent>

                <TabsContent value="manufacturers" className="mt-0">
                  <ManufacturersView />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default App;
