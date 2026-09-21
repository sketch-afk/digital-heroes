"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userScores, setUserScores] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.data) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setSelectedUser(data.data);
        setUserScores(data.data.scores || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingDetails(false);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const full_name = (form.elements.namedItem('full_name') as HTMLInputElement).value;
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", full_name })
      });
      if (res.ok) {
        alert("Profile updated");
        handleSelectUser(selectedUser.id);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelSub = async () => {
    if (!confirm("Force cancel this user's subscription immediately?")) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_subscription" })
      });
      if (res.ok) {
        alert("Subscription cancelled");
        handleSelectUser(selectedUser.id);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRole = async () => {
    const newRole = selectedUser.role === 'admin' ? 'subscriber' : 'admin';
    if (!confirm(`Are you sure you want to make this user a ${newRole}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_role", role: newRole })
      });
      if (res.ok) {
        alert(`User is now a ${newRole}`);
        handleSelectUser(selectedUser.id);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm("Delete this score record?")) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_score", score_id: scoreId })
      });
      if (res.ok) {
        handleSelectUser(selectedUser.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-[300px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (selectedUser) {
    const sub = selectedUser.subscriptions?.[0];
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedUser(null)}>← Back to List</Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage User</h1>
          <p className="text-muted-foreground">{selectedUser.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Profile</CardTitle>
              <Button 
                variant={selectedUser.role === 'admin' ? 'destructive' : 'default'} 
                size="sm" 
                onClick={handleToggleRole}
              >
                {selectedUser.role === 'admin' ? 'Demote to Subscriber' : 'Promote to Admin'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName} className="flex gap-4">
                <Input name="full_name" defaultValue={selectedUser.full_name} required />
                <Button type="submit">Update</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Override</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                <div>
                  <div className="font-medium">Status: {sub ? sub.status : 'None'}</div>
                  <div className="text-sm text-muted-foreground">Plan: {sub ? sub.plan : 'N/A'}</div>
                </div>
                {sub?.status === 'active' && (
                  <Button variant="destructive" onClick={handleCancelSub}>Force Cancel</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Scores</CardTitle>
            <CardDescription>Administrators can manually remove invalid scores.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : userScores.length === 0 ? (
              <div className="text-muted-foreground">No scores found for this user.</div>
            ) : (
              <div className="divide-y border rounded-lg">
                {userScores.map(score => (
                  <div key={score.id} className="flex justify-between items-center p-4 hover:bg-muted/50">
                    <div>
                      <div className="font-medium text-lg text-primary">{score.stableford_score} pts</div>
                      <div className="text-sm text-muted-foreground">Date: {score.score_date}</div>
                    </div>
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteScore(score.id)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage profiles, subscriptions, and scores.</p>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Charity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const sub = u.subscriptions?.[0];
                const isActive = sub?.status === 'active';
                return (
                  <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{u.full_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>{u.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-600' : ''}>
                        {sub?.status || 'none'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {u.charities?.name || 'None'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleSelectUser(u.id)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
