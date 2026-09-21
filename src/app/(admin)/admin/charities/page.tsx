"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/charities");
      const data = await res.json();
      if (res.ok && data.data) {
        setCharities(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Convert checkbox to boolean string for formData
    const isFeatured = form.elements.namedItem('is_featured') as HTMLInputElement;
    formData.set('is_featured', isFeatured.checked ? 'true' : 'false');

    try {
      const res = await fetch("/api/admin/charities", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      
      form.reset();
      fetchCharities();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charity? This might break users who have already selected it!")) return;
    
    try {
      const res = await fetch(`/api/admin/charities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      
      fetchCharities();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charity Management</h1>
        <p className="text-muted-foreground">Add, edit, or remove charities from the platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Charity</CardTitle>
              <CardDescription>Upload logo and details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Charity Name</label>
                  <Input name="name" required placeholder="e.g. Red Cross" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input name="description" placeholder="Brief description..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo Image</label>
                  <Input type="file" name="logo" accept="image/*" />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="is_featured" name="is_featured" className="rounded border-gray-300" />
                  <label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Featured Charity
                  </label>
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Adding..." : "Add Charity"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Registered Charities</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {charities.length === 0 && (
                    <div className="text-muted-foreground">No charities found.</div>
                  )}
                  {charities.map(charity => (
                    <div key={charity.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center space-x-4">
                        {charity.logo_url ? (
                          <img src={charity.logo_url} alt={charity.name} className="w-12 h-12 rounded-full object-cover border" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {charity.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{charity.name} {charity.is_featured && <Badge className="ml-1" variant="secondary">Featured</Badge>}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{charity.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(charity.id)}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
