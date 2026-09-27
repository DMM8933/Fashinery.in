import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserCheck,
  UserX,
  Trash2,
  Copy,
  Check,
  Crown,
  KeyRound,
  AlertTriangle,
  Search,
  Filter,
  Users,
  Shield,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AdminUser, AdminRole } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const AdminUsersTab: React.FC = () => {
  const {
    user,
    isSuperAdmin,
    adminRole,
    adminUsers,
    addAdminUser,
    updateAdminUserStatus,
    updateAdminUserRole,
    deleteAdminUser,
  } = useStore();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Add Admin Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newUid, setNewUid] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');
  const [newIsActive, setNewIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Edit Role Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>('admin');

  // Delete Confirmation State
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Registered Customer Accounts (for Quick Promotion)
  const [registeredCustomers, setRegisteredCustomers] = useState<
    Array<{ uid: string; email: string; displayName?: string; createdAt?: string }>
  >([]);
  const [showRegisteredUsers, setShowRegisteredUsers] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Copied feedback helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedId(uid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch registered users for quick promotion
  useEffect(() => {
    if (showRegisteredUsers && isSuperAdmin) {
      setLoadingCustomers(true);
      getDocs(collection(db, 'users'))
        .then((snapshot) => {
          const list: Array<{ uid: string; email: string; displayName?: string; createdAt?: string }> = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              uid: docSnap.id,
              email: data.email || '',
              displayName: data.displayName || data.name || '',
              createdAt: data.createdAt || '',
            });
          });
          setRegisteredCustomers(list);
        })
        .catch((err) => {
          console.warn('Could not load user accounts for promotion:', err);
        })
        .finally(() => setLoadingCustomers(false));
    }
  }, [showRegisteredUsers, isSuperAdmin]);

  // Filtered admin users
  const filteredAdmins = adminUsers.filter((admin) => {
    const matchesSearch =
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.name && admin.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.uid && admin.uid.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && admin.isActive) ||
      (statusFilter === 'disabled' && !admin.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate summary counts
  const totalAdmins = adminUsers.length;
  const superAdminsCount = adminUsers.filter((a) => a.role === 'superadmin').length;
  const activeAdminsCount = adminUsers.filter((a) => a.isActive).length;
  const disabledAdminsCount = adminUsers.filter((a) => !a.isActive).length;

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Administrator email address is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAdminUser({
        email: cleanEmail,
        name: newName.trim() || undefined,
        uid: newUid.trim() || undefined,
        role: newRole,
        isActive: newIsActive,
      });

      setFormSuccess(`Administrator ${cleanEmail} successfully authorized.`);
      setNewEmail('');
      setNewName('');
      setNewUid('');
      setNewRole('admin');
      setNewIsActive(true);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to authorize administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPromote = (cust: { uid: string; email: string; displayName?: string }) => {
    setNewEmail(cust.email);
    setNewName(cust.displayName || '');
    setNewUid(cust.uid);
    setNewRole('admin');
    setNewIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    if (!isSuperAdmin) return;
    if (admin.uid === user?.uid && admin.isActive) {
      alert('Action blocked: You cannot disable your own active Super Administrator account.');
      return;
    }
    const newStatus = !admin.isActive;
    const actionText = newStatus ? 'activate' : 'disable';
    if (window.confirm(`Are you sure you want to ${actionText} access for ${admin.email}?`)) {
      try {
        await updateAdminUserStatus(admin.id, newStatus);
      } catch (err: any) {
        alert(err?.message || `Failed to ${actionText} admin.`);
      }
    }
  };

  const handleSaveRole = async () => {
    if (!editingAdmin || !isSuperAdmin) return;
    try {
      await updateAdminUserRole(editingAdmin.id, editRole);
      setEditingAdmin(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to update administrator role.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete || !isSuperAdmin) return;
    if (adminToDelete.uid === user?.uid) {
      alert('Action blocked: You cannot remove your own active Super Administrator account.');
      setAdminToDelete(null);
      return;
    }
    try {
      await deleteAdminUser(adminToDelete.id);
      setAdminToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to remove administrator account.');
    }
  };

  return (
    <div id="admin-users-tab" className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Role-Based Access Control
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              <Lock className="w-3 h-3" />
              Protected by Firestore Security Rules
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            Admin Users Management
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Only accounts explicitly authorized in this registry can access <span className="font-mono text-stone-300">/admin</span> and modify products, orders, coupons, or store configuration. Standard customer accounts can never access administrative tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isSuperAdmin && (
            <button
              id="btn-add-admin-user"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Authorize New Admin</span>
            </button>
          )}

          <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700 text-right">
            <div className="text-[10px] text-stone-400 uppercase font-semibold">Your Privilege Level</div>
            <div className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1 mt-0.5">
              <Crown className="w-3 h-3" />
              <span>{isSuperAdmin ? 'Super Administrator' : adminRole ? adminRole.toUpperCase() : 'Administrator'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permission notice if not Super Admin */}
      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-white">Super Administrator Privileges Required:</strong>{' '}
            Your account has standard administrator access. Only verified Super Administrators can add, promote, disable, or delete admin accounts. Contact <span className="font-mono text-amber-300">dheeraj8933@gmail.com</span> to modify role permissions.
          </div>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Authorized</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-stone-900">{totalAdmins}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Registry accounts in Firestore</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Super Admins</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-amber-700">{superAdminsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Full governance rights</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Active Admins</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-emerald-700">{activeAdminsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Permitted to access /admin</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Disabled</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-rose-700">{disabledAdminsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Blocked by Security Rules</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="input-search-admins"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, or UID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-stone-900 bg-stone-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            id="select-filter-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-lg border border-stone-200 text-xs bg-white text-stone-800"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>

          <select
            id="select-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-lg border border-stone-200 text-xs bg-white text-stone-800"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setShowRegisteredUsers(!showRegisteredUsers)}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
              title="Promote existing registered customer accounts"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{showRegisteredUsers ? 'Hide Customers' : 'Browse Customers to Promote'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Customer Promotion Panel (Expandable for Super Admin) */}
      {showRegisteredUsers && isSuperAdmin && (
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-stone-900 text-xs">
                Registered Customer Accounts (One-Click Admin Promotion)
              </h3>
              <p className="text-[11px] text-stone-500">
                Click &quot;Promote&quot; to authorize an existing user with an administrative role without typing their UID.
              </p>
            </div>
            {loadingCustomers && (
              <span className="text-xs text-stone-400">Loading accounts...</span>
            )}
          </div>

          {registeredCustomers.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-2">
              No registered customer profiles found in database yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {registeredCustomers.map((cust, custIdx) => {
                const isAlreadyAdmin = adminUsers.some(
                  (a) => a.email === cust.email || a.uid === cust.uid
                );
                return (
                  <div
                    key={cust.uid ? `cust-${cust.uid}` : `cust-${cust.email || custIdx}-${custIdx}`}
                    className="p-2.5 rounded-lg bg-white border border-stone-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-stone-900 text-xs truncate">
                        {cust.displayName || cust.email}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">{cust.email}</div>
                    </div>
                    {isAlreadyAdmin ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        Admin
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickPromote(cust)}
                        className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium shrink-0"
                      >
                        Promote
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Users Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Firebase UID</th>
                <th className="py-3 px-4">Role & Permissions</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4">Added Details</th>
                {isSuperAdmin && <th className="py-3 px-4 text-right">Super Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    <ShieldAlert className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-medium">No administrators found matching criteria</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {searchQuery ? 'Try adjusting your search query' : 'Click "Authorize New Admin" to register one'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, adminIdx) => {
                  const isCurrentLoggedUser = admin.uid === user?.uid || admin.email === user?.email;
                  const isBootstrapOwner = admin.email === 'dheeraj8933@gmail.com';

                  return (
                    <tr
                      key={`${admin.id || admin.uid || admin.email || 'admin'}-${adminIdx}`}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        !admin.isActive ? 'opacity-60 bg-stone-50/40' : ''
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              admin.role === 'superadmin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <span>{admin.name || admin.email.split('@')[0]}</span>
                              {isCurrentLoggedUser && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-900 text-white uppercase">
                                  You
                                </span>
                              )}
                              {isBootstrapOwner && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* UID with copy button */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                        {admin.uid ? (
                          <div className="inline-flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                            <span className="truncate max-w-[120px]" title={admin.uid}>
                              {admin.uid}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUid(admin.uid)}
                              className="text-stone-400 hover:text-stone-700 cursor-pointer"
                              title="Copy Firebase UID"
                            >
                              {copiedId === admin.uid ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Auto-links on sign-in</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {admin.role === 'superadmin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-semibold">
                            <Crown className="w-3 h-3 text-amber-700" />
                            <span>Super Admin</span>
                          </span>
                        )}
                        {admin.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                            <Shield className="w-3 h-3 text-blue-600" />
                            <span>Administrator</span>
                          </span>
                        )}
                        {admin.role === 'editor' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Content Editor</span>
                          </span>
                        )}
                      </td>

                      {/* Access Status */}
                      <td className="py-3.5 px-4">
                        {admin.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active / Authorized</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Disabled / Blocked</span>
                          </span>
                        )}
                      </td>

                      {/* Added details */}
                      <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>
                            {admin.addedAt
                              ? new Date(admin.addedAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'System Record'}
                          </span>
                        </div>
                        {admin.addedBy && (
                          <div className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[140px]" title={admin.addedBy}>
                            By {admin.addedBy}
                          </div>
                        )}
                      </td>

                      {/* Super Admin Actions */}
                      {isSuperAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Toggle Active / Disabled */}
                            <button
                              type="button"
                              id={`btn-toggle-status-${admin.id}`}
                              onClick={() => handleToggleStatus(admin)}
                              disabled={isCurrentLoggedUser && admin.isActive}
                              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                                admin.isActive
                                  ? 'border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                                  : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              } ${isCurrentLoggedUser && admin.isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={
                                isCurrentLoggedUser && admin.isActive
                                  ? 'Cannot disable own account'
                                  : admin.isActive
                                  ? 'Disable admin access'
                                  : 'Enable admin access'
                              }
                            >
                              {admin.isActive ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Edit Role */}
                            <button
                              type="button"
                              id={`btn-edit-role-${admin.id}`}
                              onClick={() => {
                                setEditingAdmin(admin);
                                setEditRole(admin.role);
                              }}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
                              title="Modify role"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Admin */}
                            <button
                              type="button"
                              id={`btn-delete-admin-${admin.id}`}
                              onClick={() => setAdminToDelete(admin)}
                              disabled={isCurrentLoggedUser}
                              className={`p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer ${
                                isCurrentLoggedUser ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title={
                                isCurrentLoggedUser
                                  ? 'Cannot delete own account'
                                  : 'Delete administrator'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Architecture Reference Card */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 text-xs text-stone-600 space-y-2">
        <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Fashinery Security Guarantees</span>
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>
              <strong>Server-Side Firestore Rules:</strong> Non-admin users cannot write to products, orders, coupons, or settings even if they forge API requests.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>
              <strong>Customer Account Isolation:</strong> Regular customer sign-ins (via Google or email) never gain administrative access.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>
              <strong>Anti Self-Promotion:</strong> Only authenticated Super Admins can add or elevate users in the <span className="font-mono text-stone-800">admins</span> collection.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>
              <strong>No Public Registration:</strong> Public visitors cannot create admin accounts from the storefront.
            </span>
          </li>
        </ul>
      </div>

      {/* ADD ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    Authorize New Administrator
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Grant administrative dashboard and catalog access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Administrator Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. colleague@fashinery.com"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  The Google account or email the administrator will use to sign in on <span className="font-mono">/admin-login</span>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Firebase Authentication UID (Optional)
                </label>
                <input
                  type="text"
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="e.g. jA8s9D8f7S6d5F4g3H2j1K..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:border-stone-900"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  If the administrator already has an account, enter their 28-character Firebase UID. If not known, leave blank and our system will map the account automatically upon first authorized sign-in.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Role & Permissions *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 bg-stone-50/50"
                  >
                    <option value="superadmin">Super Admin (All Permissions)</option>
                    <option value="admin">Administrator (Catalog & Orders)</option>
                    <option value="editor">Editor (Catalog Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Initial Status
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="new-admin-active"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 border-stone-300 cursor-pointer"
                    />
                    <label htmlFor="new-admin-active" className="text-xs text-stone-700 font-medium cursor-pointer">
                      Activate Immediately
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Authorizing...' : 'Authorize Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 relative">
            <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
              Update Administrator Role
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Select new role for <strong className="text-stone-800">{editingAdmin.email}</strong>.
            </p>

            <div className="space-y-2 mb-5">
              {[
                { id: 'superadmin', label: 'Super Admin', desc: 'Can manage other admins, store settings, products & orders' },
                { id: 'admin', label: 'Administrator', desc: 'Can manage catalog, orders, coupons, banners, and policies' },
                { id: 'editor', label: 'Editor', desc: 'Can view and update products, categories, and FAQs' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    editRole === opt.id
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="editRoleRadio"
                    checked={editRole === opt.id}
                    onChange={() => setEditRole(opt.id as AdminRole)}
                    className="mt-0.5 text-stone-900"
                  />
                  <div>
                    <div className="font-semibold text-xs text-stone-900">{opt.label}</div>
                    <div className="text-[11px] text-stone-500 leading-snug">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 relative">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Remove Administrator?
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Are you sure you want to remove <strong className="text-stone-900">{adminToDelete.email}</strong> from the administrator registry? They will immediately lose all access to <span className="font-mono">/admin</span> and cannot modify store data.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Remove Admin Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
