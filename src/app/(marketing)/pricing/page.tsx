import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    badge: "Starter",
    description:
      "Try Claros on YouTube videos and build your personal Action Kit habit.",
    features: [
      "5 Action Kits per week (resets every 7 days)",
      "Tutorial, Study, and Executive modes",
      "Timestamped checklist + copyable snippets",
      "Flashcards, active recall quiz & mind map",
    ],
    ctaLabel: "Start Free",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/ month",
    badge: "Most Popular",
    description:
      "Unlimited structured kits, PDF & audio ingestion, and full workspace history.",
    features: [
      "Unlimited Action Kits across YouTube, PDF & Audio",
      "Priority OpenRouter frontier model routing",
      "Private & shareable team Action Kit links",
      "Managed via Lemon Squeezy billing portal",
    ],
    ctaLabel: "Upgrade to Pro",
    href: "/dashboard?upgrade=pro",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4">
          Simple SaaS Pricing
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Learn faster, ship sooner.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Start free with weekly credits or unlock unlimited Action Kits on Pro
          with Lemon Squeezy checkout.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlighted
                ? "border-primary shadow-md ring-1 ring-primary/20"
                : undefined
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <Badge variant={plan.highlighted ? "default" : "secondary"}>
                  {plan.highlighted ? <Sparkles className="size-3" /> : null}
                  {plan.badge}
                </Badge>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <CardDescription className="pt-1">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                render={<Link href={plan.href} />}
                nativeButton={false}
              >
                {plan.ctaLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
