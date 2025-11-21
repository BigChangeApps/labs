import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";
import { getLatestVersion, type PrototypeMetadata } from "../data/prototypes";

interface PrototypeCardProps {
  prototype: PrototypeMetadata;
}

export function PrototypeCard({ prototype }: PrototypeCardProps) {
  const navigate = useNavigate();
  const latestVersion = getLatestVersion(prototype);

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm"
      onClick={() => navigate(latestVersion.path, { state: { fromHome: true } })}
    >
      <CardHeader className="space-y-4">
        <div className="aspect-video w-full rounded-md bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
          {prototype.thumbnail ? (
            <img
              src={prototype.thumbnail}
              alt={prototype.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl font-bold text-muted-foreground/30">
              {prototype.title.charAt(0)}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {prototype.title}
          </CardTitle>
          <CardDescription className="text-base line-clamp-2">
            {prototype.description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
