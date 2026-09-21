'use client';
import { useRef } from 'react';
import { useGSAP, gsap } from '@/lib/motion/gsap-marketing';
import { HeartHandshake, Target, Trophy } from 'lucide-react';

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${steps.length * 60}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      steps.forEach((step, i) => {
        tl.from(step, { autoAlpha: 0, x: 40, duration: 1 })
          .to('[data-step-progress]', { scaleY: (i + 1) / steps.length, duration: 1, transformOrigin: 'top' }, '<');
          
        if (i < steps.length - 1) {
          tl.to(step, { autoAlpha: 0.25, duration: 1 });
        }
      });
    });
  }, { scope: sectionRef });

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 md:py-32 bg-bg min-h-screen flex items-center">
      <div className="container max-w-5xl">
        <div className="text-center md:text-left mb-16 md:mb-0 md:w-1/3 md:absolute md:left-8 lg:left-auto">
          <h2 className="text-display-l font-bold tracking-tight">How it works</h2>
          <p className="text-xl text-text-2 mt-4 max-w-sm">
            Three simple steps to make an impact and win.
          </p>
        </div>

        <div className="md:w-1/2 md:ml-auto relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-line hidden md:block">
            <div data-step-progress className="absolute top-0 left-0 w-full bg-charity origin-top" style={{ transform: 'scaleY(0)' }} />
          </div>

          <div className="space-y-12 md:space-y-32 md:pl-20">
            <div data-step className="relative flex gap-6 md:gap-8 items-start">
              <div className="shrink-0 w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center z-10 md:absolute md:-left-8 md:top-0 md:-translate-x-1/2">
                <HeartHandshake className="w-8 h-8 text-charity" />
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-bold">1. Choose a cause</h3>
                <p className="text-text-2 text-lg mt-3 leading-relaxed">
                  Select a registered charity you care about. We guarantee at least 10% of your subscription goes directly to them.
                </p>
              </div>
            </div>

            <div data-step className="relative flex gap-6 md:gap-8 items-start">
              <div className="shrink-0 w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center z-10 md:absolute md:-left-8 md:top-0 md:-translate-x-1/2">
                <Target className="w-8 h-8 text-charity" />
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-bold">2. Log your scores</h3>
                <p className="text-text-2 text-lg mt-3 leading-relaxed">
                  Submit your latest 5 Stableford scores. They are rolling, meaning your oldest score drops off when you add a new one.
                </p>
              </div>
            </div>

            <div data-step className="relative flex gap-6 md:gap-8 items-start">
              <div className="shrink-0 w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center z-10 md:absolute md:-left-8 md:top-0 md:-translate-x-1/2">
                <Trophy className="w-8 h-8 text-reward" />
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-bold">3. Enter the draw</h3>
                <p className="text-text-2 text-lg mt-3 leading-relaxed">
                  If you have 5 scores logged, you automatically enter the monthly prize draw. Match 3, 4, or 5 numbers to win!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
