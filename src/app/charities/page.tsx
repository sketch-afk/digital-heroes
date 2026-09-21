import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Heart } from "lucide-react";

export default async function CharitiesPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = await createClient();
  const q = searchParams.q || "";

  let query = supabase.from("charities").select("*").eq("is_active", true).order("name");
  
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: charities } = await query;

  return (
    <div className="container py-16 md:py-24 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-line pb-8">
        <div className="max-w-2xl">
          <h1 className="text-display-l font-bold tracking-tight">Charity Directory</h1>
          <p className="text-xl text-text-2 mt-4">
            Discover and support causes that matter. Every subscription guarantees at least 10% goes directly to the organization you choose.
          </p>
        </div>
        
        <form className="flex w-full md:w-auto relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-3" />
          <Input 
            name="q" 
            placeholder="Search charities..." 
            defaultValue={q} 
            className="w-full md:w-[320px] pl-11 rounded-full bg-surface-2 border-transparent focus-visible:border-charity" 
          />
        </form>
      </div>

      {charities && charities.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {charities.map((charity, index) => {
            const isFeatured = charity.is_featured && index === 0;
            return (
              <Card 
                key={charity.id} 
                className={`flex flex-col h-full border-line transition-colors hover:border-charity/50 ${isFeatured ? 'md:col-span-2 rounded-[36px] bg-gradient-to-br from-surface to-surface-2' : ''}`}
              >
                <CardHeader className={isFeatured ? 'p-8 md:p-12' : ''}>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className={`font-bold ${isFeatured ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                      {charity.name}
                    </CardTitle>
                    {charity.is_featured && (
                      <span className="shrink-0 px-3 py-1 bg-charity/10 text-charity text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> Featured
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={`flex-1 flex flex-col justify-between ${isFeatured ? 'p-8 md:p-12 pt-0 md:pt-0' : ''}`}>
                  <p className={`text-text-2 mb-8 ${isFeatured ? 'text-lg max-w-xl line-clamp-4' : 'text-sm line-clamp-3'}`}>
                    {charity.description}
                  </p>
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/charities/${charity.slug}`} className="flex-1">
                      <Button variant="secondary" className="w-full">View Details</Button>
                    </Link>
                    <Link href={`/charities/${charity.slug}#donate`} className="flex-1">
                      <Button className="w-full">Donate</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-surface-2/50 rounded-[36px] border border-line border-dashed">
          <Heart className="w-12 h-12 text-text-3 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold">No charities found</h3>
          <p className="text-text-2 mt-2">Try adjusting your search terms.</p>
          {q && (
            <Link href="/charities">
              <Button variant="ghost" className="mt-4 text-charity hover:text-charity hover:bg-charity/10">Clear search</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
