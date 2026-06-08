import React, { useState } from 'react';
import { 
  DollarSign, Calendar, Star, Trophy, Clock, Check, RefreshCw, Smartphone, 
  Map, Award, ArrowRight, ShieldCheck, Heart, User, CheckSquare, Plus, Save, Phone
} from 'lucide-react';
import { Professional, CleaningRequest, RequestStatus } from '../types';

interface CleanerSectionProps {
  professionals: Professional[];
  activeCleanerId: string;
  requests: CleaningRequest[];
  onUpdateRequest: (reqId: string, updates: Partial<CleaningRequest>) => void;
  onUpdateCleanerInfo: (cleanerId: string, updates: Partial<Professional>) => void;
  financeSettings?: any;
}

export default function CleanerSection({
  professionals,
  activeCleanerId,
  requests,
  onUpdateRequest,
  onUpdateCleanerInfo,
  financeSettings
}: CleanerSectionProps) {
  const currentCleaner = professionals.find(p => p.id === activeCleanerId) || professionals[0];
  const [editingPix, setEditingPix] = useState(false);
  const [editedPixKey, setEditedPixKey] = useState(currentCleaner?.pixKey || '');
  const [editedRegion, setEditedRegion] = useState(currentCleaner?.region || '');
  const [editedBank, setEditedBank] = useState(currentCleaner?.bank || 'Banco Cora');
  const [editedTitularName, setEditedTitularName] = useState(currentCleaner?.name || '');
  const [financeView, setFinanceView] = useState<'monthly' | 'detailed'>('monthly');

  if (!currentCleaner) {
    return (
      <div className="space-y-6" id="cleaner-how-it-works-view">
        {/* SIMULADOR HEADER OR MAIN CARD */}
        <div className="bg-[#0B1F33] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm" id="public-cleaner-loyalty-panel">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-white/5 font-black text-8xl pointer-events-none">10</div>
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[#12D6C5] font-mono font-bold tracking-widest uppercase block animate-pulse">Simulador - Visão do Prestador</span>
              <h3 className="text-xl font-bold font-display tracking-tight text-white mt-1">Como Cleaner / Faxina na CleanHost</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Seja bem-vindo à rede de parceiros CleanHost. Caso queira simular a visão operacional (agenda, serviços e repasses), cadastre um profissional de limpeza na aba de cadastro ou no topo em "Criar Nova Conta" com a opção <strong>"Cleaner / Faxina"</strong>.
              </p>
            </div>

            {/* 🎁 Programa Fidelidade CleanHost Section */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 sm:p-6 rounded-2xl space-y-4" id="intro-cleaner-loyalty-section">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <h4 className="text-sm font-black font-display text-emerald-400">🎁 Programa Fidelidade CleanHost</h4>
              </div>
              
              <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
                <p className="font-bold text-slate-100">
                  A cada 10 serviços concluídos pela plataforma, o próximo serviço será realizado sem taxa de intermediação.
                </p>
                <p className="text-slate-300">
                  Quanto mais você trabalha, mais benefícios recebe.
                </p>
              </div>

              {/* EXEMPLO VISUAL */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#12D6C5] block font-bold">Exemplo Visual</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-bold font-mono">10 serviços concluídos:</span>
                    <div className="text-sm font-mono tracking-[0.25em] text-[#12D6C5]">
                      ■■■■■■■■■■
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-slate-100 block">🎁 Próximo serviço = Taxa Zero</span>
                    <p className="text-[10px] text-slate-300">
                      O contador reinicia automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-455">
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Intermediação de lançamento CleanHost: <strong>{financeSettings?.cleanerFee ?? 5}%</strong></span>
              </div>
              <p className="italic text-slate-400">Cadastre um profissional na aba de cadastro para testar o painel interativo.</p>
            </div>
          </div>
        </div>

        {/* EXTRA PROMOTIONAL BODY CARDS FOR CLEANER ACCREDITATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="cleaner-features-promo-grid">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-2">
            <span className="text-lg">💰</span>
            <h4 className="text-xs font-bold text-[#0B1F33] font-display">Recebimento via Pix</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Repasses automáticos ou em apenas alguns cliques direto para sua chave cadastrada sem burocracias.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-2">
            <span className="text-lg">📍</span>
            <h4 className="text-xs font-bold text-[#0B1F33] font-display">Sua Região, Suas Regras</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Selecione os bairros que você atende e defina seus próprios preços padrão e expresso na plataforma.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-2">
            <span className="text-lg">⭐</span>
            <h4 className="text-xs font-bold text-[#0B1F33] font-display">Destaque Extra</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Seja avaliado com 5 estrelas pelos anfitriões para se tornar Super Cleaner com preferência em chamados urgentes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Availability calendar (7-day toggles)
  const [availDays, setAvailDays] = useState<Record<string, 'Livre' | 'Descanso'>>({
    'Segunda': 'Livre',
    'Terça': 'Livre',
    'Quarta': 'Descanso',
    'Quinta': 'Livre',
    'Sexta': 'Livre',
    'Sábado': 'Livre',
    'Domingo': 'Descanso'
  });

  const toggleDayStatus = (day: string) => {
    setAvailDays(prev => ({
      ...prev,
      [day]: prev[day] === 'Livre' ? 'Descanso' : 'Livre'
    }));
  };

  const handleSaveProfile = () => {
    onUpdateCleanerInfo(currentCleaner.id, {
      pixKey: editedPixKey,
      region: editedRegion,
      bank: editedBank,
      name: editedTitularName
    });
    setEditingPix(false);
    alert('Informações de perfil e dados para recebimento de Pix salvos!');
  };

  const myRequests = requests.filter(r => r.professionalId === currentCleaner.id);
  const activeJob = myRequests.find(r => r.status !== RequestStatus.COMPLETED);

  const totalEarnings = myRequests
    .filter(r => r.status === RequestStatus.COMPLETED)
    .reduce((sum, r) => sum + r.netValue, 0);

  // Loyalty calculations
  const servicesCompleted = currentCleaner.totalServices;
  const completedInCycle = servicesCompleted % 11;
  const nextTarget = 10;
  const isEligibleForLoyalty = completedInCycle === 10;
  const progressPercent = Math.min((completedInCycle / nextTarget) * 100, 100);

  // Process operational steps for the active job
  const handleNextStatus = () => {
    if (!activeJob) return;

    let nextStatus: RequestStatus | null = null;
    let updates: Partial<CleaningRequest> = {};

    switch (activeJob.status) {
      case RequestStatus.ASSIGNED:
        nextStatus = RequestStatus.EN_ROUTE;
        break;
      case RequestStatus.EN_ROUTE:
        nextStatus = RequestStatus.ARRIVED;
        break;
      case RequestStatus.ARRIVED:
        nextStatus = RequestStatus.IN_PROGRESS;
        // set some initial before photo evidence
        updates.beforePhotos = ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'];
        break;
      case RequestStatus.IN_PROGRESS:
        nextStatus = RequestStatus.FINALIZING;
        // Check a few items if not checked
        updates.checklist = {
          bathroom: true,
          kitchen: true,
          bedroom: true,
          floor: true,
          towels: true,
          garbage: false,
          replenishment: false
        };
        break;
      case RequestStatus.FINALIZING:
        nextStatus = RequestStatus.COMPLETED;
        // Check everything and add after photo evidence
        updates.checklist = {
          bathroom: true,
          kitchen: true,
          bedroom: true,
          floor: true,
          towels: true,
          garbage: true,
          replenishment: true
        };
        updates.afterPhotos = ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80'];
        break;
      default:
        break;
    }

    if (nextStatus) {
      onUpdateRequest(activeJob.id, {
        status: nextStatus,
        ...updates
      });

      // Special handling when cleaner finishes: increase professional's total services count!
      if (nextStatus === RequestStatus.COMPLETED) {
        onUpdateCleanerInfo(currentCleaner.id, {
          totalServices: currentCleaner.totalServices + 1
        });
      }
    }
  };

  // Turn check item on the flying checklist
  const toggleChecklistKey = (key: string) => {
    if (!activeJob) return;
    const currentCheck = activeJob.checklist;
    const updatedCheck = {
      ...currentCheck,
      [key]: !currentCheck[key as keyof typeof currentCheck]
    };
    onUpdateRequest(activeJob.id, {
      checklist: updatedCheck
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Welcome Panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={currentCleaner.photoUrl} 
            alt={currentCleaner.name} 
            className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#0B1F33]">{currentCleaner.name}</h3>
              {currentCleaner.isSuperCleaner && (
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                  ✦ Super Cleaner
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">Região cadastrada: <span className="text-[#0B1F33] font-semibold">{currentCleaner.region}</span></p>
          </div>
        </div>

        <div className="bg-[#0B1F33] text-white px-5 py-3 rounded-2xl flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <span className="text-gray-400 block uppercase font-mono text-[9px]">Sua Classificação</span>
            <span className="font-black text-[#12D6C5] font-sans text-sm">{currentCleaner.rating.toFixed(1)} ★</span>
            <span className="text-slate-300 ml-1">({currentCleaner.score} Score)</span>
          </div>
        </div>
      </div>

      {/* Fidelity Loyalty progress Card */}
      <div className="bg-[#0B1F33] text-white p-6 rounded-3xl relative overflow-hidden shadow-md" id="cleaner-loyalty-card">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-white/5 font-black text-8xl pointer-events-none">10</div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-600 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white">🎁 Programa Fidelidade CleanHost</span>
            <span className="text-[10px] text-[#12D6C5] font-mono font-bold uppercase tracking-wider">Benefício Automático</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-bold font-mono">Serviços concluídos:</span>
              <span className="text-3xl font-black text-[#12D6C5] font-mono leading-none">
                {completedInCycle} <span className="text-sm text-slate-500 font-normal">de 10</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-bold font-mono font-sans">Próximo benefício:</span>
              <p className="text-xs font-bold text-slate-200">
                Serviço sem taxa de intermediação.
              </p>
            </div>
          </div>

          {/* Progress bar as visual square characters */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Barra de progresso:</span>
            <div className="text-lg font-mono tracking-[0.25em] text-[#12D6C5] bg-slate-950/40 p-3 rounded-xl inline-block border border-slate-800">
              {(() => {
                const activeCount = Math.min(completedInCycle, 10);
                const inactiveCount = 10 - activeCount;
                return '■'.repeat(activeCount) + '□'.repeat(inactiveCount);
              })()}
            </div>
          </div>

          {/* Highlight when reaching 10 services */}
          {completedInCycle === 10 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 animate-bounce" id="loyalty-complete-congrats">
              <span className="text-2xl">🎉</span>
              <h5 className="text-sm font-black text-emerald-400 font-display">🎉 Parabéns!</h5>
              <p className="text-xs text-emerald-100 font-medium">
                Você desbloqueou uma operação com taxa zero.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Active Job & Statistics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Commute / Operational Controller */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#0B1F33] uppercase tracking-wider flex items-center justify-between pb-2 border-b">
              <span>CONTROLE DE SERVIÇO EM ANDAMENTO</span>
              {activeJob ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded animate-pulse">
                  {activeJob.status}
                </span>
              ) : (
                <span className="bg-slate-100 text-gray-500 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded">
                  Sem serviços pendentes
                </span>
              )}
            </h3>

            {activeJob ? (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-[#0B1F33]">IMÓVEL: {activeJob.propertyName}</h4>
                    <p className="text-[11px] text-gray-500 leading-normal">{activeJob.propertyAddress}</p>
                    <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ Observação do Anfitrião: {activeJob.observations || 'Nenhuma'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Seu Ganho Líquido</span>
                    <span className="text-lg font-mono font-black text-emerald-600">R$ {activeJob.netValue.toFixed(2)}</span>
                    <p className="text-[9px] text-gray-400">Bruto: R$ {activeJob.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Simulated commute control triggers */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-700">Etapa Operacional Atual:</span>
                    <span className="text-xs font-mono font-mono text-[#0B1F33] bg-white px-2 py-0.5 rounded shadow-2xs font-extrabold">{activeJob.status}</span>
                  </div>
                  
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleNextStatus}
                      className="cursor-pointer flex-1 py-3 bg-[#0A66FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      {activeJob.status === RequestStatus.ASSIGNED && 'Iniciar Deslocamento (A caminho)'}
                      {activeJob.status === RequestStatus.EN_ROUTE && 'Cheguei ao Imóvel (Iniciar Faxina)'}
                      {activeJob.status === RequestStatus.ARRIVED && 'Colocar Faxina em Curso'}
                      {activeJob.status === RequestStatus.IN_PROGRESS && 'Colocar em Finalização'}
                      {activeJob.status === RequestStatus.FINALIZING && 'Finalizar Faxina e Enviar Relatório'}
                      {activeJob.status === RequestStatus.COMPLETED && 'Limpeza Concluída! ✓'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Sub-checklist in work */}
                {activeJob.status !== RequestStatus.COMPLETED && (
                  <div className="border border-gray-100 p-4 rounded-2xl space-y-3">
                    <h5 className="font-bold text-xs uppercase text-[#0B1F33]">Pressione para preencher checklist de checagem jurídica:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'bathroom', emoji: '🚿', label: 'Banheiro' },
                        { key: 'kitchen', emoji: '🍳', label: 'Cozinha' },
                        { key: 'bedroom', emoji: '🛏️', label: 'Quarto' },
                        { key: 'floor', emoji: '🧹', label: 'Chão' },
                        { key: 'towels', emoji: '🧺', label: 'Toalhas' },
                        { key: 'garbage', emoji: '🗑️', label: 'Lixo' },
                        { key: 'replenishment', emoji: '🧴', label: 'Reposição' },
                      ].map(item => {
                        const checked = activeJob.checklist[item.key as keyof typeof activeJob.checklist];
                        return (
                          <button
                            key={item.key}
                            onClick={() => toggleChecklistKey(item.key)}
                            className={`cursor-pointer p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${checked ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-gray-150 text-gray-500 hover:bg-slate-50'}`}
                          >
                            <span>{item.emoji} {item.label}</span>
                            <span className="text-xs">{checked ? '✓' : '✖'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 bg-slate-50 rounded-2xl border border-dashed border-gray-150">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="font-medium">Todo os seus serviços estão com check-out ok!</p>
                <p className="text-xs text-gray-400 mt-1">Aguardando novos agendamentos das propriedades mais próximas.</p>
              </div>
            )}
          </div>

          {/* Service values summary history */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#0B1F33] font-display">Seu Histórico Financeiro e Repasses</h3>
            
            {/* Tab selector for financial view */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setFinanceView('monthly')}
                className={`cursor-pointer flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${financeView === 'monthly' ? 'bg-[#0B1F33] text-white shadow-2xs' : 'text-gray-500 hover:text-gray-900'}`}
              >
                📅 Rendimento Mensal
              </button>
              <button
                onClick={() => setFinanceView('detailed')}
                className={`cursor-pointer flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${financeView === 'detailed' ? 'bg-[#0B1F33] text-white shadow-2xs' : 'text-gray-500 hover:text-gray-900'}`}
              >
                📝 Extrato de Serviços
              </button>
            </div>

            {(() => {
              // Group real completed services by month
              const realCompleted = myRequests.filter(r => r.status === RequestStatus.COMPLETED);
              const realGrouped: Record<string, { total: number; count: number }> = {};
              
              realCompleted.forEach(req => {
                try {
                  const d = new Date(req.dateTime);
                  if (!isNaN(d.getTime())) {
                    const monthYear = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                    const formattedKey = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
                    if (!realGrouped[formattedKey]) {
                      realGrouped[formattedKey] = { total: 0, count: 0 };
                    }
                    realGrouped[formattedKey].total += req.netValue;
                    realGrouped[formattedKey].count += 1;
                  }
                } catch (e) {
                  // ignore
                }
              });

              // Now, calculate the simulated remainder to reach totalServices
              const totalRealCompletedCount = realCompleted.length;
              const simulatedNeeded = Math.max(0, currentCleaner.totalServices - totalRealCompletedCount);

              // Generate historically accurate simulated months
              const monthlyHistoryList: { month: string; total: number; count: number; isSimulated?: boolean }[] = [];
              
              // Add real months first
              Object.keys(realGrouped).forEach(month => {
                monthlyHistoryList.push({
                  month,
                  total: realGrouped[month].total,
                  count: realGrouped[month].count,
                  isSimulated: false
                });
              });

              // Add historical simulated months to match totalServices
              if (simulatedNeeded > 0) {
                const stdPrice = currentCleaner.priceStandard * 0.95; // net value estimation after fee reduction
                if (simulatedNeeded <= 4) {
                  monthlyHistoryList.push({
                    month: 'Abril de 2026',
                    total: simulatedNeeded * stdPrice,
                    count: simulatedNeeded,
                    isSimulated: true
                  });
                } else {
                  const firstChunk = Math.ceil(simulatedNeeded / 2);
                  const secondChunk = simulatedNeeded - firstChunk;
                  monthlyHistoryList.push({
                    month: 'Abril de 2026',
                    total: firstChunk * stdPrice,
                    count: firstChunk,
                    isSimulated: true
                  });
                  monthlyHistoryList.push({
                    month: 'Março de 2026',
                    total: secondChunk * stdPrice,
                    count: secondChunk,
                    isSimulated: true
                  });
                }
              }

              // Cumulative faturamento total including historical months
              const totalCumulativeEarnings = totalEarnings + monthlyHistoryList.reduce((sum, item) => item.isSimulated ? sum + item.total : 0, 0);

              // Sort list chronologically or statically (May, Apr, Mar)
              return (
                <div className="space-y-4">
                  {/* Total summary board */}
                  <div className="flex justify-between items-center bg-[#F4F7FA] p-4 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Faturamento Total Acumulado</span>
                      <span className="text-2xl font-black text-[#0A66FF] font-mono block">R$ {totalCumulativeEarnings.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-emerald-600 font-bold bg-white px-2.5 py-1 rounded-lg shadow-2xs">Em dia via Pix</span>
                    </div>
                  </div>

                  {financeView === 'monthly' ? (
                    /* Graphical / listed monthly breakdown */
                    <div className="space-y-3">
                      {monthlyHistoryList.map((item, idx) => {
                        const maxTotal = Math.max(...monthlyHistoryList.map(h => h.total), 1);
                        const progressPct = (item.total / maxTotal) * 100;
                        return (
                          <div key={idx} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-[#0B1F33]">
                              <span className="font-display font-bold">{item.month}</span>
                              <div className="text-right">
                                <span className="font-mono font-black text-emerald-600">+ R$ {item.total.toFixed(2)}</span>
                                <span className="text-[10px] text-gray-400 block font-normal">{item.count} {item.count === 1 ? 'faxina' : 'faxinas'}</span>
                              </div>
                            </div>
                            
                            {/* Visual small trend line representing earnings proportion */}
                            <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#0A66FF] h-full rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Detailed service-by-service log list */
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {myRequests.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">Nenhum serviço registrado neste extrato.</p>
                      ) : (
                        myRequests.map(item => (
                          <div key={item.id} className="flex justify-between text-xs p-3 bg-slate-50 border-b border-gray-100 rounded-xl">
                            <div>
                              <span className="font-bold block text-slate-800">{item.propertyName}</span>
                              <span className="text-[10px] text-gray-400">{new Date(item.dateTime).toLocaleDateString('pt-BR')} • {item.type}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-emerald-600 block">+ R$ {item.netValue.toFixed(2)}</span>
                              <span className="text-[9px] text-gray-400">Taxa retida: R$ {item.appFee.toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>


        </div>

        {/* Right Columns: Profile and availability calendar */}
        <div className="space-y-6">
          
          {/* Profile settings pix key */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-blue" />
              Configurações Operacionais
            </h4>

            {editingPix ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Região de Atendimento</label>
                  <input 
                    type="text"
                    value={editedRegion}
                    onChange={(e) => setEditedRegion(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Nome do Titular Conta Pix</label>
                  <input 
                    type="text"
                    value={editedTitularName}
                    onChange={(e) => setEditedTitularName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Banco</label>
                  <input 
                    type="text"
                    value={editedBank}
                    onChange={(e) => setEditedBank(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Itaú, Nubank, Banco do Brasil..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Chave Pix de Recebimento</label>
                  <input 
                    type="text"
                    value={editedPixKey}
                    onChange={(e) => setEditedPixKey(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[9px] text-gray-400">Aqui daremos o repasse imediato após confirmação do anfitrião.</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="cursor-pointer w-full py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-opacity-95"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Dados
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-[#F4F7FA]/75 p-3 rounded-2xl text-xs text-[#0B1F33]">
                <div>
                  <span className="text-gray-400 text-[10px] block font-semibold uppercase">Titular da Conta</span>
                  <span className="font-bold block truncate mt-0.5">{currentCleaner.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block font-semibold uppercase">Banco da Conta</span>
                  <span className="font-bold block truncate mt-0.5">{currentCleaner.bank || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block font-semibold uppercase">Sua Chave Pix</span>
                  <span className="font-mono font-bold font-semibold block truncate mt-0.5">{currentCleaner.pixKey}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block font-semibold uppercase">Seu Documento</span>
                  <span className="font-mono block truncate mt-0.5">{currentCleaner.document}</span>
                </div>
                <button
                  onClick={() => setEditingPix(true)}
                  className="text-[#0A66FF] hover:underline font-bold text-[10px] block pt-1"
                >
                  Alterar dados de cadastro
                </button>
              </div>
            )}
          </div>

          {/* Interactive Availability Calendar */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#12D6C5]" />
              Sua Agenda &amp; Folga
            </h4>
            <p className="text-[11px] text-gray-500 leading-normal">
              Selecione os dias da semana em que você está livre para receber alertas automáticos de urgência.
            </p>

            <div className="space-y-2">
              {Object.entries(availDays).map(([day, status]) => (
                <div 
                  key={day}
                  onClick={() => toggleDayStatus(day)}
                  className={`cursor-pointer p-2.5 rounded-xl border text-xs flex justify-between items-center transition-all ${status === 'Livre' ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800 font-medium' : 'bg-red-50/30 border-red-150 text-red-600 font-medium'}`}
                >
                  <span>{day}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold ${status === 'Livre' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-center text-gray-400 font-semibold italic mt-2">
              Os anfitriões em {currentCleaner.region} verão você somente nos dias marcados como "Livre".
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
