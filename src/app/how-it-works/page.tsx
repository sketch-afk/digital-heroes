import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorksPage() {
  return (
    <div className="container py-16 max-w-4xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">How It Works</h1>
        <p className="text-xl text-muted-foreground">
          Join Digital Heroes, submit your golf scores, support charities, and win cash prizes every month.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="text-3xl font-black text-primary mb-2">1</div>
            <CardTitle>Subscribe & Choose a Charity</CardTitle>
          </CardHeader>
          <CardContent>
            Sign up for a monthly or yearly subscription. 20% of your subscription fee goes directly to a charity of your choice, and 30% goes into the monthly prize pool.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-3xl font-black text-primary mb-2">2</div>
            <CardTitle>Play Golf & Log Scores</CardTitle>
          </CardHeader>
          <CardContent>
            Play your regular rounds of golf. Log exactly 5 Stableford scores into your dashboard over the course of the month to qualify for the draw.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-3xl font-black text-primary mb-2">3</div>
            <CardTitle>The Monthly Draw</CardTitle>
          </CardHeader>
          <CardContent>
            At the end of every month, we run our Algorithmic Draw. Five winning numbers (between 1 and 45) are generated. Your 5 submitted Stableford scores act as your lottery ticket!
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-3xl font-black text-primary mb-2">4</div>
            <CardTitle>Match & Win</CardTitle>
          </CardHeader>
          <CardContent>
            If your scores match 3, 4, or 5 of the winning numbers, you win a share of the massive prize pool! Simply upload a screenshot of your official golf handicap record to claim your prize.
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-16 bg-muted rounded-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to become a Digital Hero?</h2>
        <p className="text-muted-foreground">Start playing, start giving, and start winning today.</p>
        <div className="pt-4">
          <a href="/signup" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
