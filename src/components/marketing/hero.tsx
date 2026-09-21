'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGSAP, gsap } from '@/lib/motion/gsap-marketing';

export function Hero() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'soft' } });
      
      // Mocking SplitText by animating the whole title and sub together
      tl.from('[data-hero-title]', { autoAlpha: 0, y: 30, duration: 1 })
        .from('[data-hero-sub]', { autoAlpha: 0, y: 15, duration: 0.8 }, '-=0.6')
        .from('[data-hero-cta]', { autoAlpha: 0, scale: 0.94, duration: 0.5 }, '-=0.4')
        .from('[data-ripple-ring]', { opacity: 0, scale: 0.5, duration: 1.4, stagger: 0.15, ease: 'power2.out', transformOrigin: 'center' }, 0.2);
    });
    
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-hero-title],[data-hero-sub],[data-hero-cta],[data-ripple-ring]', { autoAlpha: 1 });
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container relative z-10 grid md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Text */}
        <div className="md:col-span-6 space-y-8 z-20">
          <h1 data-hero-title className="text-display-xl font-extrabold tracking-tight text-text leading-tight">
            Give every month.<br />Win some months.
          </h1>
          <p data-hero-sub className="text-xl text-text-2 max-w-lg leading-relaxed">
            Subscribe, pick a charity, and log your latest golf scores. At least 10% of your fee goes to the cause you choose, and your scores enter the monthly prize draw.
          </p>
          <div data-hero-cta className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Subscribe
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" className="text-text-2 hover:text-text hover:underline px-0">
                See how the draw works
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Ripple Field (Abstract representation) */}
        <div className="md:col-span-6 absolute md:relative inset-0 md:inset-auto z-0 flex items-center justify-center opacity-30 md:opacity-100 pointer-events-none">
          <svg className="w-full max-w-[600px] aspect-square overflow-visible" viewBox="0 0 100 100">
            {/* Concentric rings */}
            {[1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                data-ripple-ring
                cx="50"
                cy="50"
                r={i * 12}
                fill="none"
                stroke="var(--color-charity)"
                strokeWidth="0.5"
                className="opacity-50"
              />
            ))}
            
            {/* Floating Card Mock */}
            <g data-ripple-ring className="opacity-90 drop-shadow-2xl">
              <rect x="55" y="25" width="45" height="14" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="0.5" />
              <text x="58" y="31" fontSize="3.5" fill="var(--color-charity)" fontWeight="bold">Featured:</text>
              <text x="58" y="35.5" fontSize="3" fill="var(--color-text)">Digital Heroes Fund</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
