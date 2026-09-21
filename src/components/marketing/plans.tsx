'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

export function Plans() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="container max-w-4xl text-center space-y-12">
        <div>
          <h2 className="text-display-l font-bold tracking-tight">Choose your plan</h2>
          <p className="text-xl text-text-2 mt-4">Support charity and enter the monthly draw.</p>
        </div>

        {/* Plan Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!isYearly ? 'text-text' : 'text-text-3'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-charity focus:ring-offset-2 focus:ring-offset-bg"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-charity transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-text' : 'text-text-3'}`}>
            Yearly <span className="text-reward ml-1">Save 17%</span>
          </span>
        </div>

        {/* Plan Card */}
        <div className="max-w-lg mx-auto text-left">
          <Card className="border-2 border-line relative overflow-hidden bg-bg shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-charity to-reward" />
            <CardContent className="p-8 md:p-12 space-y-8">
              <div>
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-bold">Standard Subscription</h3>
                  <div className="text-4xl font-display font-bold">
                    ₹{isYearly ? '4,999' : '499'}
                    <span className="text-base text-text-3 font-body font-normal ml-1">
                      /{isYearly ? 'yr' : 'mo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-charity shrink-0 mt-0.5" />
                  <p className="text-text-2">At least 10% goes directly to your chosen charity</p>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-charity shrink-0 mt-0.5" />
                  <p className="text-text-2">Automatic entry into the monthly algorithmic draw (with 5 valid scores)</p>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-charity shrink-0 mt-0.5" />
                  <p className="text-text-2">Win a share of the rolling jackpot</p>
                </div>
              </div>

              <Link href="/signup" className="block w-full">
                <Button size="lg" className="w-full h-14 text-lg">
                  Subscribe
                </Button>
              </Link>
              
              <p className="text-center text-sm text-text-3 pt-2">
                Of every payment: at least 10% to your charity, 50% to the prize pool, the rest runs the platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
