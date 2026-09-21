'use client';
import { useRef } from 'react';
import { useGSAP, gsap, ScrollTrigger } from '@/lib/motion/gsap-marketing';

export function ImpactStrip() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const stats = gsap.utils.toArray<HTMLElement>('[data-count-up]');
    
    stats.forEach(stat => {
      const target = parseInt(stat.dataset.countUp || '0', 10);
      const proxy = { v: 0 };
      
      gsap.to(proxy, {
        v: target,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stat,
          start: 'top 90%',
          once: true
        },
        onUpdate: () => {
          // Format as INR if it's currency, else standard
          if (stat.dataset.type === 'currency') {
            stat.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(proxy.v);
          } else {
            stat.textContent = new Intl.NumberFormat('en-IN').format(Math.round(proxy.v));
          }
        }
      });
    });
  }, { scope: container });

  return (
    <section ref={container} className="py-12 border-y border-line bg-surface/50 backdrop-blur-sm">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-line">
        <div className="px-4 py-4 md:py-0">
          <div className="text-sm font-medium text-text-3 uppercase tracking-wider mb-2">Raised for Charities</div>
          <div data-count-up="1250000" data-type="currency" className="text-4xl font-bold text-charity font-display tabular-nums">
            ₹0
          </div>
        </div>
        <div className="px-4 py-4 md:py-0">
          <div className="text-sm font-medium text-text-3 uppercase tracking-wider mb-2">Current Jackpot</div>
          <div data-count-up="500000" data-type="currency" className="text-4xl font-bold text-reward font-display tabular-nums">
            ₹0
          </div>
        </div>
        <div className="px-4 py-4 md:py-0">
          <div className="text-sm font-medium text-text-3 uppercase tracking-wider mb-2">Active Members</div>
          <div data-count-up="4250" data-type="number" className="text-4xl font-bold text-text font-display tabular-nums">
            0
          </div>
        </div>
      </div>
    </section>
  );
}
