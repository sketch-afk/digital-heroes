"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDrawMonth, setNewDrawMonth] = useState("");
  const [newDrawMode, setNewDrawMode] = useState("random");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/draws")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setDraws(data.data);
        }
        setLoading(false);
      });
  }, []);

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Append day to get YYYY-MM-01 format
      const monthStr = `${newDrawMonth}-01`;
      
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draw_month: monthStr,
          mode: newDrawMode,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error?.message || "Failed to create draw");
        return;
      }
      
      router.push(`/admin/draws/${data.data.id}`);
    } catch (err) {
      alert("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Draw Management</h1>
        <p className="text-muted-foreground">Manage monthly prize draws, run simulations, and publish results.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {draws.map((draw) => (
            <Card key={draw.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">{new Date(draw.draw_month).toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
                  <CardDescription>Mode: {draw.mode}</CardDescription>
                </div>
                <Badge variant={draw.status === 'published' ? 'default' : draw.status === 'simulated' ? 'secondary' : 'outline'}>
                  {draw.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    {draw.status === 'published' && `Pool: ₹${(draw.pool_total / 100).toFixed(2)}`}
                  </div>
                  <Link href={`/admin/draws/${draw.id}`}>
                    <Button variant="outline">Manage Draw</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {draws.length === 0 && (
            <div className="text-center p-8 border rounded-lg text-muted-foreground">
              No draws have been created yet.
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Draw</CardTitle>
              <CardDescription>Initialize a draft draw for a specific month.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDraw} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Draw Month</label>
                  <Input 
                    type="month" 
                    required 
                    value={newDrawMonth}
                    onChange={(e) => setNewDrawMonth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Draw Engine Mode</label>
                  <Select onValueChange={(val) => val && setNewDrawMode(val)} defaultValue={newDrawMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random (Standard)</SelectItem>
                      <SelectItem value="algorithmic">Algorithmic (Frequency Weighted)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Algorithmic mode favors numbers that have been submitted frequently by eligible players this month.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create Draft"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
