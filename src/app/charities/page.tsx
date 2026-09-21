import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function CharitiesPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = await createClient();
  const q = searchParams.q || "";

  let query = supabase.from("charities").select("*").eq("is_active", true).order("name");
  
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: charities } = await query;

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Charity Directory</h1>
          <p className="text-muted-foreground mt-2">
            Discover and support causes that matter. Every subscription contributes to these organizations.
          </p>
        </div>
        
        {/* Simple search form using Server Components */}
        <form className="flex w-full md:w-auto gap-2">
          <Input 
            name="q" 
            placeholder="Search charities..." 
            defaultValue={q} 
            className="w-full md:w-[300px]" 
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {charities && charities.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {charities.map((charity) => (
            <Card key={charity.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{charity.name}</CardTitle>
                  {charity.is_featured && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                  {charity.description}
                </p>
                <div className="flex gap-2 mt-auto">
                  <Link href={`/charities/${charity.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                  <Link href={`/charities/${charity.slug}#donate`} className="flex-1">
                    <Button className="w-full">Donate</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium">No charities found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search terms.</p>
          {q && (
            <Link href="/charities">
              <Button variant="link" className="mt-2">Clear search</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
