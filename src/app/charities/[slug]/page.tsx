import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DonationForm } from "./donation-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function CharityProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: charity } = await supabase
    .from("charities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!charity) {
    notFound();
  }

  // Fetch upcoming events for this charity
  const { data: events } = await supabase
    .from("charity_events")
    .select("*")
    .eq("charity_id", charity.id)
    .order("event_date", { ascending: true })
    .limit(5);

  return (
    <div className="container py-10 space-y-8 max-w-4xl mx-auto">
      <Link href="/charities" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Charities
      </Link>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{charity.name}</h1>
        {charity.is_featured && (
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            Featured Partner
          </span>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {charity.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            {events && events.length > 0 ? (
              <div className="grid gap-4">
                {events.map((evt) => (
                  <Card key={evt.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{evt.title}</CardTitle>
                      <CardDescription>
                        {new Date(evt.event_date).toLocaleDateString()} {evt.location ? `• ${evt.location}` : ''}
                      </CardDescription>
                    </CardHeader>
                    {evt.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{evt.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground bg-muted/30 p-6 rounded-lg border border-dashed text-center">
                No upcoming events listed at the moment.
              </p>
            )}
          </section>
        </div>

        <div>
          <Card className="sticky top-20" id="donate">
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>
                Support {charity.name} directly. 100% of independent donations go straight to the charity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonationForm charityId={charity.id} charityName={charity.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
