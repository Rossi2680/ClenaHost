import React, { useState } from 'react';
import { 
  Settings, Users, Activity, BarChart2, ShieldAlert, CheckCircle, 
  Trash2, Mail, AlertCircle, RefreshCw, Star, Ban, Award, Check
} from 'lucide-react';
import { Professional, CleaningRequest, RequestStatus, SupportJob } from '../types';

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
  professionals,
  requests,
  supportJobs = [],
  onUpdateRequest,
  onUpdateCleanerInfo,
  onAddProfessional,
  registeredUsers = [],
  onUpdateRegisteredUserStatus,
  financeSettings = {
    pixKey: '28284920875',
    standardTax: 12,
    loyaltyTax: 5,
    recipientAccount: '28284920875 (Banco Cora)',
    autoRepassActive: true
  },
  onChangeFinanceSettings,
  financeLogs = []
}: AdminSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'kpis' | 'professionals' | 'redistribute' | 'financeConfig'>('kpis');
  const [reassignReqId, setReassignReqId] = useState<string>('');
  const [reassignCleanId, setReassignCleanId] = useState<string>('');

  // Local state inputs for finance customization
  const [chkPix, setChkPix] = useState(financeSettings.pixKey);
  const [chkStd, setChkStd] = useState(financeSettings.standardTax);
  const [chkLoyal, setChkLoyal] = useState(financeSettings.loyaltyTax);
  const [chkAccount, setChkAccount] = useState(financeSettings.recipientAccount);
  const [chkAuto, setChkAuto] = useState(financeSettings.autoRepassActive);

  // Filter pending user approvals (Hosts, Clients, Cleaners, Technical Support, and Admin candidates)
  const activePendingApps = registeredUsers.filter((u: any) => 
    u.id !== 'admin-master' && 
    (u.approvalStatus === 'pending' || u.approvalStatus === 'correction_requested' || u.approvalStatus === 'rejected')
  );

  const handleApproveUser = (user: any) => {
    if (onUpdateRegisteredUserStatus) {
      onUpdateRegisteredUserStatus(user.id, true, 'approved');
      alert(`Cadastro de ${user.name} aprovado com sucesso! Notificação enviada.`);
    }
  };

  const handleRejectUser = (user: any) => {
    if (onUpdateRegisteredUserStatus) {
      onUpdateRegisteredUserStatus(user.id, false, 'rejected');
      alert(`Cadastro de ${user.name} recusado com sucesso! Notificação enviada.`);
    }
  };

  const handleRequestCorrection = (user: any) => {
    if (onUpdateRegisteredUserStatus) {
      onUpdateRegisteredUserStatus(user.id, false, 'correction_requested');
      alert(`Solicitação de correção cadastral enviada com sucesso para ${user.name}!`);
    }
  };

  const handleBlockProfessional = (cleanerId: string, currentStatus: boolean) => {
    onUpdateCleanerInfo(cleanerId, { isApproved: !currentStatus });
    alert(`Status da profissional alterado: ${currentStatus ? 'BLOQUEADA' : 'DESBLOQUEADA'} com sucesso.`);
  };

  const handleRedistributeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignReqId || !reassignCleanId) return;

    const targetReq = requests.find(r => r.id === reassignReqId);
    const targetClean = professionals.find(p => p.id === reassignCleanId);

    if (targetReq && targetClean) {
      onUpdateRequest(reassignReqId, {
        professionalId: targetClean.id,
        professionalName: targetClean.name,
        professionalPhoto: targetClean.photoUrl,
        status: RequestStatus.ASSIGNED // Reset back to Assigned status
      });
      alert(`Faxina ${reassignReqId} redistribuída com sucesso! Nova profissional encarregada: ${targetClean.name}.`);
      setReassignReqId('');
      setReassignCleanId('');
    }
  };

  // KPIs Calculations split between Faxinas and Apoio
  const totalCleanVolume = requests.reduce((sum, r) => sum + r.price, 0);
  const totalCleanIntermediation = requests.reduce((sum, r) => sum + r.appFee, 0);

  // Applicable support jobs (accepted or completed or quoted)
  const applicableSupportJobs = (supportJobs || []).filter(j => j.status === 'Aceito' || j.status === 'Concluído' || j.status === 'Orçado');
  const totalSupportVolume = applicableSupportJobs.reduce((sum, j) => sum + j.quotedValue, 0);
  // Support jobs have a standard 10% commission
  const totalSupportIntermediation = totalSupportVolume * 0.10;

  // Global aggregate KPIs
  const totalSystemRevenue = totalCleanVolume + totalSupportVolume;
  const totalIntermediationEarned = totalCleanIntermediation + totalSupportIntermediation;
  const activeCleaningsCount = requests.filter(r => r.status !== RequestStatus.COMPLETED).length;

  // Monthly Evolution Chart (last 4 months)
  const historicalData = [
    { month: 'Fevereiro', clean: 1420, support: 320 },
    { month: 'Março', clean: 2280, support: 610 },
    { month: 'Abril', clean: 3950, support: 1150 },
    { month: 'Maio', clean: totalCleanVolume > 0 ? totalCleanVolume : 4850, support: totalSupportVolume > 0 ? totalSupportVolume : 1600 }
  ];

  const maxVal = Math.max(...historicalData.map(h => h.clean + h.support), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Nav controllers */}
      <div className="flex bg-white p-1 rounded-3xl shadow-xs border border-blue-50 gap-2">
        <button
          onClick={() => setActiveSubTab('kpis')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeSubTab === 'kpis' ? 'bg-[#0B1F33] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          📊 KPIs &amp; Estatísticas
        </button>
        <button
          onClick={() => setActiveSubTab('professionals')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all flex items-center gap-1.5 ${activeSubTab === 'professionals' ? 'bg-[#0B1F33] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          👤 Aprovação ({activePendingApps.length} Pendentes)
          {activePendingApps.length > 0 && (
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('redistribute')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeSubTab === 'redistribute' ? 'bg-[#0B1F33] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          🔄 Redistribuição de Emergência
        </button>
        <button
          onClick={() => setActiveSubTab('financeConfig')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeSubTab === 'financeConfig' ? 'bg-[#0B1F33] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          💰 Configurações Financeiras
        </button>
      </div>

      {/* RENDER VIEW: KPIs AND METRICS */}
      {activeSubTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Split metrics panel 1: Faxinas */}
            <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block tracking-widest font-display">🧹 Receita Faxinas</span>
                <span className="text-2xl font-black font-mono text-[#0B1F33] block mt-2">R$ {totalCleanVolume.toFixed(2)}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-50 text-[10px]">
                <span className="text-gray-500 block">Comissão CleanHost (12%/5%):</span>
                <span className="font-bold text-emerald-600 block mt-0.5">R$ {totalCleanIntermediation.toFixed(2)}</span>
              </div>
            </div>

            {/* Split metrics panel 2: Apoio Técnico */}
            <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block tracking-widest font-display">🛠️ Receita Apoio</span>
                <span className="text-2xl font-black font-mono text-[#0B1F33] block mt-2">R$ {totalSupportVolume.toFixed(2)}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-50 text-[10px]">
                <span className="text-gray-500 block">Comissão CleanHost (10%):</span>
                <span className="font-bold text-emerald-600 block mt-0.5">R$ {totalSupportIntermediation.toFixed(2)}</span>
              </div>
            </div>

            {/* Split metrics panel 3: Adm Intermediary Gains */}
            <div className="bg-[#0B1F33] text-white p-5 rounded-3xl flex flex-col justify-between shadow-md">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-widest font-display">💼 Lucro Adm Total</span>
                <span className="text-2xl font-black font-mono text-[#12D6C5] block mt-2">R$ {totalIntermediationEarned.toFixed(2)}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-700/60 text-[10px]">
                <span className="text-slate-300 block">Geral Transacionado:</span>
                <span className="font-bold text-white block mt-0.5">R$ {totalSystemRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Split metrics panel 4: Active Stats */}
            <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block tracking-widest font-display">📈 Status Operação</span>
                <span className="text-2xl font-black font-mono text-amber-500 block mt-2">
                  {activeCleaningsCount} <span className="text-xs font-normal text-slate-500">ativas</span>
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-50 text-[10px] flex justify-between items-center text-gray-500">
                <span>Homologadas:</span>
                <span className="font-bold text-[#0B1F33]">{professionals.filter(p => p.isApproved).length} ativas</span>
              </div>
            </div>

          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Visual breakdown list */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-3xs space-y-4">
              <h3 className="font-bold text-base text-[#0B1F33]">Auditoria Operacional do Dia</h3>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {requests.map(req => (
                  <div key={req.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border text-xs text-[#0B1F33]">
                    <div>
                      <span className="font-bold block">{req.propertyName}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Operadora: {req.professionalName || 'Não atribuída'} &lt;&gt; {req.type}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${req.status === RequestStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {req.status}
                      </span>
                      <span className="font-mono block font-bold mt-1 text-[11px]">Taxa: R$ {req.appFee.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support guarantee panel */}
            <div className="bg-[#0B1F33] text-white p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="text-[#12D6C5] w-5 h-5 flex-shrink-0 animate-bounce" />
                  <h4 className="font-bold text-sm uppercase tracking-wider text-white">Garantia CleanHost Ativada</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Havendo alertas de cancelamento ou queixas de anfitriões, você possui autonomia para disparar bônus automáticos de R$ 30,00 adicionais para as profissionais de substituição na região.
                </p>
              </div>

              <div className="border-t border-slate-700/60 pt-4 mt-6">
                <span className="text-[10px] font-mono text-[#12D6C5]">Painel de Suporte Oficial de Controle Global</span>
              </div>
            </div>

          </div>

          {/* MONTHLY EVOLUTION CHART CARD */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#0B1F33] flex items-center gap-2 font-display">
              <span className="text-[#0A66FF] text-lg">📊</span> Evolução Mensal Consolidada (Volume Bruto)
            </h3>
            
            <p className="text-xs text-gray-500">
              Desempenho comparativo do volume circulado no ecossistema CleanHost entre serviços de limpeza e reparos.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold py-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600 block"></span>
                <span className="text-slate-600">🧹 Faxinas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500 block"></span>
                <span className="text-slate-600">🛠️ Apoio Técnico</span>
              </div>
            </div>

            {/* Visual HTML grid based columns chart */}
            <div className="pt-8 pb-3 grid grid-cols-4 gap-4 h-[240px] md:h-[280px]">
              {historicalData.map((item, idx) => {
                const totalMonth = item.clean + item.support;
                const cleanPct = (item.clean / maxVal) * 100;
                const supportPct = (item.support / maxVal) * 100;
                return (
                  <div key={idx} className="flex flex-col justify-end items-center h-full space-y-3 relative group">
                    
                    {/* Columns bar wrapper */}
                    <div className="flex items-end gap-1.5 md:gap-3 h-full w-full justify-center max-w-[120px]">
                      
                      {/* Faxinas Column */}
                      <div 
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-t-md relative group/col w-4 sm:w-8"
                        style={{ height: `${Math.max(cleanPct, 8)}%` }}
                      >
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover/col:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0B1F33] text-white text-[10px] py-1 px-2 rounded-lg font-mono font-bold z-50 pointer-events-none whitespace-nowrap shadow-md">
                          Faxinas: R$ {item.clean.toFixed(2)}
                        </div>
                      </div>

                      {/* Apoio Column */}
                      <div 
                        className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 rounded-t-md relative group/col w-4 sm:w-8"
                        style={{ height: `${Math.max(supportPct, 8)}%` }}
                      >
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover/col:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0B1F33] text-white text-[10px] py-1 px-2 rounded-lg font-mono font-bold z-50 pointer-events-none whitespace-nowrap shadow-md">
                          Apoio: R$ {item.support.toFixed(2)}
                        </div>
                      </div>

                    </div>

                    {/* Lower labels */}
                    <div className="text-center">
                      <span className="font-bold text-[10px] sm:text-xs text-slate-700 block font-sans">{item.month}</span>
                      <span className="text-[9px] font-mono font-black text-[#0A66FF] block">
                        R$ {totalMonth.toFixed(0)}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: PROFESSIONALS APPROVAL PIPELINE */}
      {activeSubTab === 'professionals' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Incoming Candidate requests */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#0B1F33] flex items-center justify-between">
              <span>Novos Cadastros CleanHost aguardando Liberação (CADASTROS PENDENTES)</span>
              <span className="bg-[#0B1F33] text-[#12D6C5] text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">{activePendingApps.length} registros</span>
            </h3>

            {activePendingApps.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-100">Não há cadastros sob análise no momento.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activePendingApps.map(cand => (
                  <div key={`pending-${cand.id}`} className="border border-gray-150 p-4 rounded-2xl bg-slate-50/50 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img 
                            src={cand.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80'} 
                            alt={cand.name} 
                            className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-[#0B1F33] flex items-center gap-1">
                              {cand.name}
                            </h4>
                            <p className="text-[10px] text-gray-400">E-mail: {cand.email}</p>
                            <span className="text-[9px] text-gray-400 font-mono">CPF/Documento: {cand.document || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-1 rounded-full uppercase ${
                          cand.role === 'HOST' ? 'bg-blue-100 text-[#0A66FF]' :
                          cand.role === 'CLIENTE' ? 'bg-purple-100 text-purple-700' :
                          cand.role === 'CLEANER' ? 'bg-emerald-100 text-emerald-700' :
                          cand.role === 'ADMIN' ? 'bg-slate-900 text-white' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {cand.role === 'HOST' ? '🏡 Anfitrião' :
                           cand.role === 'CLIENTE' ? '👤 Cliente' :
                           cand.role === 'CLEANER' ? '🧹 Faxina' :
                           cand.role === 'ADMIN' ? '💼 Admin Unidade' :
                           '🔧 Rede Apoio'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] mt-3 pt-2 border-t text-gray-500">
                        <p><strong>Cidade:</strong> {cand.city || 'São Paulo'}</p>
                        <p><strong>Telefone:</strong> {cand.phone || 'N/A'}</p>
                        <p className="col-span-2"><strong>Data do cadastro:</strong> {cand.createdAt ? new Date(cand.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(cand.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                        {cand.region && <p className="col-span-2"><strong>Atuação:</strong> {cand.region}</p>}
                        {cand.pixKey && <p><strong>Chave Pix:</strong> {cand.pixKey}</p>}
                        {cand.category && <p><strong>Espec.:</strong> {cand.category}</p>}
                        <p className="col-span-2 font-bold flex items-center gap-1 mt-1">
                          <strong>Status Cadastral:</strong> 
                          {cand.approvalStatus === 'correction_requested' ? (
                            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider">✏️ Correção Solicitada</span>
                          ) : cand.approvalStatus === 'rejected' ? (
                            <span className="text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider">❌ Reprovado</span>
                          ) : (
                            <span className="text-indigo-800 bg-indigo-150 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider">⏳ Aguardando Homologação</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-3 border-t border-slate-150">
                      <button
                        onClick={() => handleRejectUser(cand)}
                        className="cursor-pointer flex-1 py-1.8 bg-rose-50 hover:bg-rose-150 text-rose-600 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all"
                        title="Reprovar definitivamente o cadastro"
                      >
                        Reprovar
                      </button>
                      <button
                        onClick={() => handleRequestCorrection(cand)}
                        className="cursor-pointer flex-1 py-1.8 bg-amber-50 hover:bg-amber-150 text-amber-700 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all"
                        title="Solicitar correções nos dados cadastrais"
                      >
                        Pedir Correção
                      </button>
                      <button
                        onClick={() => handleApproveUser(cand)}
                        className="cursor-pointer flex-1.5 py-1.8 bg-[#0A66FF] hover:bg-blue-600 text-white text-[10px] sm:text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-3xs"
                        title="Homologar e liberar acesso"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aprovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Members audit - Block / Unblock */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#0B1F33]">Profissionais Ativas no Sistema (Bloqueio Exclusivo)</h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {professionals.map(prof => (
                <div 
                  key={prof.id} 
                  className={`border p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-colors ${prof.isApproved ? 'border-gray-100' : 'border-rose-200 bg-rose-50/15'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={prof.photoUrl} 
                      alt={prof.name} 
                      className={`w-9 h-9 rounded-full object-cover shrink-0 ${!prof.isApproved && 'grayscale opacity-60'}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className={`font-bold text-xs truncate ${prof.isApproved ? 'text-[#0B1F33]' : 'text-rose-600 line-through'}`}>{prof.name}</h4>
                      <p className="text-[9px] text-gray-400">Score: {prof.score} • {prof.region}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBlockProfessional(prof.id, prof.isApproved)}
                    className={`cursor-pointer px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${prof.isApproved ? 'text-rose-600 hover:bg-rose-50' : 'bg-emerald-100 text-emerald-800'}`}
                  >
                    {prof.isApproved ? <span className="flex items-center gap-0.5"><Ban className="w-3 h-3" /> Bloquear</span> : 'Reativar'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: REDISTRIBUTE ENGINE */}
      {activeSubTab === 'redistribute' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="pb-2 border-b">
            <h3 className="font-bold text-base text-[#0B1F33]">Redistribuição Manual de Solicitações Ativas</h3>
            <p className="text-xs text-gray-400 mt-1">
              Substitua ou adicione a profissional vinculada a uma faxina em caso de urgência, imprevisto ou redimensionamento de equipe.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* FORM AREA */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Painel de Reatribuição</h4>
                <form onSubmit={handleRedistributeRequest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Qual solicitação deseja redistribuir?</label>
                    <select
                      value={reassignReqId}
                      onChange={(e) => setReassignReqId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                      required
                    >
                      <option value="">Selecione a faxina...</option>
                      {requests.filter(r => r.status !== RequestStatus.COMPLETED).map(r => (
                        <option key={r.id} value={r.id}>
                          {r.propertyName} ({r.id}) - {r.professionalName || 'Pendente'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Atribuir qual outro profissional homologado de substituição?</label>
                    <select
                      value={reassignCleanId}
                      onChange={(e) => setReassignCleanId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                      required
                    >
                      <option value="">Selecione a profissional...</option>
                      {professionals.filter(p => p.isApproved).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Score: {p.score} • {p.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="cursor-pointer w-full py-3 bg-[#0B1F33] hover:bg-black text-[#12D6C5] font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <RefreshCw className="w-4 h-4 text-[#12D6C5]" />
                    Executar Transferência de Chamado
                  </button>
                </form>
              </div>
            </div>

            {/* VISUAL LIST AREA */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Monitor de Solicitações Elegíveis ({requests.filter(r => r.status !== RequestStatus.COMPLETED).length})</h4>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {requests.filter(r => r.status !== RequestStatus.COMPLETED).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 border border-dashed rounded-2xl">
                    <p className="text-xs font-medium">Nenhum chamado ativo disponível no momento.</p>
                    <p className="text-[10px] mt-1 text-slate-350">Crie novas faxinas na aba do Anfitrião ou clique em "Reset Sandbox" para recarregar as solicitações padrão.</p>
                  </div>
                ) : (
                  requests.filter(r => r.status !== RequestStatus.COMPLETED).map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => setReassignReqId(r.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all hover:border-blue-300 hover:bg-blue-50/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${reassignReqId === r.id ? 'border-blue-500 bg-blue-50/20 shadow-2xs' : 'border-slate-150 bg-white'}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 py-0.5 px-2 rounded-md font-mono">{r.id}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            r.status === RequestStatus.PENDING ? 'bg-amber-100 text-amber-800' :
                            r.status === RequestStatus.ASSIGNED ? 'bg-indigo-100 text-indigo-800' :
                            r.status === RequestStatus.IN_PROGRESS ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-850'
                          }`}>
                            {r.status}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">{r.type}</span>
                        </div>
                        <h5 className="font-extrabold text-xs text-slate-800">{r.propertyName}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{r.propertyAddress}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="w-4 h-4 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            {r.professionalPhoto ? (
                              <img src={r.professionalPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="text-[9px] font-bold text-center text-slate-500">?</div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Encarregada: <span className="font-bold text-slate-700">{r.professionalName || 'Pendente de Atribuição'}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReassignReqId(r.id);
                        }}
                        className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all shrink-0 cursor-pointer self-start sm:self-center ${reassignReqId === r.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {reassignReqId === r.id ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: FINANCE CONFIGURATION AND AUDITING LOGS */}
      {activeSubTab === 'financeConfig' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* PARAMETERS CONFIGURATION CARD */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#0B1F33]">Parâmetros Globais de Cobrança e Repasses</h3>
                <p className="text-xs text-gray-400 mt-1">Configure as regras de cobrança padrão e intermediação retida de faturamento.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0B1F33] block">Chave Pix Recebedora (CleanHost Holding S.A.)</label>
                  <input
                    type="text"
                    value={chkPix}
                    onChange={(e) => setChkPix(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    placeholder="Chave Pix da Agência"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0B1F33] block">Taxa de Intermediação Padrão (%)</label>
                    <input
                      type="number"
                      value={chkStd}
                      onChange={(e) => setChkStd(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0B1F33] block">Taxa de Intermediação Fidelidade (%)</label>
                    <input
                      type="number"
                      value={chkLoyal}
                      onChange={(e) => setChkLoyal(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0B1F33] block">Instituição Financeira &amp; Favorecido Oficial</label>
                  <input
                    type="text"
                    value={chkAccount}
                    onChange={(e) => setChkAccount(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    placeholder="Ex: Cleanhost Hold S.A. - Banco Cora"
                  />
                </div>

                {/* Split repasses automáticos switch */}
                <div className="flex justify-between items-center bg-[#F4F7FA] p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-[#0B1F33] block">Status do Repasse de Pix Automático</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Retém a comissão e passa o valor líquido para a profissional na hora.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChkAuto(!chkAuto)}
                    className={`cursor-pointer text-xs font-black px-4 py-1.5 rounded-full transition-all text-white ${chkAuto ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  >
                    {chkAuto ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onChangeFinanceSettings) {
                      onChangeFinanceSettings({
                        pixKey: chkPix,
                        standardTax: chkStd,
                        loyaltyTax: chkLoyal,
                        recipientAccount: chkAccount,
                        autoRepassActive: chkAuto
                      });
                      alert('Configurações financeiras persistidas com sucesso!');
                    }
                  }}
                  className="cursor-pointer w-full py-3 bg-[#0A66FF] hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  Salvar Configurações Financeiras
                </button>
              </div>
            </div>

            {/* AUDIT LOG SECURITY SECTION */}
            <div className="bg-[#0B1F33] text-slate-100 p-6 rounded-3xl flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute right-4 top-4 bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                AUDIT LOGSECURE
              </div>

              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <h4 className="font-extrabold text-sm uppercase text-[#12D6C5] tracking-wider font-display">Log de Auditoria de Transações Financeiras</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Registros imutáveis das tarifas calculadas e movimentações operadas nas faxinas e reparos da rede CleanHost.
                  </p>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {financeLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-12">Sem movimentações financeiras recentes no log.</p>
                  ) : (
                    financeLogs.map((log: any) => (
                      <div key={log.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-[11px] font-mono hover:bg-white/10 transition-colors">
                        <div className="flex justify-between font-bold text-white mb-1.5">
                          <span>{log.action}</span>
                          <span className="text-[#12D6C5]">R$ {log.value.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>{new Date(log.dateTime).toLocaleString('pt-BR')}</span>
                          <span>Taxa: R$ {log.taxApplied.toFixed(2)}</span>
                        </div>
                        <div className="mt-1 flex justify-between text-slate-300 text-[10px] italic">
                          <span>Destino: {log.recipient}</span>
                          <span className="text-amber-400">ID: {log.id}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 flex justify-between items-center">
                <span>Total Auditado: {financeLogs.length} logs</span>
                <span className="text-emerald-400 flex items-center gap-1">🛡️ Assinatura ClicImutável</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
