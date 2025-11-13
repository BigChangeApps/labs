import { useState } from "react";
import { Search, Clock, Star, ChevronDown, LayoutGrid, HelpCircle } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Avatar, AvatarFallback } from "@/registry/ui/avatar";
import { Badge } from "@/registry/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu";
import { cn } from "@/registry/lib/utils";

// Simple logo placeholder - matches Figma SymbolOnly component
function Logo() {
  return (
    <div className="relative shrink-0 size-6">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const companies = [
  "Fast Repair Ltd",
  "Another Company",
  "Acme Corporation",
  "Global Services Inc",
];

type MenuItem = {
  label: string;
  hasDropdown?: boolean;
  notificationCount?: number;
  hasIndicator?: boolean; // For purple dot indicator
};

const menuItems: MenuItem[] = [
  { label: "Dashboard" },
  { label: "Schedule", notificationCount: 5 },
  { label: "Stock & Assets", hasDropdown: true, hasIndicator: true },
  { label: "CRM" },
  { label: "Fleet & Resources" },
  { label: "Messages", notificationCount: 99 },
  { label: "Alerts", notificationCount: 99 },
  { label: "Analytics & Reporting" },
  { label: "Map" },
];

export function NavigationDemo() {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("Dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">Navigation</h1>
        <p className="text-sm text-muted-foreground">
          Demo of the navigation built with shadcn.
        </p>
      </div>
      <div className="border rounded-lg overflow-hidden bg-card -mx-3 sm:-mx-6">
        <header className="bg-[var(--brand-500)] flex items-center justify-between px-5 py-2 w-full">
          {/* Left: Logo + Company Dropdown */}
          <div className="flex items-center gap-1.5">
            <Logo />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-0.5 pl-2 pr-1 py-1.5 rounded-md text-white text-sm font-medium hover:bg-white/10 transition-colors bg-transparent">
                  <span>{selectedCompany}</span>
                  <ChevronDown className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  {companies.map((company) => (
                    <DropdownMenuRadioItem key={company} value={company}>
                      {company}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Search + Icons */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-[260px]">
              <div className="bg-[rgba(16,25,41,0.2)] flex items-center gap-2 px-2.5 py-1.5 rounded-md shadow-[0px_0px_0px_1px_rgba(255,255,255,0.08)]">
                <Search className="size-5 text-white shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  className={cn(
                    "flex-1 bg-transparent border-0 outline-none",
                    "text-sm text-white placeholder:text-white/60",
                    "focus:outline-none"
                  )}
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10 hover:text-white p-1"
              >
                <Clock className="!size-5" strokeWidth={2.5} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10 hover:text-white p-1"
              >
                <Star className="!size-5" strokeWidth={2.5} />
              </Button>
              <button className="h-10 w-10 flex items-center justify-center p-1 hover:opacity-90 transition-opacity cursor-pointer">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-white text-[var(--brand-500)] text-[10.8px] font-semibold leading-none">
                    LB
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>
          </div>
        </header>

        {/* Bottom Navigation Bar */}
        <div className="bg-white border-b border-[#eaecf0] flex items-center justify-between pl-[12px] pr-[20px] py-[8px]">
          {/* Left: Navigation Menu Items */}
          <div className="flex items-center gap-0">
            {menuItems.map((item) => {
              const isSelected = selectedMenuItem === item.label;
              const menuItemButton = (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => setSelectedMenuItem(item.label)}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-sm transition-colors relative border font-semibold",
                    isSelected
                      ? "bg-[rgba(8,109,255,0.08)] border-[rgba(16,25,41,0.1)] text-hw-text"
                      : "text-hw-text hover:bg-hw-surface-hover border-transparent"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.label}
                    {item.notificationCount !== undefined && (
                      <Badge
                        variant="secondary"
                        className="min-h-[16px] min-w-[16px] rounded-full px-1.5 text-xs border border-[rgba(16,25,41,0.1)] bg-[#f9fafb] text-hw-text shrink-0"
                      >
                        {item.notificationCount > 99 ? "99+" : item.notificationCount}
                      </Badge>
                    )}
                    {item.hasIndicator && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    )}
                  </span>
                  {item.hasDropdown && (
                    <ChevronDown className="size-5 ml-0.5" />
                  )}
                </Button>
              );

              if (item.hasDropdown) {
                return (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedMenuItem(item.label)}
                        className={cn(
                          "px-2 py-1.5 rounded-md text-sm transition-colors relative border font-semibold",
                          isSelected
                            ? "bg-[rgba(8,109,255,0.08)] border-[rgba(16,25,41,0.1)] text-hw-text"
                            : "text-hw-text hover:bg-hw-surface-hover border-transparent"
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {item.label}
                          {item.hasIndicator && (
                            <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                          )}
                        </span>
                        <ChevronDown className="size-5 ml-0.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioItem value="option1">
                        Option 1
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="option2">
                        Option 2
                      </DropdownMenuRadioItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return menuItemButton;
            })}
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-1 text-hw-text hover:bg-hw-surface-hover"
            >
              <LayoutGrid className="!size-5" strokeWidth={2.5} />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-1 text-hw-text hover:bg-hw-surface-hover"
              >
                <HelpCircle className="!size-5" strokeWidth={2.5} />
              </Button>
              <div className="absolute top-[2px] right-[2px] w-[8px] h-[8px] rounded-full bg-[#d32f2f] border-[0.625px] border-[rgba(16,25,41,0.1)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

