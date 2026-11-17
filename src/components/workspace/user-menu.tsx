"use client";

import Link from "next/link";
import { ChevronDown, CreditCard, LayoutDashboard, Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  email?: string | null;
  plan?: "FREE" | "PRO";
}

export function UserMenu({ email, plan = "FREE" }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <User className="size-3.5" />
            <span className="hidden sm:inline max-w-36 truncate">
              {email ?? "Guest Preview"}
            </span>
            <Badge variant={plan === "PRO" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
              {plan}
            </Badge>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {email ?? "Preview Workspace"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/dashboard" />}>
            <LayoutDashboard className="size-4" />
            My Kits
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/kits" />}>
            <Sparkles className="size-4" />
            Public Directory
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/pricing" />}>
            <CreditCard className="size-4" />
            Billing & Plan ({plan})
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
