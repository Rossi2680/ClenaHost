import React, { useState } from 'react';
import { 
  Users, AlertCircle, Ban, Search, Check, Calendar, MapPin, XCircle, 
  TrendingUp, DollarSign, Briefcase, Percent, BarChart3, Award, Users2
} from 'lucide-react';
import { Professional, CleaningRequest, SupportJob, RequestStatus } from '../types';

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
  requests = [],
  supportJobs = [],
  onUpdateRegisteredUserStatus
}: AdminSectionProps) {
  // Navigation Tabs at the top level of Admin Panel
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users'>('dashboard');
  
  // States related to "Usuários Cadastrados" Management
  const [activeTab, setActiveTab] = useState<'host_client' | 'cleaner' | 'support'>('host_client');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Safety fallbacks for databases arrays
  const safeRequests = requests || [];
  const safeSupportJobs = supportJobs || [];
  const safeUsers = registeredUsers || [];

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

  // Filter out Master admin and official HQ accounts to only measure real customer growth and database
  const normalUsers = safeUsers.filter((u: any) => 
    u.id !== 'admin-master' && 
    u.role !== 'ADMIN' && 
    u.email?.toLowerCase() !== 'cleanhost.oficial@gmail.com'
  );

  // Completed items filters for financial metrics
  const completedCleanings = safeRequests.filter(r => 
    r.status === RequestStatus.COMPLETED || 
    String(r.status) === 'Concluído' ||
    String(r.status).toLowerCase() === 'concluido' ||
    String(r.status).toLowerCase() === 'concluído'
  );

  const completedSupportJobs = safeSupportJobs.filter(j => 
    j.status === 'Concluído' || 
    String(j.status).toLowerCase() === 'concluido' ||
    String(j.status).toLowerCase() === 'concluído'
  );

  const totalOperationsCount = completedCleanings.length + completedSupportJobs.length;

  // Simulate Current month Context (June 2026 - month index 5)
  const currentMonthIdx = 5;
  const currentYear = 2026;
  const prevMonthIdx = 4;
  const prevYear = 2026;

  // Date parsing helper
  const isTargetMonthAndYear = (dateStr: string, targetMonth: number, targetYear: number) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    } catch {
      return false;
    }
  };

  // CALCULATE KPIS FROM ALL-TIME OPERATIONS (REAL DATA ONLY)
  // Cleanings Revenue: sum of app fees (standard 12% or loyalty 5%)
  const totalCleaningRevenue = completedCleanings.reduce((sum, r) => {
    const fee = r.appFee !== undefined ? r.appFee : (r.price || 0) * 0.12;
    return sum + fee;
  }, 0);

  // Rede de Apoio Revenue: 5% of quoted values
  const totalSupportRevenue = completedSupportJobs.reduce((sum, j) => {
    return sum + ((j.quotedValue || 0) * 0.05);
  }, 0);

  const totalRevenue = totalCleaningRevenue + totalSupportRevenue;

  // CURRENT MONTH (JUNE 2026) KPIS
  const currentCleanings = completedCleanings.filter(r => isTargetMonthAndYear(r.dateTime, currentMonthIdx, currentYear));
  const currentSupport = completedSupportJobs.filter(j => isTargetMonthAndYear(j.date, currentMonthIdx, currentYear));

  const currentMonthCleaningRevenue = currentCleanings.reduce((sum, r) => sum + (r.appFee !== undefined ? r.appFee : (r.price || 0) * 0.12), 0);
  const currentMonthSupportRevenue = currentSupport.reduce((sum, j) => sum + ((j.quotedValue || 0) * 0.05), 0);
  const currentMonthRevenue = currentMonthCleaningRevenue + currentMonthSupportRevenue;

  const currentMonthOps = currentCleanings.length + currentSupport.length;

  // PREVIOUS MONTH (MAY 2026) KPIS (to compute comparison percentages)
  const prevCleanings = completedCleanings.filter(r => isTargetMonthAndYear(r.dateTime, prevMonthIdx, prevYear));
  const prevSupport = completedSupportJobs.filter(j => isTargetMonthAndYear(j.date, prevMonthIdx, prevYear));

  const prevMonthCleaningRevenue = prevCleanings.reduce((sum, r) => sum + (r.appFee !== undefined ? r.appFee : (r.price || 0) * 0.12), 0);
  const prevMonthSupportRevenue = prevSupport.reduce((sum, j) => sum + ((j.quotedValue || 0) * 0.05), 0);
  const prevMonthRevenue = prevMonthCleaningRevenue + prevMonthSupportRevenue;

  const prevMonthOps = prevCleanings.length + prevSupport.length;

  const currentUsersRegistered = normalUsers.filter(u => isTargetMonthAndYear(u.createdAt, currentMonthIdx, currentYear));
  const prevUsersRegistered = normalUsers.filter(u => isTargetMonthAndYear(u.createdAt, prevMonthIdx, prevYear));

  // GROWTH PERCENTAGES MoM (June vs May)
  const calculateGrowthPct = (current: number, prev: number) => {
    if (prev === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - prev) / prev) * 100;
  };

  const revenueMoMGrowth = calculateGrowthPct(currentMonthRevenue, prevMonthRevenue);
  const opsMoMGrowth = calculateGrowthPct(currentMonthOps, prevMonthOps);
  const usersMoMGrowth = calculateGrowthPct(currentUsersRegistered.length, prevUsersRegistered.length);

  // USER TOTALS BY CATEGORY
  const totalHostClientCount = normalUsers.filter(u => u.role === 'HOST' || u.role === 'CLIENTE').length;
  const totalCleanerCount = normalUsers.filter(u => u.role === 'CLEANER').length;
  const totalSupportCount = normalUsers.filter(u => u.role === 'SUPPORT').length;
  const totalUsersCount = normalUsers.length;

  // COMPUTE MONHLY PLOTS SERIES PRECISELY OF 2026 (Jan to June)
  const calendarMonths = [
    { name: 'Jan', monthIdx: 0, year: 2026 },
    { name: 'Fev', monthIdx: 1, year: 2026 },
    { name: 'Mar', monthIdx: 2, year: 2026 },
    { name: 'Abr', monthIdx: 3, year: 2026 },
    { name: 'Mai', monthIdx: 4, year: 2026 },
    { name: 'Jun', monthIdx: 5, year: 2026 },
  ];

  const financialEvolutionData = calendarMonths.map(m => {
    // Cleanings for this specific month Group
    const mCleanings = completedCleanings.filter(r => isTargetMonthAndYear(r.dateTime, m.monthIdx, m.year));
    const cleanVolume = mCleanings.reduce((sum, r) => sum + (r.price || 0), 0);
    const cleanRevenue = mCleanings.reduce((sum, r) => sum + (r.appFee !== undefined ? r.appFee : (r.price || 0) * 0.12), 0);

    // Support Jobs for this month Group
    const mSupport = completedSupportJobs.filter(j => isTargetMonthAndYear(j.date, m.monthIdx, m.year));
    const supportVolume = mSupport.reduce((sum, j) => sum + (j.quotedValue || 0), 0);
    const supportRevenue = mSupport.reduce((sum, j) => sum + ((j.quotedValue || 0) * 0.05), 0);

    // Dynamic aggregates
    const grossVolume = cleanVolume + supportVolume;
    const platformRevenue = cleanRevenue + supportRevenue;
    const opsCount = mCleanings.length + mSupport.length;

    // Registrations for this month
    const mUsers = normalUsers.filter(u => isTargetMonthAndYear(u.createdAt, m.monthIdx, m.year));
    const newHosts = mUsers.filter(u => u.role === 'HOST' || u.role === 'CLIENTE').length;
    const newCleaners = mUsers.filter(u => u.role === 'CLEANER').length;
    const newSupport = mUsers.filter(u => u.role === 'SUPPORT').length;

    return {
      name: m.name,
      grossVolume,
      platformRevenue,
      opsCount,
      newHosts,
      newCleaners,
      newSupport
    };
  });

  // Calculate highest bounds for visual charts column heights scaling
  const maxGrossVolume = Math.max(...financialEvolutionData.map(d => d.grossVolume), 1);
  const maxPlatformRevenue = Math.max(...financialEvolutionData.map(d => d.platformRevenue), 1);
  const maxOpsCount = Math.max(...financialEvolutionData.map(d => d.opsCount), 1);
  const maxUserSignup = Math.max(...financialEvolutionData.map(d => d.newHosts + d.newCleaners + d.newSupport), 1);

  // USER REGISTRATIONS AUDIT STATUS - TAXA DE CONVERSÃO
  const pendingUsers = normalUsers.filter(u => u.approvalStatus === 'pending' || u.approvalStatus === 'correction_requested' || !u.approvalStatus).length;
  const approvedUsers = normalUsers.filter(u => u.approvalStatus === 'approved').length;
  const rejectedUsers = normalUsers.filter(u => u.approvalStatus === 'rejected').length;

  const totalReviewedOrPending = pendingUsers + approvedUsers + rejectedUsers;
  const approvalRate = totalReviewedOrPending > 0 ? (approvedUsers / totalReviewedOrPending) * 100 : 0;

  // USER SELECTION AREA FILTERS & SEARCH
  const tabUsers = normalUsers.filter((u: any) => {
    if (activeTab === 'host_client') {
      return u.role === 'HOST' || u.role === 'CLIENTE';
    } else if (activeTab === 'cleaner') {
      return u.role === 'CLEANER';
    } else if (activeTab === 'support') {
      return u.role === 'SUPPORT';
    }
    return false;
  });

  const searchedUsers = tabUsers.filter((u: any) => {
    const name = u.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  // ACTION HANDLERS
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

  const renderMoMBadge = (pct: number) => {
    const isPositive = pct >= 0;
    const prefix = isPositive ? '+' : '';
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}>
        {prefix}{pct.toFixed(0)}%
      </span>
    );
  };

  // Helper render for user charts stacking
  const maxTotalInAMonth = Math.max(...financialEvolutionData.map(d => d.newHosts + d.newCleaners + d.newSupport), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in" id="admin-master-main-container">
      
      {/* EXECUTIVE CONTROLS TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F33] tracking-tight flex items-center gap-2 font-display uppercase">
            <Award className="w-5 h-5 text-[#0A66FF]" />
            Painel Sócio-Administrador HQ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle gerencial corporativo, auditoria de receitas consolidadas e métricas da plataforma.
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'dashboard'
                ? 'bg-[#0A66FF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-exec-dashboard"
          >
            <TrendingUp className="w-4 h-4" />
            Controladoria & Dashboard
          </button>
          
          <button
            onClick={() => setAdminTab('users')}
            className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              adminTab === 'users'
                ? 'bg-[#0A66FF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-exec-users"
          >
            <Users className="w-4 h-4" />
            Usuários Cadastrados
          </button>
        </div>
      </div>

      {adminTab === 'dashboard' ? (
        <div className="space-y-6" id="executive-dashboard-contents">
          
          {/* KPI CARDS (VISÃO GERAL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Receita Total */}
            <div className="bg-[#0B1F33] text-white p-5 rounded-3xl relative overflow-hidden" id="card-total-revenue">
              <div className="absolute top-4 right-4 bg-slate-800 p-2 rounded-xl text-white">
                <DollarSign className="w-4 h-4 text-[#12D6C5]" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider font-sans">Receita Total</span>
              <h2 className="text-2xl font-black mt-2 font-mono" id="val-total-revenue">
                R$ {totalRevenue.toFixed(2)}
              </h2>
              <p className="text-[9px] text-[#12D6C5] mt-1 font-mono">
                Volume Bruto: R$ {(completedCleanings.reduce((s, r) => s + (r.price || 0), 0) + completedSupportJobs.reduce((s, j) => s + (j.quotedValue || 0), 0)).toFixed(0)}
              </p>
            </div>

            {/* Receita do Mês */}
            <div className="bg-white border border-slate-150 p-5 rounded-3xl relative overflow-hidden" id="card-month-revenue">
              <div className="absolute top-4 right-4 bg-slate-50 p-2 rounded-xl text-slate-400">
                <TrendingUp className="w-4 h-4 text-[#0A66FF]" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Receita do Mês</span>
              <h2 className="text-2xl font-black mt-2 text-[#0B1F33] font-mono" id="val-month-revenue">
                R$ {currentMonthRevenue.toFixed(2)}
              </h2>
              <div className="mt-1 flex items-center gap-1">
                {renderMoMBadge(revenueMoMGrowth)}
                <span className="text-[9px] text-slate-400 font-bold font-sans">vs mês anterior</span>
              </div>
            </div>

            {/* Receita da Limpeza */}
            <div className="bg-white border border-slate-150 p-5 rounded-3xl relative overflow-hidden" id="card-clean-revenue">
              <div className="absolute top-4 right-4 bg-blue-50 p-2 rounded-xl">
                <span className="text-xs">✨</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Receita da Limpeza</span>
              <h2 className="text-xl font-black mt-2.5 text-[#0B1F33] font-mono" id="val-clean-revenue">
                R$ {totalCleaningRevenue.toFixed(2)}
              </h2>
              <p className="text-[9px] text-slate-400 mt-1 font-sans">Calculado a 12% por faxina</p>
            </div>

            {/* Receita da Rede de Apoio */}
            <div className="bg-white border border-slate-150 p-5 rounded-3xl relative overflow-hidden" id="card-support-revenue">
              <div className="absolute top-4 right-4 bg-indigo-50 p-2 rounded-xl">
                <span className="text-xs">🛠️</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Receita Rede Apoio</span>
              <h2 className="text-xl font-black mt-2.5 text-[#0B1F33] font-mono" id="val-support-revenue">
                R$ {totalSupportRevenue.toFixed(2)}
              </h2>
              <p className="text-[9px] text-slate-400 mt-1 font-sans">Calculado a 5% por serviço</p>
            </div>

            {/* Total de Operações */}
            <div className="bg-white border border-slate-150 p-5 rounded-3xl relative overflow-hidden" id="card-total-operations">
              <div className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-xl">
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Total de Operações</span>
              <h2 className="text-2xl font-black mt-2 text-[#0B1F33] font-mono" id="val-total-operations">
                {totalOperationsCount}
              </h2>
              <div className="mt-1 flex items-center gap-1">
                {renderMoMBadge(opsMoMGrowth)}
                <span className="text-[9px] text-slate-400 font-bold font-sans">vs mês anterior</span>
              </div>
            </div>

          </div>

          {/* CRESCIMENTO PERCENTUAL CONTAINER */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 block font-mono">
              ⚡ Indicadores de Crescimento MoM (Junho vs. Maio de 2026)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* MoM Revenue */}
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Crescimento de Receita</span>
                  <p className="text-xs font-black text-slate-700 mt-0.5">Comissões da plataforma</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${revenueMoMGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {revenueMoMGrowth >= 0 ? '▲' : '▼'} {Math.abs(revenueMoMGrowth).toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">MoM consolidado</span>
                </div>
              </div>

              {/* MoM Operations */}
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Crescimento de Serviços</span>
                  <p className="text-xs font-black text-slate-700 mt-0.5">Operações concluídas</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${opsMoMGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {opsMoMGrowth >= 0 ? '▲' : '▼'} {Math.abs(opsMoMGrowth).toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">MoM consolidado</span>
                </div>
              </div>

              {/* MoM Signups */}
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Adesão de Novos Usuários</span>
                  <p className="text-xs font-black text-slate-700 mt-0.5">Registros na base</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${usersMoMGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {usersMoMGrowth >= 0 ? '▲' : '▼'} {Math.abs(usersMoMGrowth).toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">MoM consolidado</span>
                </div>
              </div>

            </div>
          </div>

          {/* DUAL COLUMN CHARTING & AUDITING */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: EVOLUÇÃO MENSAL CONSOLIDADA (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs flex flex-col justify-between" id="section-monthly-graph">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2 uppercase tracking-tight">
                    <BarChart3 className="w-4 h-4 text-[#0A66FF]" />
                    Evolução Mensal Consolidada (Volume vs Receita)
                  </h3>
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">Dados Reais 2026</span>
                </div>
              </div>

              {totalOperationsCount > 0 ? (
                <div>
                  <div className="grid grid-cols-6 gap-3 pt-6 pb-2 h-[260px]">
                    {financialEvolutionData.map((item, idx) => {
                      // Scale heights proportional of largest volume
                      const grossHeightPct = (item.grossVolume / maxGrossVolume) * 100;
                      const revenueHeightPct = (item.platformRevenue / maxGrossVolume) * 100; // relative to Gross volume to show actual fraction

                      return (
                        <div key={idx} className="flex flex-col justify-end items-center h-full relative group">
                          
                          {/* Columns container */}
                          <div className="flex items-end gap-1.5 h-full w-full justify-center">
                            
                            {/* Base Volume Column */}
                            <div 
                              className="bg-[#0B1F33] w-6 hover:bg-slate-800 rounded-t-sm relative transition-all duration-300 group"
                              style={{ height: `${Math.max(grossHeightPct ?? 0, 4)}%` }}
                              title={`Volume Bruto: R$ ${item.grossVolume}`}
                            >
                              {/* Hover overlay values tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0B1F33] text-white text-[9px] py-1 px-2 rounded-lg font-mono font-bold z-5 z-40 shadow-md whitespace-nowrap pointer-events-none">
                                Vol. Bruto: R$ {item.grossVolume.toFixed(2)}
                              </div>
                            </div>

                            {/* Revenue commission Column */}
                            <div 
                              className="bg-[#0A66FF] w-6 hover:bg-blue-600 rounded-t-sm relative transition-all duration-300 group"
                              style={{ height: `${Math.max(revenueHeightPct ?? 0, 4)}%` }}
                              title={`Taxas Real: R$ ${item.platformRevenue}`}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0B1F33] text-white text-[9px] py-1 px-2 rounded-lg font-mono font-bold z-40 shadow-md whitespace-nowrap pointer-events-none">
                                Comissões: R$ {item.platformRevenue.toFixed(2)}
                              </div>
                            </div>

                          </div>

                          {/* Base labels of Month Group */}
                          <div className="text-center mt-3 shrink-0">
                            <span className="font-black text-[10px] text-slate-700 block">{item.name}</span>
                            <span className="text-[9px] font-bold text-[#0A66FF] block font-mono">
                              {item.opsCount} ops
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Legend of financial columns */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-[#0B1F33] rounded-xs"></div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Volume Bruto (Serviços)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-[#0A66FF] rounded-xs"></div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Comissão CleanHost</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-6 shrink-0">
                  <span className="text-3xl text-slate-300">📊</span>
                  <p className="text-xs font-bold text-slate-500 mt-2">Aguardando movimentação da plataforma.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">As métricas de receitas reais aparecerão aqui assim que ocorrerem contratações.</p>
                </div>
              )}
            </div>

            {/* COLUMN 2: REGISTRATIONS EVOLUÇÃO (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs flex flex-col justify-between" id="section-users-categories">
              
              <div>
                <h3 className="font-bold text-sm text-[#0B1F33] border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-tight">
                  <Users2 className="w-4 h-4 text-[#4338CA]" />
                  Evolução de Cadastros ({totalUsersCount})
                </h3>

                <div className="space-y-2 flex-grow pt-4">
                  {/* Row totals details */}
                  <div className="flex items-center justify-between text-2xs font-extrabold p-2 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-600">🏠 Anfitriões / Clientes</span>
                    <span className="text-[#0B1F33] font-mono">{totalHostClientCount} cadastrados</span>
                  </div>

                  <div className="flex items-center justify-between text-2xs font-extrabold p-2 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-600">🧹 Profissionais de Limpeza</span>
                    <span className="text-[#0B1F33] font-mono">{totalCleanerCount} cadastrados</span>
                  </div>

                  <div className="flex items-center justify-between text-2xs font-extrabold p-2 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-slate-600">🛠️ Rede de Apoio Técnico</span>
                    <span className="text-[#0B1F33] font-mono">{totalSupportCount} cadastrados</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-black p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[#0A66FF] uppercase">Total Geral de Usuários Base</span>
                    <span className="text-[#0B1F33] font-mono">{totalUsersCount} ativos/pendentes</span>
                  </div>
                </div>
              </div>

              {/* GRÁFICO DE CRESCIMENTO */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex-grow">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-3 font-mono">
                  📈 Novos Cadastros por Mês (Jan - Jun)
                </span>
                
                {totalUsersCount > 0 ? (
                  <div className="grid grid-cols-6 gap-2 pt-3 h-[120px] items-end">
                    {financialEvolutionData.map((m, idx) => {
                      const totalInMonth = m.newHosts + m.newCleaners + m.newSupport;
                      const heightPercent = maxTotalInAMonth > 0 ? (totalInMonth / maxTotalInAMonth) * 75 : 0; // standard ceiling limit

                      return (
                        <div key={idx} className="flex flex-col items-center h-full justify-end relative group">
                          {/* Stacking colors bars */}
                          <div className="w-4 bg-[#4338CA] hover:bg-indigo-600 rounded-t-xs transition-all relative group" style={{ height: `${Math.max(heightPercent, 2)}%` }}>
                            {/* Hover user category detail tooltips */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#0B1F33] text-white text-[9px] py-1.5 px-2 rounded-xl z-50 pointer-events-none whitespace-nowrap shadow-md text-left font-sans flex flex-col gap-1">
                              <span className="font-bold border-b border-slate-700 pb-0.5 mb-0.5 text-[10px]">{m.name} 2026:</span>
                              <span>🏠 Anfitrião/Cli: {m.newHosts}</span>
                              <span>🧹 Faxinas: {m.newCleaners}</span>
                              <span>🛠️ Apoio: {m.newSupport}</span>
                              <span className="text-[#12D6C5] font-bold shrink-0 mt-0.5">Total: {totalInMonth}</span>
                            </div>
                          </div>
                          
                          <span className="text-[10px] text-slate-500 font-bold mt-1.5">{m.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 py-4 text-center">Nenhum dado real registrado ainda.</p>
                )}
              </div>

            </div>

          </div>

          {/* TAXA DE CONVERSÃO CADASRAL */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-6" id="section-conversion">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#0B1F33] uppercase flex items-center gap-1.5 tracking-tight">
                <Percent className="w-4 h-4 text-emerald-600" />
                Auditoria Cadastral & Conversão
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                Relação entre solicitações de acesso e aprovações efetivas concedidas pela mesa administrativa da plataforma.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-150 text-2xs font-extrabold text-slate-500 flex-grow max-w-xl">
              <div>
                <span className="block uppercase font-bold text-[9px] text-slate-400 font-mono mb-0.5">Pendente</span>
                <span className="text-amber-700 font-mono text-base font-black">{pendingUsers}</span>
              </div>
              <div className="border-l h-6 border-slate-300 hidden sm:block"></div>
              <div>
                <span className="block uppercase font-bold text-[9px] text-slate-400 font-mono mb-0.5">Aprovado</span>
                <span className="text-emerald-700 font-mono text-base font-black">{approvedUsers}</span>
              </div>
              <div className="border-l h-6 border-slate-300 hidden sm:block"></div>
              <div>
                <span className="block uppercase font-bold text-[9px] text-slate-400 font-mono mb-0.5">Reprovado</span>
                <span className="text-rose-700 font-mono text-base font-black">{rejectedUsers}</span>
              </div>
              
              <div className="border-l h-6 border-slate-300 hidden sm:block flex-grow"></div>
              
              {/* Approval rate visual circle bar */}
              <div className="min-w-[120px]">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-sans">Aprovação</span>
                  <span className="text-[#0A66FF] font-black">{approvalRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#0A66FF] h-2 rounded-full transition-all duration-500" style={{ width: `${approvalRate}%` }}></div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-6" id="users-auditing-panel">
          
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans" id="users-cards-grid">
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
      )}

    </div>
  );
}
