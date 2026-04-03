import { useState, useEffect } from 'react';
import { Ban, Shield, ShieldAlert, ShieldCheck, Search, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  user_roles: { role: string }[];
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, email, full_name, is_banned, ban_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      const userIds = data.map(u => u.user_id);
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const usersWithRoles = data.map(u => ({
        ...u,
        user_roles: rolesData?.filter(r => r.user_id === u.user_id) || [],
      }));
      setUsers(usersWithRoles as UserWithRole[]);
    }
    setIsLoading(false);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true, ban_reason: banReason || 'Violation of terms' })
      .eq('user_id', selectedUser.user_id);

    if (error) {
      toast.error('Failed to ban user');
    } else {
      toast.success(`${selectedUser.full_name || selectedUser.email} has been banned`);
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
      fetchUsers();
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false, ban_reason: null })
      .eq('user_id', userId);

    if (!error) {
      toast.success('User unbanned');
      fetchUsers();
    }
  };

  const handleAssignRole = async (userId: string, role: 'admin' | 'moderator') => {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) {
      if (error.code === '23505') toast.error('User already has this role');
      else toast.error('Failed to assign role');
    } else {
      toast.success(`${role} role assigned`);
      fetchUsers();
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role as 'admin' | 'moderator' | 'user');
    if (!error) {
      toast.success(`${role} role removed`);
      fetchUsers();
    }
  };

  const filtered = users.filter(u =>
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {filtered.length} users • {users.filter(u => u.is_banned).length} banned
      </div>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User: {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Reason for ban</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Spam content, violation of terms..."
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleBanUser} variant="destructive" className="flex-1">
                <Ban className="h-4 w-4 mr-2" />
                Confirm Ban
              </Button>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {filtered.map((userData) => (
          <div
            key={userData.id}
            className={`glass rounded-xl p-4 flex items-center justify-between ${userData.is_banned ? 'border-destructive/50 opacity-75' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium">{userData.full_name || 'No name'}</h3>
                {userData.is_banned && (
                  <span className="px-2 py-0.5 text-xs rounded bg-destructive/20 text-destructive font-medium flex items-center gap-1">
                    <Ban className="h-3 w-3" /> Banned
                  </span>
                )}
                {userData.user_roles?.map((r) => (
                  <span
                    key={r.role}
                    className="px-2 py-0.5 text-xs rounded bg-primary/20 text-primary cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                    onClick={() => handleRemoveRole(userData.user_id, r.role)}
                    title="Click to remove role"
                  >
                    {r.role === 'admin' ? <ShieldAlert className="h-3 w-3 inline mr-1" /> : r.role === 'moderator' ? <ShieldCheck className="h-3 w-3 inline mr-1" /> : null}
                    {r.role}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground truncate">{userData.email}</p>
              {userData.is_banned && userData.ban_reason && (
                <p className="text-xs text-destructive mt-1">Reason: {userData.ban_reason}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {userData.is_banned ? (
                <Button size="sm" variant="outline" onClick={() => handleUnbanUser(userData.user_id)}>
                  <UserCheck className="h-3 w-3 mr-1" />
                  Unban
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    setSelectedUser(userData);
                    setBanDialogOpen(true);
                  }}
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Ban
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => handleAssignRole(userData.user_id, 'moderator')}>
                <Shield className="h-3 w-3 mr-1" />
                Mod
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAssignRole(userData.user_id, 'admin')}>
                <ShieldAlert className="h-3 w-3 mr-1" />
                Admin
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
