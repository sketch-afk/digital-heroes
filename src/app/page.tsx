import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, HeartHandshake, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-40 bg-gradient-to-b from-primary/10 to-background flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        <div className="relative z-10 max-w-4xl space-y-6">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-sm px-4 py-1 mb-4">
            Golf with Purpose
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Play Golf. <span className="text-primary">Win Big.</span> <br /> Give Back.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Digital Heroes is the world's first algorithmic charity lottery for golfers. Submit your Stableford scores, support causes you care about, and win cash prizes every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                Become a Hero
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                How it Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why join Digital Heroes?</h2>
          <p className="text-xl text-muted-foreground">Three reasons to sign up today.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-muted/50 border-none">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Log Your Scores</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Turn your everyday golf rounds into lottery tickets. Every 5 Stableford scores you log qualify you for the monthly mega-draw.
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-none">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Support Charities</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              We donate a flat 20% of all subscription revenue directly to charities. You choose exactly which charity your contribution supports.
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-none">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Win Cash Prizes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Match 3, 4, or 5 numbers in our monthly algorithmic draw to win a share of the massive accumulated prize pool.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-auto py-24 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to tee off?</h2>
          <p className="text-xl opacity-90">
            Join thousands of golfers who are playing with purpose. Subscribe now and get ready for the next monthly draw!
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg h-14 px-10 rounded-full mt-4">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Inline badge component to keep it simple since we didn't import from ui folder
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
      {children}
    </span>
  );
}
