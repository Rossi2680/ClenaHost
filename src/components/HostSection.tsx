import React, { useState } from 'react';
import { 
  Plus, Home, Calendar, Sparkles, Star, MapPin, Clock, Shield, Play, 
  CheckCircle, MessageSquare, AlertCircle, Phone, Navigation, Award, 
  Camera, CheckSquare, ChevronRight, X, ArrowLeft, Heart, Send, ExternalLink, Receipt
} from 'lucide-react';
import { Property, Professional, CleaningRequest, CleaningType, RequestStatus } from '../types';

interface HostSectionProps {
  properties: Property[];
  professionals: Professional[];
  requests: CleaningRequest[];
  onAddRequest: (request: CleaningRequest) => void;
  onUpdateRequest: (reqId: string, updates: Partial<CleaningRequest>) => void;
  onAddProperty: (property: Property) => void;
  onOpenReceipt: (request: CleaningRequest) => void;
  financeSettings?: any;
  onRecordFinanceLog?: (log: any) => void;
  userName?: string;
}

export default function HostSection({
  properties,
  professionals,
  requests,
  onAddRequest,
  onUpdateRequest,
  onAddProperty,
  onOpenReceipt,
  financeSettings = { standardTax: 12, loyaltyTax: 5, pixKey: 'cleanhost.oficial@gmail.com' },
  onRecordFinanceLog,
  userName = 'Anfitrião'
}: HostSectionProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'request' | 'properties' | 'tracker'>('dashboard');
  const [selectedRequestIdForTracker, setSelectedRequestIdForTracker] = useState<string | null>(null);
  
  // New Property Form State
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropCity, setNewPropCity] = useState('São Paulo');
  const [newPropRooms, setNewPropRooms] = useState(2);
  const [newPropBathrooms, setNewPropBathrooms] = useState(1);

  // Cleaning Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizPropertyId, setWizPropertyId] = useState('');
  const [wizType, setWizType] = useState<CleaningType>(CleaningType.STANDARD);
  const [wizDate, setWizDate] = useState('');
  const [wizTime, setWizTime] = useState('');
  const [wizObservations, setWizObservations] = useState('');
  const [wizSelectedProfessionalId, setWizSelectedProfessionalId] = useState<string | null>(null);
  const [profFilter, setProfFilter] = useState<'closest' | 'rating' | 'cheapest' | 'super'>('closest');

  // Interactive Live Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<{ sender: 'host' | 'cleaner', text: string, time: string }[]>([
    { sender: 'cleaner', text: 'Boa tarde! Já estou a caminho do imóvel. Chego em 10 minutos.', time: '14:02' },
  ]);

  // Review Form state
  const [tempRatingQuality, setTempRatingQuality] = useState(5);
  const [tempRatingPunct, setTempRatingPunct] = useState(5);
  const [tempRatingOrg, setTempRatingOrg] = useState(5);
  const [tempRatingComm, setTempRatingComm] = useState(5);
  const [tempComment, setTempComment] = useState('');

  // Favorites state list
  const [favorites, setFavorites] = useState<string[]>(['prof-1', 'prof-4']);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const activeRequest = requests.find(r => r.id === selectedRequestIdForTracker) || requests.find(r => r.status !== RequestStatus.COMPLETED);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      name: newPropName,
      address: newPropAddress,
      city: newPropCity,
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      rooms: Number(newPropRooms),
      bathrooms: Number(newPropBathrooms)
    };

    onAddProperty(newProp);
    setShowAddPropertyModal(false);
    setNewPropName('');
    setNewPropAddress('');
    setNewPropRooms(2);
    setNewPropBathrooms(1);
  };

  const handleStartRequestWizard = () => {
    if (properties.length === 0) {
      alert('Por favor, cadastre um imóvel primeiro.');
      return;
    }
    setWizPropertyId(properties[0].id);
    setWizardStep(1);
    setWizSelectedProfessionalId(null);
    setWizObservations('');
    
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setWizDate(tomorrow.toISOString().split('T')[0]);
    setWizTime('10:00');
    setWizType(CleaningType.STANDARD);
    setActiveTab('request');
  };

  // Professional filtering
  const getFilteredProfessionals = () => {
    let list = [...professionals];
    if (wizType === CleaningType.EXPRESS) {
      list = list.filter(p => p.availability.includes('Manhã') || p.availability.includes('Tarde'));
    }
    
    switch (profFilter) {
      case 'closest':
        return list.sort((a,b) => a.distanceKm - b.distanceKm);
      case 'rating':
        return list.sort((a,b) => b.rating - a.rating);
      case 'cheapest':
        return list.sort((a,b) => {
          const priceA = wizType === CleaningType.EXPRESS ? a.priceExpress : a.priceStandard;
          const priceB = wizType === CleaningType.EXPRESS ? b.priceExpress : b.priceStandard;
          return priceA - priceB;
        });
      case 'super':
        return list.filter(p => p.isSuperCleaner);
      default:
        return list;
    }
  };

  const handleConfirmCleaningRequest = () => {
    const selectedProf = professionals.find(p => p.id === wizSelectedProfessionalId);
    if (!selectedProf) {
      alert('Selecione uma profissional disponível.');
      return;
    }

    const price = wizType === CleaningType.EXPRESS ? selectedProf.priceExpress : selectedProf.priceStandard;
    
    // Loyalty tier: after 10 completed cleanings, professional gets reduced fee of 5% instead of 12%
    // We display this in the receipt.
    const hasLoyalty = selectedProf.totalServices >= 10;
    const stdTax = financeSettings?.standardTax ?? 12;
    const loyalTax = financeSettings?.loyaltyTax ?? 5;
    const rate = hasLoyalty ? (loyalTax / 100) : (stdTax / 100);
    const appFee = price * rate;
    const netValue = price - appFee;
    const selectedProp = properties.find(p => p.id === wizPropertyId)!;

    const newReq: CleaningRequest = {
      id: `CH-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyId: wizPropertyId,
      propertyName: selectedProp.name,
      propertyAddress: selectedProp.address,
      type: wizType,
      dateTime: `${wizDate}T${wizTime}:00.000Z`,
      observations: wizObservations,
      status: RequestStatus.ASSIGNED,
      professionalId: selectedProf.id,
      professionalName: selectedProf.name,
      professionalPhoto: selectedProf.photoUrl,
      price: price,
      appFee: appFee,
      netValue: netValue,
      beforePhotos: [],
      afterPhotos: [],
      checklist: {
        bathroom: false,
        kitchen: false,
        bedroom: false,
        floor: false,
        towels: false,
        garbage: false,
        replenishment: false
      }
    };

    if (onRecordFinanceLog) {
      onRecordFinanceLog({
        id: `TX-LOG-${Math.floor(10000 + Math.random() * 90000)}`,
        dateTime: new Date().toISOString(),
        action: `Retenção Taxa Intermediação (${hasLoyalty ? loyalTax : stdTax}%)`,
        value: price,
        taxApplied: appFee,
        recipient: selectedProf.name,
        cleanerId: selectedProf.id
      });
    }

    onAddRequest(newReq);
    setSelectedRequestIdForTracker(newReq.id);
    setActiveTab('tracker');
    setWizardStep(1);
    
    // Trigger simulated cleaner notification & arrival sequence
    setTimeout(() => {
      onUpdateRequest(newReq.id, { status: RequestStatus.EN_ROUTE });
    }, 5000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setChatLogs(prev => [...prev, { sender: 'host', text: chatMessage, time: nowStr }]);
    const currentMsg = chatMessage;
    setChatMessage('');

    // Simulated reply from cleaner
    setTimeout(() => {
      let reply = 'Estou focando no checklist agora! Vou enviar as fotos em breve.';
      if (currentMsg.toLowerCase().includes('oi') || currentMsg.toLowerCase().includes('tudo bem')) {
        reply = 'Olá! Tudo ótimo por aqui. A faxina está correndo super bem, apartamento maravilhoso.';
      } else if (currentMsg.toLowerCase().includes('chave') || currentMsg.toLowerCase().includes('portaria')) {
        reply = 'Entendido! Já peguei o acesso na portaria e o check-in foi registrado.';
      }
      setChatLogs(prev => [...prev, { sender: 'cleaner', text: reply, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 2500);
  };

  const handleCancelRequest = (reqId: string) => {
    if (confirm('Deseja realmente cancelar esta solicitação? A CleanHost buscará uma substituta automática se preferir.')) {
      onUpdateRequest(reqId, { status: RequestStatus.PENDING, professionalId: undefined, professionalName: undefined, professionalPhoto: undefined });
      alert('Profissional desvinculada. Buscando substituta automática prioritária (Garantia CleanHost)...');
      
      // Auto-assign another cleaner in 4 seconds
      setTimeout(() => {
        const otherClean = professionals.find(p => p.id !== 'prof-1' && p.isApproved);
        if (otherClean) {
          onUpdateRequest(reqId, {
            status: RequestStatus.ASSIGNED,
            professionalId: otherClean.id,
            professionalName: otherClean.name,
            professionalPhoto: otherClean.photoUrl
          });
          alert(`Substituição automática realizada com sucesso! A profissional ${otherClean.name} aceitou o serviço prioritário.`);
        }
      }, 4000);
    }
  };

  const submitReview = (reqId: string) => {
    const finalReview = {
      quality: tempRatingQuality,
      punctuality: tempRatingPunct,
      organization: tempRatingOrg,
      communication: tempRatingComm,
      comment: tempComment || 'Excelente serviço prestado!',
      date: new Date().toISOString()
    };

    onUpdateRequest(reqId, { 
      status: RequestStatus.COMPLETED,
      review: finalReview
    });

    // Award professional another service complete
    alert('Avaliação enviada com sucesso! Obrigado por ajudar a manter a rede CleanHost de alta confiança.');
    setTempComment('');
  };

  const activeCleanings = requests.filter(r => r.status !== RequestStatus.COMPLETED);
  const completedCleanings = requests.filter(r => r.status === RequestStatus.COMPLETED);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub-header Navigation */}
      <div className="flex bg-[#0B1F33] p-1.5 rounded-3xl shadow-sm border border-slate-800 justify-between items-center text-white">
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-[#0A66FF] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <Home className="w-4 h-4" />
            Painel Central
          </button>
          
          <button
            onClick={() => {
              if (activeCleanings.length > 0) {
                setSelectedRequestIdForTracker(activeCleanings[0].id);
                setActiveTab('tracker');
              } else {
                alert('Não há faxinas em andamento no momento. Solicite uma nova!');
              }
            }}
            className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'tracker' ? 'bg-[#0A66FF] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <Clock className="w-4 h-4 text-[#12D6C5]" />
            Acompanhar Operação
            {activeCleanings.length > 0 && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'properties' ? 'bg-[#0A66FF] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <Home className="w-4 h-4" />
            Meus Imóveis ({properties.length})
          </button>
        </div>

        <button
          onClick={handleStartRequestWizard}
          className="cursor-pointer bg-[#12D6C5] hover:bg-[#0fb0a3] text-[#0B1F33] text-xs md:text-sm font-black font-display px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#0B1F33]" />
          <span className="hidden sm:inline">Solicitar Limpeza</span>
          <span className="sm:hidden">Limpar</span>
        </button>
      </div>

      {/* RENDER VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block font-display">Seus Imóveis</span>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-black font-display text-[#0B1F33]">{properties.length}</span>
                <span className="text-xs text-[#0A66FF] font-semibold">Cadastrados</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block font-display">Faxinas ativas</span>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-black font-display text-[#0B1F33]">{activeCleanings.length}</span>
                <span className="text-xs text-amber-500 font-semibold">Ativos</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-xs flex flex-col justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block font-display">CleanHost Score</span>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-black font-display text-[#0B1F33]">98.2</span>
                <span className="text-xs text-[#0A66FF] font-semibold">★ Alta</span>
              </div>
            </div>
          </div>

          {/* Active Services List */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-[#0B1F33] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-pulse"></span>
              Limpezas Solicitadas e em Operação
            </h3>
            
            {activeCleanings.length === 0 ? (
              <div className="py-8 text-center text-gray-500 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="font-medium">Nenhuma limpeza agendada ou em andamento.</p>
                <p className="text-xs text-gray-400 mt-1">Otimize a virada de hóspede solicitando um serviço expresso!</p>
                <button
                  onClick={handleStartRequestWizard}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A66FF] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Solicitar Agora
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeCleanings.map(req => {
                  const statusColors: Record<RequestStatus, string> = {
                    [RequestStatus.PENDING]: 'bg-gray-100 text-gray-800',
                    [RequestStatus.ASSIGNED]: 'bg-blue-50 text-blue-700 border border-blue-200',
                    [RequestStatus.EN_ROUTE]: 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse',
                    [RequestStatus.ARRIVED]: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
                    [RequestStatus.IN_PROGRESS]: 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse',
                    [RequestStatus.FINALIZING]: 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse',
                    [RequestStatus.COMPLETED]: 'bg-slate-200 text-slate-800'
                  };

                  return (
                    <div 
                      key={req.id} 
                      className="border border-gray-100 hover:border-gray-200 rounded-2xl p-4 bg-slate-50/50 hover:shadow-xs transition-colors flex flex-col justify-between"
                    >
                      <div>
                        {/* Upper Section */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#0A66FF] tracking-wider block bg-blue-50 px-2 py-0.5 rounded w-max mb-1">
                              {req.type}
                            </span>
                            <h4 className="font-bold text-sm text-[#0B1F33]">{req.propertyName}</h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{req.propertyAddress}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusColors[req.status]}`}>
                            {req.status}
                          </span>
                        </div>

                        {/* Professional Assigned */}
                        {req.professionalId ? (
                          <div className="flex items-center gap-2 mt-3 bg-white p-2.5 rounded-xl border border-gray-100">
                            <img 
                              src={req.professionalPhoto} 
                              alt={req.professionalName} 
                              className="w-8 h-8 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs truncate text-[#0B1F33]">{req.professionalName}</h5>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                Super Cleaner Parceira
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-[#0B1F33]">R$ {req.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 border border-dashed border-amber-300 rounded-xl bg-amber-50 text-xs text-amber-800 flex items-center gap-2 mt-3">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Buscando profissionais na região...</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100/80">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(req.dateTime).toLocaleDateString('pt-BR')} às {new Date(req.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Cancelar / Substituir
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequestIdForTracker(req.id);
                              setActiveTab('tracker');
                            }}
                            className="bg-[#0A66FF] hover:bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white text-white" />
                            Acompanhar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Favorites Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left column: Favorite Professionals Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-bold text-lg text-[#0B1F33] flex items-center justify-between">
                <span>Profissionais Favoritas na Rede</span>
                <span className="text-xs text-[#0A66FF] font-semibold bg-blue-50 px-2 py-0.5 rounded-md">Atendimento Rápido</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                {professionals.map(prof => {
                  const isFav = favorites.includes(prof.id);
                  return (
                    <div 
                      key={prof.id}
                      className={`border p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3 relative ${isFav ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100'}`}
                    >
                      <img 
                        src={prof.photoUrl} 
                        alt={prof.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs truncate text-[#0B1F33]">{prof.name}</h4>
                          {prof.isSuperCleaner && (
                            <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1 rounded-sm">SUPER</span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-500 font-bold text-xs mt-0.5 gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{prof.rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-[10px] font-normal">({prof.totalServices} serviços)</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-1">Região: {prof.region}</p>
                      </div>

                      <button 
                        onClick={(e) => toggleFavorite(prof.id, e)}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500--' : 'text-gray-400'}`} color={isFav ? '#f43f5e' : '#9ca3af'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column: Host Properties Callout */}
            <div className="bg-[#0B1F33] text-white p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[#12D6C5] text-[10px] font-extrabold uppercase tracking-widest bg-[#12D6C5]/10 px-2.5 py-1 rounded-full w-max block mb-4">
                  Selo Garantia CleanHost ✦
                </span>
                <h3 className="text-xl font-bold tracking-tight">Imóvel limpo na hora ou estorno garantido!</h3>
                <p className="text-[#F4F7FA]/75 text-xs mt-2 leading-relaxed">
                  Caso a profissional designada sofra qualquer imprevisto operacional, nosso algoritmo substitui o serviço imediatamente em até 15 minutos de forma 100% automática.
                </p>
              </div>

              <div className="mt-8 border-t border-slate-700/60 pt-4 text-xs font-mono text-[#12D6C5] flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Segurança Legal LGPD Ativada</span>
              </div>
            </div>

          </div>

          {/* Historic / Completed Cleanings List */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-[#0B1F33]">Histórico de Viradas Realizadas</h3>
            
            {completedCleanings.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum serviço finalizado anteriormente.</p>
            ) : (
              <div className="space-y-3">
                {completedCleanings.map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-slate-50 rounded-2xl border border-gray-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#0B1F33]">{req.propertyName}</h4>
                        <p className="text-[10px] text-gray-500">
                          {req.type} • Finalizado em {new Date(req.dateTime).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold block text-slate-800">R$ {req.price.toFixed(2)}</span>
                        <span className="text-[9px] text-gray-400 block">Com taxas inclusas</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onOpenReceipt(req)}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 text-[#0B1F33] rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-brand-blue" />
                          Recibo
                        </button>
                        
                        {req.review ? (
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded-lg border border-amber-200 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{req.review.quality} ★</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRequestIdForTracker(req.id);
                              setActiveTab('tracker');
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Avaliar Profissional
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER VIEW: WIZARD TO REQUEST CLEANING */}
      {activeTab === 'request' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 className="font-bold text-xl text-[#0B1F33]">Solicitar Nova Virada de Imóvel e Limpeza</h3>
              <p className="text-xs text-gray-500 mt-1">Agendamento ou modalidade rápida de urgência</p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center gap-2 justify-center py-2 max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${wizardStep >= step ? 'bg-[#0A66FF] text-white ring-4 ring-blue-100' : 'bg-slate-150 text-slate-400'}`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 transition-all ${wizardStep > step ? 'bg-[#0A66FF]' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* STEP 1: Property and Details */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
              <h4 className="font-bold text-sm text-[#0B1F33] block uppercase tracking-wider mb-2">Selecione o Imóvel &amp; Tipo</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Qual imóvel deseja preparar?</label>
                <div className="grid gap-2">
                  {properties.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setWizPropertyId(p.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${wizPropertyId === p.id ? 'border-[#0A66FF] bg-blue-50/10' : 'border-gray-100 bg-white hover:border-[#12D6C5]'}`}
                    >
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs block text-[#0B1F33]">{p.name}</span>
                        <span className="text-[10px] text-gray-400 block truncate">{p.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-xs font-bold text-slate-700">Modalidade de Limpeza</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: CleaningType.STANDARD, label: 'Limpeza Padrão', desc: 'Até as 18 horas' },
                    { type: CleaningType.EXPRESS, label: 'Limpeza Expressa', desc: 'Urgente para o mesmo dia!' },
                    { type: CleaningType.POST_CONSTRUCTION, label: 'Pós-Obra', desc: 'Limpeza pesada pós reforma' },
                    { type: CleaningType.LAUNDRY, label: 'Serviço de Lavanderia', desc: 'Roupas de cama externa' },
                  ].map(item => (
                    <div 
                      key={item.type}
                      onClick={() => setWizType(item.type)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${wizType === item.type ? 'border-[#0A66FF] bg-blue-50/20 text-[#0A66FF]' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[9px] text-gray-500 mt-1">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 bg-[#0A66FF] text-white font-bold rounded-xl text-xs hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Próximo Passo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Time, Scheduling & Observations */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
              <h4 className="font-bold text-sm text-[#0B1F33] block uppercase tracking-wider">Cronograma &amp; Recomendações</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Data da Faxina</label>
                  <input 
                    type="date"
                    value={wizDate}
                    onChange={(e) => setWizDate(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-[#0B1F33] focus:ring-2 focus:ring-[#0A66FF] outline-hidden"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Horário Previsto</label>
                  <input 
                    type="time"
                    value={wizTime}
                    onChange={(e) => setWizTime(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-[#0B1F33] focus:ring-2 focus:ring-[#0A66FF] outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Observações Especiais ou Senha da Portaria</label>
                <textarea
                  value={wizObservations}
                  onChange={(e) => setWizObservations(e.target.value)}
                  placeholder="Por favor, reabasteça os sabonetes líquidos, troque a toalha do lavabo e recolha as chaves."
                  rows={3}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-[#0B1F33] focus:ring-2 focus:ring-[#0A66FF] outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 bg-slate-100 text-[#0B1F33] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWizardStep(3);
                  }}
                  className="px-5 py-2.5 bg-[#0A66FF] text-white font-bold rounded-xl text-xs hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Selecionar Profissional
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Match & Professional Directory Selector */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-xs text-[#0A66FF] font-medium leading-tight">
                  ✨ <strong>CleanHost Match:</strong> Encontramos {getFilteredProfessionals().length} profissionais avaliadas na sua região disponíveis agora.
                </p>
              </div>

              {/* Filtering tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[
                  { key: 'closest', label: 'Mais Próximas' },
                  { key: 'rating', label: 'Melhores Avaliações' },
                  { key: 'cheapest', label: 'Menor Preço' },
                  { key: 'super', label: 'Super Cleaner ✦' }
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setProfFilter(f.key as any)}
                    className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold rounded-full border transition-all truncate flex-shrink-0 ${profFilter === f.key ? 'bg-[#0B1F33] text-white border-transparent shadow' : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Directory list */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {getFilteredProfessionals().map(prof => {
                  const estimatedTime = wizType === CleaningType.EXPRESS ? 'Em andamento em 30min' : 'Aprox. 4-5 horas';
                  const price = wizType === CleaningType.EXPRESS ? prof.priceExpress : prof.priceStandard;
                  const isGoldTier = prof.totalServices >= 10;
                  
                  return (
                    <div 
                      key={prof.id}
                      onClick={() => setWizSelectedProfessionalId(prof.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer relative ${wizSelectedProfessionalId === prof.id ? 'border-[#0A66FF] bg-blue-50/15 ring-2 ring-blue-200' : 'border-gray-100 bg-white hover:border-[#12D6C5]'}`}
                    >
                      {/* Active Selector node */}
                      {wizSelectedProfessionalId === prof.id && (
                        <div className="absolute right-3 top-3 bg-[#0A66FF] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">✓</div>
                      )}

                      <div className="flex items-center gap-3">
                        <img 
                          src={prof.photoUrl} 
                          alt={prof.name} 
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#0B1F33]">{prof.name}</span>
                            {prof.isSuperCleaner && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded uppercase tracking-wide flex items-center gap-0.5 animate-pulse">
                                ✦ Super Cleaner
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] mt-1 text-gray-500">
                            <span className="flex items-center text-amber-500 font-bold gap-0.5">
                              ★ {prof.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{prof.distanceKm} km de distância</span>
                            <span>•</span>
                            <span>{prof.region}</span>
                          </div>

                          {isGoldTier && (
                            <div className="mt-1 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-max font-semibold flex items-center gap-1">
                              💎 Taxa Fidelidade Ativa (Desconto de Taxa)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <span className="text-[10px] text-gray-400 font-medium block">Orçamento Estreito</span>
                        <div className="text-right">
                          <span className="text-base font-mono font-extrabold text-[#0B1F33]">R$ {price.toFixed(2)}</span>
                          <span className="text-[9px] text-gray-400 block">{estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 bg-slate-100 text-[#0B1F33] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCleaningRequest}
                  className="px-6 py-3 bg-[#12D6C5] hover:bg-[#0fb0a3] text-[#0B1F33] font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  Confirmar e Pagamento Garantido
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RENDER VIEW: PROPERTIES LIST */}
      {activeTab === 'properties' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h3 className="font-bold text-xl text-[#0B1F33]">Seus Imóveis Cadastrados</h3>
              <p className="text-xs text-gray-400 mt-1">Gerencie chaves, portarias e endereços de virada rápido.</p>
            </div>
            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="cursor-pointer bg-[#0A66FF] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Imóvel
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {properties.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-3xl overflow-hidden hover:shadow-md transition-all">
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="w-full h-40 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-base text-[#0B1F33]">{p.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0A66FF]" />
                    {p.address}
                  </p>
                  <p className="text-[11px] text-[#0B1F33] bg-[#F4F7FA] p-2 rounded-lg font-mono">
                    Quartos: {p.rooms} | Banheiros: {p.bathrooms}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* New property modal */}
          {showAddPropertyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                  onClick={() => setShowAddPropertyModal(false)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <form onSubmit={handleCreateProperty} className="space-y-4">
                  <h3 className="font-bold text-lg text-[#0B1F33]">Novo Imóvel de Temporada</h3>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Nome (Apelido no App)</label>
                    <input 
                      type="text"
                      placeholder="Ex: Studio Design Paulista"
                      value={newPropName}
                      onChange={(e) => setNewPropName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-hidden"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Endereço Completo</label>
                    <input 
                      type="text"
                      placeholder="Rua Consolação, 2300"
                      value={newPropAddress}
                      onChange={(e) => setNewPropAddress(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Quartos</label>
                      <input 
                        type="number"
                        min={1}
                        value={newPropRooms}
                        onChange={(e) => setNewPropRooms(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Banheiros</label>
                      <input 
                        type="number"
                        min={1}
                        value={newPropBathrooms}
                        onChange={(e) => setNewPropBathrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0A66FF] font-bold text-xs text-white rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Salvar Imóvel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: TRACKER / REAL TIME TRACKING IN AIRBNB STYLE */}
      {activeTab === 'tracker' && activeRequest && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          
          {/* Tracker Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
            <div>
              <span className="text-[#0A66FF] font-bold tracking-widest text-[10px] uppercase bg-blue-50 px-2.5 py-1 rounded w-max block mb-1">
                Acompanhamento em Tempo Real
              </span>
              <h3 className="text-xl font-bold text-[#0B1F33] flex items-center gap-2">
                {activeRequest.propertyName} 
                <span className="font-mono text-xs text-gray-400">({activeRequest.id})</span>
              </h3>
              <p className="text-xs text-gray-500 italic mt-0.5">{activeRequest.propertyAddress}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a 
                href="https://wa.me/5519988007880"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-600 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 fill-white" />
                WhatsApp Suporte Oficial CleanHost
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Status flow */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Progress Flow bar */}
              <div className="bg-[#F4F7FA] p-5 rounded-2xl">
                <h4 className="font-bold text-xs text-[#0B1F33] uppercase mb-4 tracking-wider">Etapa Atual</h4>
                <div className="grid grid-cols-6 gap-1 md:gap-2 text-center text-[10px] font-bold">
                  {[
                    { st: RequestStatus.ASSIGNED, label: 'Agendado' },
                    { st: RequestStatus.EN_ROUTE, label: 'A caminho' },
                    { st: RequestStatus.ARRIVED, label: 'No imóvel' },
                    { st: RequestStatus.IN_PROGRESS, label: 'Em curso' },
                    { st: RequestStatus.FINALIZING, label: 'Finalizando' },
                    { st: RequestStatus.COMPLETED, label: 'Pronto ✨' },
                  ].map((item, idx) => {
                    const statuses = [RequestStatus.ASSIGNED, RequestStatus.EN_ROUTE, RequestStatus.ARRIVED, RequestStatus.IN_PROGRESS, RequestStatus.FINALIZING, RequestStatus.COMPLETED];
                    const activeIdx = statuses.indexOf(activeRequest.status);
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;
                    
                    return (
                      <div key={item.st} className="space-y-1.5">
                        <div className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-[#0A66FF]' : 'bg-gray-200'}`} />
                        <span className={`block truncate ${isActive ? 'text-[#0A66FF] font-black scale-102' : isCompleted ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checklist visualizer */}
              <div className="border border-gray-100 p-5 rounded-2xl bg-white space-y-4 shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-sm text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-[#0A66FF]" />
                    Checklist de Verificação Operacional
                  </h4>
                  <span className="text-[10px] text-gray-500 font-semibold italic">Progresso do check</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'bathroom', label: '🚿 Banheiro (Espelhos, sabonete, vaso sanitário sanitizado)' },
                    { key: 'kitchen', label: '🍳 Cozinha (Louça lavada, pia seca, micro-ondas limpo)' },
                    { key: 'bedroom', label: '🛏️ Quartos (Roupa de cama trocada, lençois esticados)' },
                    { key: 'floor', label: '🧹 Chão (Aspirado e passado pano com álcool perfumado)' },
                    { key: 'towels', label: '🧺 Toalhas (Dobras em rolo, dispostas na cama)' },
                    { key: 'garbage', label: '🗑️ Lixo (Retirado e novas sacolas pretas adicionadas)' },
                    { key: 'replenishment', label: '🧴 Reposição (Papel higiênico extra e amenities)' },
                  ].map(ch => {
                    const checked = activeRequest.checklist[ch.key as keyof typeof activeRequest.checklist];
                    return (
                      <div 
                        key={ch.key}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${checked ? 'bg-emerald-50/50 border-emerald-100 text-[#0B1F33]' : 'bg-slate-50 border-gray-150 text-gray-400'}`}
                      >
                        <span className="font-medium pr-1">{ch.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-black ${checked ? 'bg-emerald-500 border-transparent text-white' : 'border-gray-300'}`}>
                          {checked ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload evidence */}
              <div className="border border-gray-100 p-5 rounded-2xl bg-white space-y-3">
                <h4 className="font-bold text-sm text-[#0B1F33] uppercase tracking-wider">Evidências Fotográficas Obrigatorias</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">📸 Antes da Execução</span>
                    <div className="border border-dashed border-gray-250 w-full h-32 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden text-center relative">
                      {activeRequest.beforePhotos.length > 0 ? (
                        <img 
                          src={activeRequest.beforePhotos[0]} 
                          alt="Antes" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 italic font-medium px-2">Aguardando início do serviço...</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">✨ Depois (Resultado Final)</span>
                    <div className="border border-dashed border-gray-250 w-full h-32 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden text-center relative">
                      {activeRequest.afterPhotos.length > 0 ? (
                        <img 
                          src={activeRequest.afterPhotos[0]} 
                          alt="Depois" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 italic font-medium px-2">Será enviado pela profissional antes da saída</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RENDER DYNAMICALLY: REVIEW INTERFACES IF COMPLETED */}
              {activeRequest.status === RequestStatus.COMPLETED && !activeRequest.review && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h4 className="font-bold text-sm text-[#0b1f33] uppercase tracking-wide">Avaliar o Trabalho da Profissional</h4>
                  </div>
                  <p className="text-xs text-[#0b1f33]/80">O hóspede já vai fazer check-in! Como estava a virada executada por {activeRequest.professionalName}?</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                    {[
                      { key: 'qual', label: 'Qualidade Limpeza', val: tempRatingQuality, setter: setTempRatingQuality },
                      { key: 'punc', label: 'Pontualidade', val: tempRatingPunct, setter: setTempRatingPunct },
                      { key: 'org', label: 'Organização Geral', val: tempRatingOrg, setter: setTempRatingOrg },
                      { key: 'comm', label: 'Comunicação', val: tempRatingComm, setter: setTempRatingComm },
                    ].map(rating => (
                      <div key={rating.key} className="space-y-1 bg-white p-2.5 rounded-xl border border-gray-150">
                        <span className="text-[10px] font-bold block text-gray-500 leading-tight">{rating.label}</span>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(starIdx => (
                            <button
                              key={starIdx}
                              onClick={() => rating.setter(starIdx)}
                              className="focus:outline-hidden text-sm cursor-pointer"
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 block">{rating.val}/5 estrelas</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Deixe um comentário público (Opcional):</label>
                    <input 
                      type="text"
                      value={tempComment}
                      onChange={(e) => setTempComment(e.target.value)}
                      placeholder="Trabalho espetacular, super educada e ágil..."
                      className="w-full bg-white border rounded-lg px-3 py-2 text-xs outline-hidden"
                    />
                  </div>

                  <button
                    onClick={() => submitReview(activeRequest.id)}
                    className="cursor-pointer bg-[#0A66FF] hover:bg-blue-600 font-bold text-white text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Enviar Avaliação e Fechar Operação
                  </button>
                </div>
              )}
            </div>

            {/* Right details & chat */}
            <div className="space-y-6">
              
              {/* Regional Map Pin visual mockup */}
              <div className="bg-slate-100 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#0A66FF]" />
                    Localização &amp; Deslocação SP
                  </span>
                  <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold animate-pulse">Ao vivo</span>
                </div>
                
                <div className="bg-white rounded-xl h-44 overflow-hidden relative flex flex-col items-center justify-center p-4 border border-gray-150 text-center">
                  <div className="absolute inset-0 bg-blue-50 opacity-10 bg-grid-slate-400" />
                  
                  {/* Decorative Map paths */}
                  <div className="absolute h-1 w-full bg-amber-200 rotate-12 top-10" />
                  <div className="absolute h-0.5 w-full bg-slate-300 -border-[#0A66FF] scroll-my-2 rotate-45" />

                  {/* Marker representation based on status */}
                  <div className="z-10 bg-white p-3 rounded-xl shadow border border-gray-150 flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#0A66FF] rounded-full animate-ping shrink-0" />
                    <div>
                      <h5 className="font-bold text-[11px] text-[#0B1F33]">{activeRequest.professionalName}</h5>
                      <span className="text-[9px] text-gray-400 italic">Distância estimada: {activeRequest.price > 180 ? '0.8 km' : '2.1 km'}</span>
                    </div>
                  </div>

                  {/* Pinpoint icons */}
                  <div className="absolute right-12 bottom-12 bg-[#12D6C5] p-1.5 rounded-full border border-white shadow">
                    <Home className="w-3 h-3 text-white" />
                  </div>
                </div>

                <p className="text-[9px] text-center text-gray-400 mt-2">
                  Atendimento por distância e tempo de virada na região metropolitana paulistana.
                </p>
              </div>

              {/* Chat section */}
              <div className="border border-gray-100 p-4 rounded-2xl bg-[#0B1F33] text-white flex flex-col h-[320px]">
                <h4 className="font-bold text-xs text-white/90 uppercase tracking-wider pb-2 border-b border-white/10 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#12D6C5]" />
                  Chat com a Operadora
                </h4>
                
                {/* Chat content listing */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs pr-1">
                  {chatLogs.map((log, lidx) => (
                    <div 
                      key={lidx} 
                      className={`max-w-[85%] p-2.5 rounded-xl ${log.sender === 'host' ? 'ml-auto bg-[#0A66FF] text-white rounded-tr-none' : 'mr-auto bg-slate-800 text-white rounded-tl-none'}`}
                    >
                      <p className="leading-tight">{log.text}</p>
                      <span className="text-[8px] text-white/40 block text-right mt-1">{log.time}</span>
                    </div>
                  ))}
                </div>

                {/* Form submit */}
                <form onSubmit={handleSendChat} className="flex gap-1.5 pt-2 border-t border-white/10">
                  <input 
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Envie uma instrução ou pergunta..."
                    className="flex-1 bg-white/10 border border-white/5 px-3 py-2 text-xs text-white placeholder-white/40 rounded-lg outline-hidden focus:bg-white/15"
                  />
                  <button 
                    type="submit" 
                    className="p-2 bg-[#12D6C5] rounded-lg text-[#0B1F33] hover:bg-opacity-90 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
