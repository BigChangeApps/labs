import { useNavigate } from "react-router-dom";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Card } from "@/registry/ui/card";
import { getLatestVersion, type PrototypeMetadata, type PrototypeArea, type DeviceType } from "../data/prototypes";

interface PrototypeCardProps {
  prototype: PrototypeMetadata;
}

const areaBannerColors: Record<PrototypeArea, string> = {
  "Asset Management": "bg-emerald-100 text-emerald-800",
  "Finance": "bg-blue-100 text-blue-800",
  "Scheduling": "bg-amber-100 text-amber-800",
  "CRM": "bg-purple-100 text-purple-800",
  "Reporting": "bg-rose-100 text-rose-800",
  "Settings": "bg-slate-100 text-slate-800",
};

const deviceIcons: Record<DeviceType, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PrototypeCard({ prototype }: PrototypeCardProps) {
  const navigate = useNavigate();
  const latestVersion = getLatestVersion(prototype);

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col min-h-[320px]"
      onClick={() => navigate(latestVersion.path, { state: { fromHome: true } })}
    >
      {/* Area banner */}
      <div className={`px-5 py-2.5 text-sm font-medium ${areaBannerColors[prototype.area]}`}>
        {prototype.area}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-2xl font-bold font-display text-foreground group-hover:text-primary transition-colors mb-3">
          {prototype.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-4 flex-1">
          {prototype.description}
        </p>

        {/* Dotted separator */}
        <div className="border-t border-dotted border-border/60 my-4" />

        {/* Footer with device type and last updated */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {prototype.deviceType && (() => {
              const Icon = deviceIcons[prototype.deviceType];
              return <Icon className="h-4 w-4" />;
            })()}
            <span className="capitalize">{prototype.deviceType || "Desktop"}</span>
          </div>
          <span>{formatDate(latestVersion.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
