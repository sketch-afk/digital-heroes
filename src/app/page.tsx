import { Hero } from "@/components/marketing/hero";
import { ImpactStrip } from "@/components/marketing/impact-strip";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Plans } from "@/components/marketing/plans";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SmoothScroll />
      
      <Hero />
      <ImpactStrip />
      <HowItWorks />
      <Plans />

      {/* Final CTA */}
      <section className="py-32 px-6 text-center border-t border-line">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-display-l font-bold">Make your scores count.</h2>
          <p className="text-xl text-text-2">
            Join the algorithmic draw and start supporting your chosen cause today.
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Subscribe
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
