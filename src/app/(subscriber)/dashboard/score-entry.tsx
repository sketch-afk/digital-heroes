"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, Flip, useGSAP } from "@/lib/motion/gsap-core";
import { Skeleton } from "@/components/ui/skeleton";

export function ScoreEntry() {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>();
  const [score, setScore] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a Flip state whenever scores change
  const [layoutState, setLayoutState] = useState<Flip.FlipState | null>(null);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/scores");
      const data = await res.json();
      if (data.data) {
        setScores(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    if (layoutState && containerRef.current) {
      Flip.from(layoutState, {
        duration: 0.6,
        ease: "soft",
        targets: ".score-card",
        onEnter: elements => gsap.fromTo(elements, { opacity: 0, y: -20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "soft" }),
        onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.4, ease: "power2.in" })
      });
    }
  }, [scores]);

  const updateScoresWithFlip = (newScores: any[]) => {
    if (containerRef.current) {
      const state = Flip.getState(".score-card");
      setLayoutState(state);
    }
    setScores(newScores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !score) {
      setError("Please select a date and enter a score.");
      return;
    }

    const s = parseInt(score, 10);
    if (s < 1 || s > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const payload = { score_date: formattedDate, score: s };

    try {
      const url = editId ? `/api/scores/${editId}` : "/api/scores";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save score");
      }

      setEditId(null);
      setDate(undefined);
      setScore("");
      setIsDialogOpen(false);
      
      // Re-fetch but we could ideally optimistic update for instant flip
      // We will do a full refetch here which will trigger Flip if we set state before
      const refetchRes = await fetch("/api/scores");
      const refetchData = await refetchRes.json();
      updateScoresWithFlip(refetchData.data || []);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return;
    
    try {
      // Optimistic update for immediate Flip animation
      const filtered = scores.filter(s => s.id !== id);
      updateScoresWithFlip(filtered);
      
      await fetch(`/api/scores/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchScores(); // revert on fail
    }
  };

  const openEdit = (scoreObj: any) => {
    setEditId(scoreObj.id);
    setDate(new Date(scoreObj.score_date));
    setScore(scoreObj.stableford_score.toString());
    setError(null);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setDate(undefined);
    setScore("");
    setError(null);
    setIsDialogOpen(true);
  };

  if (loading && scores.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-text-2">
          Only your 5 most recent scores are retained for the draw.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>Add Score</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-display-m">{editId ? "Edit Score" : "Add New Score"}</DialogTitle>
              <DialogDescription>
                Enter your Stableford score and the date it was achieved.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {error && <div className="text-sm font-medium text-danger">{error}</div>}
              
              <div className="space-y-2 flex flex-col">
                <Label>Date of round</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal bg-card h-12", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-line shadow-xl rounded-2xl">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Stableford Score (1-45)</Label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full sm:w-auto">Save Score</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div ref={containerRef} className="space-y-3 relative">
        {scores.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-line rounded-2xl bg-surface-2/30">
            <p className="text-text-3">No scores entered yet.</p>
          </div>
        ) : (
          scores.map((s, index) => (
            <div 
              key={s.id} 
              className="score-card flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-line shadow-sm"
              data-flip-id={s.id}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-line flex items-center justify-center font-display font-bold text-xl text-reward">
                  {s.stableford_score}
                </div>
                <div>
                  <div className="font-bold text-text">Score #{index + 1}</div>
                  <div className="text-xs text-text-3">{format(new Date(s.score_date), "PPP")}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" className="text-text-2 hover:text-text hover:bg-surface" onClick={() => openEdit(s)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
