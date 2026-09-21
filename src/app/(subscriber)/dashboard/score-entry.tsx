"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScoreEntry() {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>();
  const [score, setScore] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      fetchScores();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return;
    
    try {
      const res = await fetch(`/api/scores/${id}`, { method: "DELETE" });
      if (res.ok) fetchScores();
    } catch (err) {
      console.error(err);
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

  if (loading) return <div>Loading scores...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Enter your last 5 Stableford scores. Only the most recent 5 are retained.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>Add Score</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Score" : "Add New Score"}</DialogTitle>
              <DialogDescription>
                Enter your Stableford score and the date it was achieved.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {error && <div className="text-sm font-medium text-destructive">{error}</div>}
              
              <div className="space-y-2 flex flex-col">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
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
              
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No scores entered yet.
                </TableCell>
              </TableRow>
            ) : (
              scores.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{format(new Date(s.score_date), "PPP")}</TableCell>
                  <TableCell className="font-medium">{s.stableford_score}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
