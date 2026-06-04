import React, { useState } from 'react';
import { 
  Users, AlertCircle, Ban, Search, Check, Calendar, MapPin, XCircle, CheckSquare
} from 'lucide-react';
import { Professional, CleaningRequest, SupportJob } from '../types';

interface AdminSectionProps {
  professionals: Professional[];
  requests: CleaningRequest[];
  supportJobs?: SupportJob[];
  onUpdateRequest: (reqId: string, updates: Partial<CleaningRequest>) => void;
  onUpdateCleanerInfo: (cleanerId: string, updates: Partial<Professional>) => void;
  onAddProfessional: (prof: Professional) => void;
  registeredUsers?: any[];
  onUpdateRegisteredUserStatus?: (userId: string, isApproved: boolean, approvalStatus: 'approved' | 'rejected' | 'correction_requested') => void;
  financeSettings?: any;
  onChangeFinanceSettings?: (settings: any) => void;
  financeLogs?: any[];
}

export default function AdminSection({
  registeredUsers = [],
  onUpdateRegisteredUserStatus
}: AdminSectionProps) {
  const [activeTab, setActiveTab] = useState<'host_client' | 'cleaner' | 'support'>('host_client');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Helper to format date uniformly
  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Contas Legadas';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Contas Legadas';
      return d.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Contas Legadas';
    }
  };

  // 1. Exclude Master Admin and Admin accounts
  const filteredUsers = registeredUsers.filter((u: any) => 
    u.id !== 'admin-master' && 
    u.role !== 'ADMIN' && 
    u.email?.toLowerCase() !== 'cleanhost.oficial@gmail.com'
  );

  // 2. Filter by Active Tab
  const tabUsers = filteredUsers.filter((u: any) => {
    if (activeTab === 'host_client') {
      return u.role === 'HOST' || u.role === 'CLIENTE';
    } else if (activeTab === 'cleaner') {
      return u.role === 'CLEANER';
    } else if (activeTab === 'support') {
      return u.role === 'SUPPORT';
    }
    return false;
  });

  // 3. Filter by Search Query
  const searchedUsers = tabUsers.filter((u: any) => {
    const name = u.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 4. Filter by Status
  const finalFilteredUsers = searchedUsers.filter((u: any) => {
    const status = u.approvalStatus || 'pending';
    if (statusFilter === 'pending') {
      return status === 'pending' || status === 'correction_requested';
    }
    if (statusFilter === 'approved') {
      return status === 'approved';
    }
    if (statusFilter === 'rejected') {
      return status === 'rejected';
    }
    return false;
  });

  // Count items specifically for tab and filter badges
  const getTabCounts = () => {
    const totalPending = tabUsers.filter((u: any) => {
      const s = u.approvalStatus || 'pending';
      return s === 'pending' || s === 'correction_requested';
    }).length;

    const totalApproved = tabUsers.filter((u: any) => u.approvalStatus === 'approved').length;
    const totalRejected = tabUsers.filter((u: any) => u.approvalStatus === 'rejected').length;

    return { totalPending, totalApproved, totalRejected };
  };

  const { totalPending, totalApproved, totalRejected } = getTabCounts();

  // Unified administrative handler actions
  const handleApprove = (user: any) => {
    if (onUpdateRegisteredUserStatus) {
      onUpdateRegisteredUserStatus(user.id, true, 'approved');
      alert(`Cadastro de ${user.name} aprovado com sucesso!`);
    }
  };

  const handleReject = (user: any) => {
    if (onUpdateRegisteredUserStatus) {
      onUpdateRegisteredUserStatus(user.id, false, 'rejected');
      alert(`Cadastro de ${user.name} recusado com sucesso!`);
    }
  };

  const handleBlock = (user: any, blockStatus: boolean) => {
    if (onUpdateRegisteredUserStatus) {
      onUpdateRegisteredUserStatus(user.id, !blockStatus, 'approved');
      alert(`Status de acesso para ${user.name} alterado: ${blockStatus ? 'BLOQUEADO' : 'DESBLOQUEADO'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in" id="admin-registered-users">
      
      {/* SECTION TITLE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F33] tracking-tight flex items-center gap-2 font-display uppercase">
            <Users className="w-5 h-5 text-[#0A66FF]" />
            Usuários Cadastrados
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
            Área de homologação, triagem e governança cadastral simplificada da plataforma CleanHost.
          </p>
        </div>
      </div>

      {/* THREE CATEGORIES TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 gap-1.5">
        <button
          onClick={() => { setActiveTab('host_client'); setSearchQuery(''); }}
          className={`cursor-pointer w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'host_client'
              ? 'bg-[#0A66FF] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-host-client"
        >
          <span>🏠</span> Anfitrião / Cliente
        </button>

        <button
          onClick={() => { setActiveTab('cleaner'); setSearchQuery(''); }}
          className={`cursor-pointer w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'cleaner'
              ? 'bg-[#0B1F33] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-cleaner"
        >
          <span>🧹</span> Profissional de Limpeza
        </button>

        <button
          onClick={() => { setActiveTab('support'); setSearchQuery(''); }}
          className={`cursor-pointer w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'support'
              ? 'bg-[#4338CA] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="tab-support"
        >
          <span>🛠️</span> Rede de Apoio
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* SEARCH BOX FOR NAMES */}
          <div className="md:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar usuário por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
              id="search-user-input"
            />
          </div>

          {/* STATUS FILTER ACCORDION/BUTTONS */}
          <div className="md:col-span-6 flex flex-wrap gap-1.5 md:justify-end">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`cursor-pointer py-2 px-3 rounded-xl text-2xs font-extrabold transition-all flex items-center gap-1.5 border ${
                statusFilter === 'pending'
                  ? 'bg-amber-100 text-amber-800 border-amber-250 shadow-3xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              id="filter-pending"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Pendentes ({totalPending})
            </button>

            <button
              onClick={() => setStatusFilter('approved')}
              className={`cursor-pointer py-2 px-3 rounded-xl text-2xs font-extrabold transition-all flex items-center gap-1.5 border ${
                statusFilter === 'approved'
                  ? 'bg-emerald-100 text-emerald-850 border-emerald-250 shadow-3xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              id="filter-approved"
            >
              <Check className="w-3.5 h-3.5" />
              Aprovados ({totalApproved})
            </button>

            <button
              onClick={() => setStatusFilter('rejected')}
              className={`cursor-pointer py-2 px-3 rounded-xl text-2xs font-extrabold transition-all flex items-center gap-1.5 border ${
                statusFilter === 'rejected'
                  ? 'bg-rose-100 text-rose-800 border-rose-250 shadow-3xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              id="filter-rejected"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reprovados ({totalRejected})
            </button>
          </div>

        </div>
      </div>

      {/* USER LIST CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="users-cards-grid">
        {finalFilteredUsers.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 p-12 rounded-3xl text-center space-y-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border text-sm">
              🔍
            </div>
            <p className="text-xs font-bold text-slate-600">Nenhum cadastro encontrado</p>
            <p className="text-[10px] text-slate-400">Tente ajustar seus termos de busca ou mudar o filtro de status.</p>
          </div>
        ) : (
          finalFilteredUsers.map((user: any) => {
            const isBlocked = user.isApproved === false && user.approvalStatus === 'approved';
            
            return (
              <div 
                key={user.id} 
                className="bg-white border border-slate-150 p-5 rounded-3xl shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all duration-200"
                id={`user-card-${user.id}`}
              >
                {/* Main Content Info */}
                <div className="space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase overflow-hidden shrink-0">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        user.name?.slice(0, 2) || 'U'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xs text-slate-800 truncate" title={user.name}>
                        {user.name || 'Usuário Sem Nome'}
                      </h3>
                      {isBlocked && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[8px] font-mono font-extrabold uppercase text-rose-700 bg-rose-100 rounded-md">
                          🚫 Bloqueado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Strictly requested fields: Nome, Cidade, Data do cadastro */}
                  <div className="space-y-2.5 pt-1 text-2xs text-slate-600 font-bold leading-relaxed">
                    {/* Cidade */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-mono font-black mb-0.5 tracking-wider">Cidade</span>
                        <span className="text-slate-700">{user.city || 'São Paulo'}</span>
                      </div>
                    </div>

                    {/* Data do cadastro */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-mono font-black mb-0.5 tracking-wider">Data do cadastro</span>
                        <span className="text-slate-700 font-mono">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Audit Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex gap-1.5">
                  
                  {/* Action for Pending / Unreviewed users */}
                  {(user.approvalStatus === 'pending' || user.approvalStatus === 'correction_requested' || !user.approvalStatus) && (
                    <>
                      <button
                        onClick={() => handleReject(user)}
                        className="cursor-pointer flex-1 py-1.8 px-2.5 hover:bg-rose-50 text-rose-600 text-3xs font-extrabold rounded-xl border border-rose-100 transition-all text-center uppercase tracking-wide flex items-center justify-center gap-1"
                        id={`reject-${user.id}`}
                      >
                        <XCircle className="w-3 h-3" />
                        Reprovar
                      </button>

                      <button
                        onClick={() => handleApprove(user)}
                        className="cursor-pointer flex-1.5 py-1.8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-3xs font-extrabold rounded-xl transition-all text-center uppercase tracking-wide flex items-center justify-center gap-1"
                        id={`approve-${user.id}`}
                      >
                        <Check className="w-3" />
                        Aprovar
                      </button>
                    </>
                  )}

                  {/* Actions for Approved Users (Option to Block / Unblock) */}
                  {user.approvalStatus === 'approved' && (
                    <button
                      onClick={() => handleBlock(user, !isBlocked)}
                      className={`cursor-pointer w-full py-1.8 px-3 text-3xs font-extrabold rounded-xl transition-all text-center uppercase tracking-wide flex items-center justify-center gap-1 border ${
                        isBlocked
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-150'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-150'
                      }`}
                      id={`block-toggle-${user.id}`}
                    >
                      <Ban className="w-3" />
                      {isBlocked ? 'Desbloquear Acesso' : 'Bloquear Usuário'}
                    </button>
                  )}

                  {/* Action to Rescue / Re-approve Rejected users */}
                  {user.approvalStatus === 'rejected' && (
                    <button
                      onClick={() => handleApprove(user)}
                      className="cursor-pointer w-full py-1.8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-3xs font-extrabold rounded-xl transition-all text-center uppercase tracking-wide flex items-center justify-center gap-1"
                      id={`rescue-${user.id}`}
                    >
                      <Check className="w-3" />
                      Aprovar Cadastro
                    </button>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
