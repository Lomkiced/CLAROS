import { GitBranch, Layers, Lightbulb, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KitSummary, MindMapNode } from "@/types/kit";

interface MindMapProps {
  summary: KitSummary;
}

function MindMapBranch({
  node,
  depth = 0,
}: {
  node: MindMapNode;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? "ml-4 border-l pl-4 pt-2" : "space-y-3"}>
      <div className="rounded-lg border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 shrink-0 text-primary" />
          <span className="text-sm font-medium">{node.label}</span>
        </div>
        {node.details ? (
          <p className="mt-1 text-xs text-muted-foreground">{node.details}</p>
        ) : null}
      </div>

      {node.children && node.children.length > 0 ? (
        <div className="space-y-2">
          {node.children.map((child) => (
            <MindMapBranch key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MindMap({ summary }: MindMapProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-amber-500" />
            Core Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
            {summary.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-primary" />
            Concept Mind Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MindMapBranch node={summary.mindMap} />
        </CardContent>
      </Card>

      {summary.toolsAndResources.length > 0 ||
      summary.prerequisites.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="size-4 text-muted-foreground" />
              Tools & Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.prerequisites.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Prerequisites
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {summary.prerequisites.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {summary.toolsAndResources.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Referenced Stack & Tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {summary.toolsAndResources.map((tool, idx) =>
                    tool.url ? (
                      <a
                        key={idx}
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {tool.name}
                          {tool.category ? ` · ${tool.category}` : ""}
                        </Badge>
                      </a>
                    ) : (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tool.name}
                        {tool.category ? ` · ${tool.category}` : ""}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
