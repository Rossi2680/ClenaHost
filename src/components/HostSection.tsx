import React, { useState } from 'react';
import { 
  Plus, Home, Calendar, Sparkles, Star, MapPin, Clock, Shield, Play, 
  CheckCircle, MessageSquare, AlertCircle, Phone, Navigation, Award, 
  Camera, CheckSquare, ChevronRight, X, ArrowLeft, Heart, Send, ExternalLink, Receipt,
  Wrench, Hammer, Sliders, Filter
} from 'lucide-react';
import { Property, Professional, CleaningRequest, CleaningType, RequestStatus, SupportProfessional, SupportJob } from '../types';

interface HostSectionProps {
  properties: Property[];
  professionals: Professional[];
  requests: CleaningRequest[];
  onAddRequest: (request: CleaningRequest) => void;
  onUpdateRequest: (reqId: string, updates: Partial<CleaningRequest>) => void;
  onAddProperty: (property: Property) => void;
  onUpdateProperty?: (property: Property) => void;
  onOpenReceipt: (request: CleaningRequest) => void;
  financeSettings?: any;
  onRecordFinanceLog?: (log: any) => void;
  userName?: string;
  loggedInUser?: any;
  supportProfessionals?: SupportProfessional[];
  supportJobs?: SupportJob[];
  onAddSupportJob?: (job: SupportJob) => void;
  onUpdateSupportJob?: (jobId: string, updates: Partial<SupportJob>) => void;
  onUpdateSupportProfessionalInfo?: (profId: string, updates: Partial<SupportProfessional>) => void;
}

export default function HostSection({
  properties,
  professionals,
  requests,
  onAddRequest,
  onUpdateRequest,
  onAddProperty,
  onUpdateProperty,
  onOpenReceipt,
  financeSettings = { standardTax: 12, loyaltyTax: 5, pixKey: 'cleanhost.oficial@gmail.com' },
  onRecordFinanceLog,
  userName = 'Anfitrião',
  loggedInUser,
  supportProfessionals = [],
  supportJobs = [],
  onAddSupportJob,
  onUpdateSupportJob,
  onUpdateSupportProfessionalInfo
}: HostSectionProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'request' | 'properties' | 'tracker' | 'support'>('dashboard');
  const [selectedRequestIdForTracker, setSelectedRequestIdForTracker] = useState<string | null>(null);
  const [payingRequestId, setPayingRequestId] = useState<string | null>(null);
  
  // New Property Form State
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropCity, setNewPropCity] = useState('Jundiaí');
  const [newPropEstado, setNewPropEstado] = useState('SP');
  const [newPropBairro, setNewPropBairro] = useState('');
  const [newPropCep, setNewPropCep] = useState('');
  const [newPropRooms, setNewPropRooms] = useState(2);
  const [newPropBathrooms, setNewPropBathrooms] = useState(1);

  // Edit Property Form State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPropName, setEditPropName] = useState('');
  const [editPropAddress, setEditPropAddress] = useState('');
  const [editPropCity, setEditPropCity] = useState('Jundiaí');
  const [editPropEstado, setEditPropEstado] = useState('SP');
  const [editPropBairro, setEditPropBairro] = useState('');
  const [editPropCep, setEditPropCep] = useState('');
  const [editPropRooms, setEditPropRooms] = useState(2);
  const [editPropBathrooms, setEditPropBathrooms] = useState(1);

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

  // Support Network state
  const [supportFilterCategory, setSupportFilterCategory] = useState<string>('All');
  const [supportFilterCity, setSupportFilterCity] = useState<string>('All');
  const [supportFilterRating, setSupportFilterRating] = useState<number>(0);
  const [supportFilterAvailability, setSupportFilterAvailability] = useState<string>('All');
  
  const [selectedSupportProfForView, setSelectedSupportProfForView] = useState<SupportProfessional | null>(null);
  const [hiringProf, setHiringProf] = useState<SupportProfessional | null>(null);
  
  // Support Hiring form fields
  const [wizSupportPropertyId, setWizSupportPropertyId] = useState<string>('');
  const [wizSupportDescription, setWizSupportDescription] = useState<string>('');
  const [wizSupportDate, setWizSupportDate] = useState<string>('');
  const [wizSupportTime, setWizSupportTime] = useState<string>('');
  const [wizSupportNotes, setWizSupportNotes] = useState<string>('');

  // Review Form state
  const [tempRatingQuality, setTempRatingQuality] = useState(5);
  const [tempRatingPunct, setTempRatingPunct] = useState(5);
  const [tempRatingOrg, setTempRatingOrg] = useState(5);
  const [tempRatingComm, setTempRatingComm] = useState(5);
  const [tempComment, setTempComment] = useState('');

  // Support Job Review states
  const [supportRatings, setSupportRatings] = useState<Record<string, number>>({});
  const [supportComments, setSupportComments] = useState<Record<string, string>>({});

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

    let finalCity = newPropCity;
    let finalEstado = newPropEstado;
    if (newPropCity.includes('/')) {
      const parts = newPropCity.split('/');
      finalCity = parts[0];
      finalEstado = parts[1];
    }

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      name: newPropName,
      address: newPropAddress,
      city: finalCity,
      estado: finalEstado,
      bairro: newPropBairro,
      cep: newPropCep,
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      rooms: Number(newPropRooms),
      bathrooms: Number(newPropBathrooms),
      ownerId: loggedInUser?.id || undefined,
      ownerEmail: loggedInUser?.email || undefined
    };

    onAddProperty(newProp);
    setShowAddPropertyModal(false);
    setNewPropName('');
    setNewPropAddress('');
    setNewPropBairro('');
    setNewPropCep('');
    setNewPropRooms(2);
    setNewPropBathrooms(1);
  };

  const handleSetupEditProperty = (p: Property) => {
    setEditingProperty(p);
    setEditPropName(p.name);
    setEditPropAddress(p.address || '');
    
    let initialCity = p.city || 'Jundiaí';
    let initialEstado = p.estado || 'SP';
    if (initialCity.includes('/')) {
      const parts = initialCity.split('/');
      initialCity = parts[0];
      initialEstado = parts[1];
    }
    
    setEditPropCity(initialCity);
    setEditPropEstado(initialEstado);
    setEditPropBairro(p.bairro || '');
    setEditPropCep(p.cep || '');
    setEditPropRooms(p.rooms || 2);
    setEditPropBathrooms(p.bathrooms || 1);
  };

  const handleUpdatePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    if (!editPropName || !editPropAddress) return;

    let finalCity = editPropCity;
    let finalEstado = editPropEstado;
    if (editPropCity.includes('/')) {
      const parts = editPropCity.split('/');
      finalCity = parts[0];
      finalEstado = parts[1];
    }

    const updatedProp: Property = {
      ...editingProperty,
      name: editPropName,
      address: editPropAddress,
      city: finalCity,
      estado: finalEstado,
      bairro: editPropBairro,
      cep: editPropCep,
      rooms: Number(editPropRooms),
      bathrooms: Number(editPropBathrooms)
    };

    if (onUpdateProperty) {
      onUpdateProperty(updatedProp);
    }
    setEditingProperty(null);
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
    
    // Loyalty tier: after 10 completed cleanings, professional gets 11th service with 0% fee (modulo 11 cycle)
    const completedCycle = selectedProf.totalServices % 11;
    const isZeroTax = completedCycle === 10;
    const promoFee = financeSettings?.cleanerFee ?? 5;
    const rate = isZeroTax ? 0 : (promoFee / 100);
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
      status: RequestStatus.PENDING, // starts as pending payment approval
      financialStatus: 'AGUARDANDO PAGAMENTO',
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
        action: `Retenção Taxa Intermediação (${isZeroTax ? 0 : promoFee}%)`,
        value: price,
        taxApplied: appFee,
        recipient: selectedProf.name,
        cleanerId: selectedProf.id
      });
    }

    onAddRequest(newReq);
    setPayingRequestId(newReq.id);
    setSelectedRequestIdForTracker(newReq.id);
    setActiveTab('dashboard'); // take them back to their overview where active operations are listed
    setWizardStep(1);
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

  const handleRateSupportProfessional = (jobId: string, profId: string) => {
    const rating = supportRatings[jobId] || 5;
    const comment = supportComments[jobId]?.trim() || 'Serviço de reparo executado com excelência, recomendo!';

    // 1. Update the SupportJob to include the review
    onUpdateSupportJob?.(jobId, {
      review: {
        rating,
        comment,
        date: new Date().toLocaleDateString('pt-BR')
      }
    });

    // 2. Find professional
    const prof = supportProfessionals.find(p => p.id === profId);
    if (prof) {
      const existingReviews = prof.reviews || [];
      const newReview = {
        id: `REV-${Math.floor(1001 + Math.random() * 8999)}`,
        raterName: loggedInUser?.name || userName || 'Anfitrião',
        rating,
        comment,
        date: new Date().toLocaleDateString('pt-BR')
      };
      
      const updatedReviews = [...existingReviews, newReview];
      
      // Calculate new average rating
      const totalRatingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverageRating = Number((totalRatingSum / updatedReviews.length).toFixed(1));
      
      // 3. Update the professional
      onUpdateSupportProfessionalInfo?.(profId, {
        reviews: updatedReviews,
        rating: newAverageRating
      });
    }

    alert('Muito obrigado! Sua avaliação foi enviada e ajudará a ranquear o profissional técnico nas buscas.');
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

          <button
            onClick={() => setActiveTab('support')}
            className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'support' ? 'bg-[#0A66FF] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            Rede de Apoio
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
                          
                          {(!req.financialStatus || req.financialStatus === 'AGUARDANDO PAGAMENTO') ? (
                            <button
                              onClick={() => setPayingRequestId(req.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              Pagar Pix
                            </button>
                          ) : req.financialStatus === 'PAGAMENTO INFORMADO' ? (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-250 px-2 py-1 rounded-lg font-bold">
                              Aguardando Admin
                            </span>
                          ) : (
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
                          )}
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
              <div key={p.id} className="border border-gray-100 rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    className="w-full h-40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-base text-[#0B1F33]">{p.name}</h4>
                    <p className="text-xs text-slate-800 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0A66FF] shrink-0" />
                      {p.address}
                    </p>
                    {p.city && (
                      <p className="text-[11px] text-gray-500 font-semibold pl-4.5">
                        📍 {(() => {
                          const displayCity = p.city;
                          const hasSlash = displayCity.includes('/');
                          const displayEstado = p.estado ? p.estado : (hasSlash ? '' : 'SP');
                          return hasSlash 
                            ? (p.estado && !displayCity.endsWith('/' + p.estado) ? `${displayCity.split('/')[0]}/${p.estado}` : displayCity)
                            : (p.estado ? `${displayCity}/${p.estado}` : `${displayCity}/SP`);
                        })()}
                        {p.bairro && ` - Bairro: ${p.bairro}`}
                        {p.cep && ` (CEP: ${p.cep})`}
                      </p>
                    )}
                    <p className="text-[11px] text-[#0B1F33] bg-[#F4F7FA] p-2 rounded-lg font-mono">
                      Quartos: {p.rooms} | Banheiros: {p.bathrooms}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleSetupEditProperty(p)}
                    className="w-full cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B1F33] font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>✏️</span> Editar Imóvel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New property modal */}
          {showAddPropertyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
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
                    <label className="text-xs font-bold text-gray-600 block">Nome (Apelido no App) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Ex: Studio Design Paulista"
                      value={newPropName}
                      onChange={(e) => setNewPropName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Cidade <span className="text-rose-500">*</span></label>
                      <select
                        value={newPropCity}
                        onChange={(e) => setNewPropCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden font-semibold bg-white text-slate-800"
                        required
                      >
                        <option value="Jundiaí">✅ Jundiaí — Ativa</option>
                        <option value="São Paulo">✅ São Paulo — Ativa</option>
                        <option value="Campinas">🟡 Campinas — Lista de Espera</option>
                        <option value="Sorocaba">🟡 Sorocaba — Lista de Espera</option>
                        <option value="Indaiatuba">🟡 Indaiatuba — Lista de Espera</option>
                        <option value="Itupeva">🟡 Itupeva — Lista de Espera</option>
                        <option value="Louveira">🟡 Louveira — Lista de Espera</option>
                        <option value="Vinhedo">🟡 Vinhedo — Lista de Espera</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Estado <span className="text-rose-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="Ex: SP"
                        value={newPropEstado}
                        onChange={(e) => setNewPropEstado(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Bairro</label>
                      <input 
                        type="text"
                        placeholder="Ex: Anhangabaú"
                        value={newPropBairro}
                        onChange={(e) => setNewPropBairro(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">CEP</label>
                      <input 
                        type="text"
                        placeholder="Ex: 13200-000"
                        value={newPropCep}
                        onChange={(e) => setNewPropCep(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Endereço Completo <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Rua Consolação, 2300"
                      value={newPropAddress}
                      onChange={(e) => setNewPropAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden"
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
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Banheiros</label>
                      <input 
                        type="number"
                        min={1}
                        value={newPropBathrooms}
                        onChange={(e) => setNewPropBathrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0A66FF] font-black text-xs text-white rounded-xl hover:bg-blue-600 transition-colors cursor-pointer uppercase tracking-wider mt-2 shadow-xs"
                  >
                    Salvar Imóvel
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Edit property modal */}
          {editingProperty && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" id="edit-property-modal-wrapper">
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                  onClick={() => setEditingProperty(null)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <form onSubmit={handleUpdatePropertySubmit} className="space-y-4">
                  <h3 className="font-bold text-lg text-[#0B1F33]">Editar Informações do Imóvel</h3>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Nome (Apelido no App) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Ex: Studio Design Paulista"
                      value={editPropName}
                      onChange={(e) => setEditPropName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Cidade <span className="text-rose-500">*</span></label>
                      <select
                        value={editPropCity}
                        onChange={(e) => setEditPropCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden font-semibold bg-white text-slate-800"
                        required
                      >
                        <option value="Jundiaí">✅ Jundiaí — Ativa</option>
                        <option value="São Paulo">✅ São Paulo — Ativa</option>
                        <option value="Campinas">🟡 Campinas — Lista de Espera</option>
                        <option value="Sorocaba">🟡 Sorocaba — Lista de Espera</option>
                        <option value="Indaiatuba">🟡 Indaiatuba — Lista de Espera</option>
                        <option value="Itupeva">🟡 Itupeva — Lista de Espera</option>
                        <option value="Louveira">🟡 Louveira — Lista de Espera</option>
                        <option value="Vinhedo">🟡 Vinhedo — Lista de Espera</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Estado <span className="text-rose-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="Ex: SP"
                        value={editPropEstado}
                        onChange={(e) => setEditPropEstado(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Bairro</label>
                      <input 
                        type="text"
                        placeholder="Ex: Anhangabaú"
                        value={editPropBairro}
                        onChange={(e) => setEditPropBairro(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">CEP</label>
                      <input 
                        type="text"
                        placeholder="Ex: 13200-000"
                        value={editPropCep}
                        onChange={(e) => setEditPropCep(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Endereço Completo <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Rua Consolação, 2300"
                      value={editPropAddress}
                      onChange={(e) => setEditPropAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Quartos</label>
                      <input 
                        type="number"
                        min={1}
                        value={editPropRooms}
                        onChange={(e) => setEditPropRooms(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 block">Banheiros</label>
                      <input 
                        type="number"
                        min={1}
                        value={editPropBathrooms}
                        onChange={(e) => setEditPropBathrooms(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-hidden text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingProperty(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#0A66FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center shadow-xs"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: REDE DE APOIO / DIRECT CONTRACTING */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card with description */}
          <div className="bg-[#0B1F33] p-6 rounded-3xl text-white relative overflow-hidden shadow-md">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[#12D6C5] font-mono text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2.5 py-1 rounded-full">
                  Exclusivo CleanHost
                </span>
                <h3 className="text-xl md:text-2xl font-black font-display mt-2">🔨 Rede de Apoio Especializada</h3>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
                  Encontre e contrate eletricistas, encanadores, chaveiros, pintores e pedreiros homologados diretamente para cuidar de seus imóveis de temporada.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 shrink-0 text-center font-sans">
                <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Soluções Rápidas</span>
                <span className="text-emerald-400 font-mono text-base font-black">Atendimento Seguro</span>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <h4 className="font-bold text-sm text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#0A66FF]" />
                Filtrar Rede de Profissionais
              </h4>
              <button 
                onClick={() => {
                  setSupportFilterCategory('All');
                  setSupportFilterCity('All');
                  setSupportFilterRating(0);
                  setSupportFilterAvailability('All');
                }}
                className="text-xs font-semibold text-[#0A66FF] hover:underline cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
                <select
                  value={supportFilterCategory}
                  onChange={(e) => setSupportFilterCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-150 p-2.5 rounded-xl text-xs text-[#0B1F33] font-bold focus:outline-hidden"
                >
                  <option value="All">⚡ Todas as Categorias</option>
                  <option value="Eletricista">⚡ Eletricistas</option>
                  <option value="Encanador">🚰 Encanadores</option>
                  <option value="Chaveiro">🔑 Chaveiros</option>
                  <option value="Pintor">🎨 Pintores</option>
                  <option value="Pedreiro">🧱 Pedreiros</option>
                  <option value="Manutenção Geral">🛠️ Outros profissionais</option>
                </select>
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Cidade / Região</label>
                <select
                  value={supportFilterCity}
                  onChange={(e) => setSupportFilterCity(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-150 p-2.5 rounded-xl text-xs text-[#0B1F33] font-bold focus:outline-hidden"
                >
                  <option value="All">📍 Todas as Cidades</option>
                  <option value="Jundiaí">Jundiaí/SP</option>
                  <option value="São Paulo">São Paulo/SP</option>
                </select>
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Avaliação Mínima</label>
                <select
                  value={supportFilterRating.toString()}
                  onChange={(e) => setSupportFilterRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-150 p-2.5 rounded-xl text-xs text-[#0B1F33] font-bold focus:outline-hidden"
                >
                  <option value="0">⭐ Qualquer Nota</option>
                  <option value="4.5">⭐ 4.5 ou superior</option>
                  <option value="4.8">⭐ 4.8 ou superior</option>
                  <option value="5.0">⭐ Apenas Excelentes (5.0)</option>
                </select>
              </div>

              {/* Availability */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Disponibilidade</label>
                <select
                  value={supportFilterAvailability}
                  onChange={(e) => setSupportFilterAvailability(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-150 p-2.5 rounded-xl text-xs text-[#0B1F33] font-bold focus:outline-hidden"
                >
                  <option value="All">🟢 Todos os Estados</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Ocupado">Ocupado / Em Atendimento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Direct Contracting Grid */}
          <div className="space-y-4">
            <h4 className="font-bold text-base text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#0fb0a3]" />
              Profissionais Disponíveis ({
                supportProfessionals.filter(p => {
                  const matchCategory = supportFilterCategory === 'All' || p.category === supportFilterCategory;
                  const matchCity = supportFilterCity === 'All' || p.region.toLowerCase().includes(supportFilterCity.toLowerCase());
                  const matchRating = p.rating >= supportFilterRating;
                  const matchAvailability = supportFilterAvailability === 'All' || p.status === supportFilterAvailability;
                  return matchCategory && matchCity && matchRating && matchAvailability;
                }).length
              })
            </h4>

            {supportProfessionals.filter(p => {
              const matchCategory = supportFilterCategory === 'All' || p.category === supportFilterCategory;
              const matchCity = supportFilterCity === 'All' || p.region.toLowerCase().includes(supportFilterCity.toLowerCase());
              const matchRating = p.rating >= supportFilterRating;
              const matchAvailability = supportFilterAvailability === 'All' || p.status === supportFilterAvailability;
              return matchCategory && matchCity && matchRating && matchAvailability;
            }).length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200">
                <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-sm text-gray-500">Nenhum profissional encontrado com os filtros atuais.</p>
                <p className="text-xs text-slate-400 mt-1">Tente expandir suas seleções para buscar outros técnicos parceiros.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportProfessionals.filter(p => {
                  const matchCategory = supportFilterCategory === 'All' || p.category === supportFilterCategory;
                  const matchCity = supportFilterCity === 'All' || p.region.toLowerCase().includes(supportFilterCity.toLowerCase());
                  const matchRating = p.rating >= supportFilterRating;
                  const matchAvailability = supportFilterAvailability === 'All' || p.status === supportFilterAvailability;
                  return matchCategory && matchCity && matchRating && matchAvailability;
                }).map((prov) => (
                  <div 
                    key={prov.id}
                    className="bg-white border border-gray-100 hover:border-blue-200 hover:scale-101 duration-200 transition-all rounded-3xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row with photo, status */}
                      <div className="flex justify-between items-start gap-2 border-b pb-3 border-slate-100 mb-3">
                        <div className="flex items-center gap-2.5">
                          {prov.photoUrl ? (
                            <img 
                              src={prov.photoUrl} 
                              alt={prov.name} 
                              className="w-11 h-11 rounded-xl object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm uppercase ${prov.logoColor || 'bg-blue-50 text-blue-600'}`}>
                              {prov.name.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-[#0B1F33] truncate max-w-[130px]">{prov.name}</h4>
                            <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded block w-max mt-0.5">
                              {prov.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${prov.status === 'Disponível' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${prov.status === 'Disponível' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            {prov.status || 'Disponível'}
                          </span>
                          
                          <div className="flex items-center gap-1 font-bold text-[10px] text-amber-500 bg-amber-50 px-1 py-0.5 rounded w-max">
                            <span>★</span>
                            <span>{prov.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                        <p className="flex items-center gap-1.5 text-gray-700 font-medium font-sans">
                          <MapPin className="w-3.5 h-3.5 text-[#0A66FF] shrink-0" />
                          <span>{prov.region}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-sans leading-relaxed text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{prov.availability}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px] font-bold">
                          <span>💰</span> Estimado: {prov.estimatedPriceRange || 'Sob cotação'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-sans italic mt-1 bg-slate-50 p-1.5 rounded">
                          Tempo na plataforma: {prov.joinedDate || 'Recém-chegado'}
                        </p>
                      </div>
                    </div>

                    {/* Footer buttons row */}
                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2.5">
                      <span className="text-[10px] text-gray-400 font-mono italic shrink-0">
                        {prov.completedJobs || 0} reparos concluídos
                      </span>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedSupportProfForView(prov)}
                          className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-[#0B1F33] text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all"
                        >
                          Ver Perfil
                        </button>
                        <button
                          onClick={() => {
                            setHiringProf(prov);
                            setWizSupportPropertyId(properties[0]?.id || '');
                            setWizSupportDescription('');
                            setWizSupportDate('');
                            setWizSupportTime('09:00');
                            setWizSupportNotes('');
                          }}
                          className={`cursor-pointer text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-3xs ${prov.status === 'Disponível' ? 'bg-[#0A66FF] hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed opacity-80'}`}
                        >
                          Contratar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User's Support Request List section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-bold text-base text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5 border-b pb-3 border-gray-100">
              📋 Seus Chamados de Assistência Técnica
            </h4>

            {supportJobs.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">
                Você ainda não disparou nenhuma solicitação de emergência técnica. Quando precisar de reparos, use os botões "Contratar" acima!
              </p>
            ) : (
              <div className="space-y-4">
                {supportJobs.map(job => {
                  const prov = supportProfessionals.find(p => p.id === job.professionalId);
                  return (
                    <div key={job.id} className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                              {job.category}
                            </span>
                            <span className="text-xs text-gray-400 font-bold font-mono">Chamado #{job.id}</span>
                          </div>
                          <h5 className="font-bold text-sm text-[#0B1F33] mt-1.5">
                            Profissional técnico: <span className="text-[#0A66FF]">{prov ? prov.name : 'Técnico'}</span>
                          </h5>
                          <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                            <span>📅 Data desejada: <strong>{job.date}</strong> às <strong>{job.time || '09:00'}</strong> • Imóvel: <strong>{properties.find(p => p.id === job.propertyId)?.name || 'Airbnb'}</strong></span>
                            {job.quotedValue > 0 && (
                              <span className="bg-emerald-50 text-emerald-705 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                💰 Valor: R$ {job.quotedValue.toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg ${
                            job.status === 'Pendente' || job.status === 'Solicitado' ? 'bg-amber-100 text-amber-850' :
                            job.status === 'Aceito' ? 'bg-emerald-100 text-emerald-850' :
                            job.status === 'Concluído' ? 'bg-blue-100 text-[#0A66FF]' :
                            job.status === 'Cancelado' ? 'bg-red-100 text-red-850' :
                            'bg-indigo-100 text-indigo-850'
                          }`}>
                            ⚡ Status: {job.status}
                          </span>

                          <div className="flex gap-1.5">
                            {/* Cancellation for pending */}
                            {(job.status === 'Pendente' || job.status === 'Solicitado') && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Tem certeza de que deseja cancelar esta chamada de serviço?')) {
                                    onUpdateSupportJob?.(job.id, { status: 'Cancelado' });
                                    alert('Chamado cancelado com sucesso!');
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold text-red-650 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            )}

                            {/* View detailed quotation and APPROVE / RECUSAR */}
                            {job.status === 'Orçado' && job.quotedValue > 0 && (
                              <div className="flex flex-col sm:flex-row items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-slate-200 shadow-3xs">
                                <span className="font-mono text-xs font-black text-slate-800">R$ {job.quotedValue.toFixed(2)}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      onUpdateSupportJob?.(job.id, { status: 'Aceito' });
                                      alert('Orçamento aprovado com sucesso! O prestador foi notificado e iniciará o chamado.');
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span>✔️</span> Aprovar
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Tem certeza de que deseja recusar este orçamento? O status retornará para Solicitado para nova cotação.')) {
                                        onUpdateSupportJob?.(job.id, { status: 'Solicitado', quotedValue: 0 });
                                        alert('Orçamento recusado. O profissional foi sinalizado para rever a proposta.');
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span>✖️</span> Recusar
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Complete job if Accepted */}
                            {job.status === 'Aceito' && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-bold px-2.5 py-1 rounded-lg animate-pulse inline-flex items-center gap-1">
                                ⏳ Aguardando Pagamento Pix
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Job Description card inner */}
                      <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-slate-105 mt-2.5 font-sans leading-relaxed">
                        🚧 <strong>Problema relatado:</strong> "{job.description}"
                        {job.notes && <span className="block text-gray-400 mt-1 font-mono text-[10px]">Observações extras: {job.notes}</span>}
                      </p>

                      {/* Pix Payment Drawer */}
                      {job.status === 'Aceito' && (
                        <div className="mt-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3 font-sans">
                          <div className="flex items-center gap-2 border-b border-emerald-100/50 pb-2">
                            <span className="text-xs">💰</span>
                            <h6 className="font-extrabold text-xs text-[#0B1F33]">PAGAMENTO PIX DO PROFISSIONAL PENDENTE</h6>
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Efetue o pagamento de <strong>R$ {job.quotedValue.toFixed(2)}</strong> diretamente ao profissional técnico para liberar a conclusão do chamado.
                          </p>

                          <div className="grid sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-emerald-100/30">
                            <div className="space-y-1 text-xs">
                              <p className="text-gray-400 text-[10px] uppercase font-bold">Chave Pix</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-800 break-all select-all font-mono text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  {prov?.pixKey || 'Chave não cadastrada'}
                                </span>
                                {prov?.pixKey && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(prov.pixKey);
                                      alert('Chave Pix copiada com sucesso!');
                                    }}
                                    className="p-1 text-[#0A66FF] hover:bg-blue-50 rounded transition-colors text-[10px] font-bold cursor-pointer inline-flex items-center gap-0.5"
                                    title="Copiar Chave Pix"
                                  >
                                    📋 Copiar
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className="text-gray-400 text-[10px] uppercase font-bold">Beneficiário / Favorecido</p>
                              <p className="font-semibold text-slate-800">{prov?.pixHolderName || prov?.name || 'Técnico'}</p>
                            </div>

                            <div className="space-y-1 text-xs sm:col-span-2 border-t pt-2 border-slate-100 flex flex-col sm:flex-row justify-between gap-2">
                              <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Banco / Instituição</p>
                                <p className="font-semibold text-slate-800">{prov?.bank || 'Não informado'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Valor do Serviço</p>
                                <p className="font-bold text-slate-900">R$ {job.quotedValue.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Interactive QR Code scan effect simulation */}
                          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-emerald-100/30">
                            {/* QR Code Graphic container */}
                            <div className="relative w-20 h-20 bg-slate-50 border rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                              <div className="absolute inset-x-2 h-[1px] bg-emerald-500 animate-[bounce_2s_infinite]"></div>
                              {/* Simple grid lines simulating a QR code pattern */}
                              <div className="grid grid-cols-4 gap-1 w-full h-full opacity-60">
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-300 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-300 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-300 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-300 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-300 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                                <div className="bg-slate-800 rounded-sm"></div>
                              </div>
                              <span className="absolute text-[8px] bg-white text-[#0B1F33] font-black uppercase px-1 rounded border shadow-3xs">PIX</span>
                            </div>

                            <div className="flex-1 font-sans space-y-1.5 text-center sm:text-left">
                              <p className="text-xs font-bold text-slate-800">Copia e Cola Pix Automático</p>
                              <p className="text-[10px] text-gray-400">Use no seu aplicativo bancário na opção Pix Copia e Cola.</p>
                              <button
                                onClick={() => {
                                  const mockPixCode = `00020101021126360014br.gov.bcb.pix0114${prov?.pixKey || 'cleanhost'}5204000053039865405${job.quotedValue.toFixed(2)}5802BR5915CleanHostPay6009SAO%20PAULO62070503***6304`;
                                  navigator.clipboard.writeText(mockPixCode);
                                  alert('Código Copia e Cola Pix copiado com sucesso! Agora abra o app de seu banco e pague.');
                                }}
                                className="bg-[#0A66FF] hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shadow-3xs"
                              >
                                📋 Copiar Código Copia e Cola Pix
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                onUpdateSupportJob?.(job.id, { status: 'Concluído' });
                                alert('Pagamento Pix confirmado! Status do sinistro atualizado para CONCLUÍDO.');
                              }}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <span>✔️</span> Confirmar Pagamento Realizado (Pix Pago)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Evaluation/Rating block once Concluído */}
                      {job.status === 'Concluído' && (
                        !job.review ? (
                          <div className="mt-3 bg-amber-50/40 border border-amber-100 rounded-2xl p-4 space-y-3 font-sans">
                            <div className="flex items-center gap-2 border-b border-amber-150 pb-2">
                              <span className="text-sm">⭐</span>
                              <h6 className="font-extrabold text-xs text-[#0B1F33]">AVALIE O TRABALHO DO PROFISSIONAL</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              O reparo foi finalizado! Avalie o serviço do prestador técnico <strong>{prov?.name || 'Técnico'}</strong> para ajudá-lo a melhorar sua reputação e pontuação na plataforma CleanHost.
                            </p>

                            <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-100 shadow-3xs">
                              {/* Rating Stars Selector */}
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sua Nota de Avaliação</p>
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setSupportRatings(prev => ({ ...prev, [job.id]: star }))}
                                      className="cursor-pointer focus:outline-hidden transition-transform hover:scale-125"
                                      title={`${star} Estrelas`}
                                    >
                                      <Star 
                                        className={`w-6 h-6 ${
                                          star <= (supportRatings[job.id] ?? 5) 
                                            ? 'fill-amber-400 text-amber-400' 
                                            : 'text-slate-200'
                                        }`} 
                                      />
                                    </button>
                                  ))}
                                  <span className="text-xs font-black text-slate-500 ml-1.5 font-mono">
                                    {(supportRatings[job.id] ?? 5)} / 5
                                  </span>
                                </div>
                              </div>

                              {/* Comment Field */}
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mensagem / Depoimento Técnico</p>
                                <textarea
                                  value={supportComments[job.id] || ''}
                                  onChange={(e) => setSupportComments(prev => ({ ...prev, [job.id]: e.target.value }))}
                                  placeholder="Descreva brevemente como foi o atendimento do profissional, agilidade, pontualidade..."
                                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A66FF]/20 focus:border-[#0A66FF] focus:outline-hidden min-h-[60px]"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleRateSupportProfessional(job.id, job.professionalId)}
                                  className="w-full sm:w-auto bg-[#0A66FF] hover:bg-blue-600 text-white font-extrabold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  ⭐ Enviar Avaliação do Técnico
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 bg-blue-50/25 border border-blue-100/50 rounded-2xl p-4 space-y-2.5 font-sans">
                            <div className="flex items-center justify-between border-b border-blue-100/20 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs">⭐</span>
                                <h6 className="font-extrabold text-xs text-blue-950 uppercase">SUA AVALIAÇÃO DO PRESTADOR</h6>
                              </div>
                              <span className="text-[10px] text-gray-400 font-semibold font-mono">{job.review.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= job.review.rating 
                                      ? 'fill-amber-400 text-amber-400' 
                                      : 'text-slate-200'
                                  }`} 
                                />
                              ))}
                              <span className="text-xs font-black text-slate-700 ml-1.5">{job.review.rating}/5 Estrelas</span>
                            </div>
                            <p className="text-xs text-slate-650 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                              "{job.review.comment}"
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* PIX PAYMENT SCREEN MODAL */}
      {payingRequestId && (() => {
        const req = requests.find(r => r.id === payingRequestId);
        if (!req) return null;

        const isLoyalty = req.appFee === req.price * 0.05;
        const ratePct = isLoyalty ? 5 : 12;
        const pixPayload = `00020101021126360014br.gov.bcb.pix0114${financeSettings.pixKey || '28284920875'}5204000053039865405${req.price.toFixed(2)}5802BR5912CleanHost%20IP6009Sao%2520Paulo62070503***6304`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs font-sans animate-fade-in" id="pix-payment-screen-modal">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col justify-between">
              
              {/* Header */}
              <div className="bg-[#0B1F33] text-white p-5 relative">
                <button 
                  onClick={() => setPayingRequestId(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#12D6C5]">Plataforma Intermediadora</span>
                <h3 className="text-base font-black tracking-tight mt-1">Checkout de Pagamento Garantido Pix</h3>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                
                {/* Financial Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs text-[#0B1F33] space-y-2 font-medium">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Imóvel / Referência:</span>
                    <span className="font-bold text-slate-800">{req.propertyName}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Profissional Selecionada:</span>
                    <span className="font-bold text-slate-800">{req.professionalName || 'Parceira'}</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2"></div>
                  
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Valor do Serviço (Cleaner):</span>
                    <span className="font-mono font-bold">R$ {req.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600">
                    <span>Taxa CleanHost Retida ({ratePct}%):</span>
                    <span className="font-mono font-bold">- R$ {req.appFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-slate-200 my-2 pt-2"></div>
                  <div className="flex justify-between items-center text-[#0B1F33] font-black">
                    <span className="text-sm">Total Garantia Pix a Depositar:</span>
                    <span className="font-mono text-base text-emerald-600">R$ {req.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* QR CODE PATTERN MOCKUP */}
                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                    {/* Generates a stylized mock visual representation of QR matrix */}
                    <div className="w-40 h-40 bg-slate-50 flex flex-wrap p-1 gap-1 justify-center items-center content-center rounded-lg">
                      <div className="w-12 h-12 border-4 border-slate-900 m-1 bg-white flex justify-center items-center font-bold text-[8px]">Clean</div>
                      <div className="w-10 h-10 bg-slate-900 rounded-sm"></div>
                      <div className="w-12 h-12 bg-slate-900 rounded-sm"></div>
                      <div className="w-10 h-10 border-4 border-slate-900 bg-white"></div>
                      <div className="w-16 h-8 bg-slate-900 rounded-sm"></div>
                      <div className="w-8 h-10 bg-slate-900 rounded-sm"></div>
                      <div className="w-12 h-12 border-4 border-[#12D6C5] rounded bg-white flex justify-center items-center text-[8px] font-black text-[#0B1F33]">PIX</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans text-center">Escaneie o QR Code acima pelo app de seu banco</p>
                </div>

                {/* Copy paste button */}
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Ou use o Pix Copia e Cola</span>
                  <div className="flex gap-1.5 items-center bg-slate-55 bg-slate-100 p-2 rounded-xl border">
                    <span className="text-[9px] text-slate-500 truncate text-left font-mono font-medium flex-1">{pixPayload}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pixPayload);
                        alert('Código Pix Copia e Cola copiado para sua área de transferência com sucesso!');
                      }}
                      className="px-2.5 py-1.5 bg-[#4338CA] hover:bg-opacity-95 text-white font-bold text-[9px] uppercase rounded-lg cursor-pointer shrink-0"
                    >
                      Copiar Código
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Conta destino: <span className="text-slate-600 font-bold">{financeSettings.recipientAccount || 'CleanHost Holds S.A.'}</span> • Pix: <span className="font-mono text-slate-600 font-bold">{financeSettings.pixKey || '28284920875'}</span></p>
                </div>

                {/* Prompt instructions warning */}
                <div className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] p-3 rounded-xl leading-relaxed font-bold">
                  ⚠️ Após realizar o pagamento no app de seu banco, clique no botão azul abaixo <strong>&quot;Já realizei o pagamento&quot;</strong> para enviar a liberação ao administrativo de repasses da CleanHost.
                </div>

              </div>

              {/* Footer Confirmation Actions */}
              <div className="bg-slate-50 p-4 border-t flex gap-2">
                <button
                  onClick={() => setPayingRequestId(null)}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    onUpdateRequest(req.id, { 
                      financialStatus: 'PAGAMENTO INFORMADO'
                    });
                    setPayingRequestId(null);
                    alert('Comprovante enviado! Aguarde enquanto nossa equipe de controle confere a compensação do Pix. O profissional será notificado imediatamente para início.');
                  }}
                  className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1 uppercase"
                >
                  <CheckCircle className="w-4 h-4" /> Já realizei o pagamento
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* VER PERFIL MODAL DE REDE DE APOIO */}
      {selectedSupportProfForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5 text-left">
            <button
              onClick={() => setSelectedSupportProfForView(null)}
              className="absolute right-4 top-4 text-gray-405 hover:text-gray-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-150">
              {selectedSupportProfForView.photoUrl ? (
                <img 
                  src={selectedSupportProfForView.photoUrl} 
                  alt={selectedSupportProfForView.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0A66FF]/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl uppercase ${selectedSupportProfForView.logoColor || 'bg-blue-50 text-blue-600'}`}>
                  {selectedSupportProfForView.name.substring(0, 2)}
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-[#12D6C5] bg-[#0B1F33] px-2.5 py-0.5 rounded uppercase font-mono">
                  {selectedSupportProfForView.category} Homologado
                </span>
                <h3 className="font-bold text-lg text-[#0B1F33] mt-1">{selectedSupportProfForView.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Região de Atendimento: {selectedSupportProfForView.region}
                </p>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-1.5 bg-slate-55 bg-slate-50 p-4 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block font-sans">Sobre o Profissional / Biografia</span>
              <p className="text-xs text-slate-705 leading-relaxed font-sans font-medium">
                {selectedSupportProfForView.biography || 'Profissional técnico experiente homologado para atuar na plataforma da CleanHost garantindo rapidez e qualidade de manutenção.'}
              </p>
            </div>

            {/* Platform Stats info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 text-center">
                <span className="text-gray-400 text-[9px] block font-bold uppercase tracking-wider">Histórico de Reparos</span>
                <span className="text-emerald-700 text-base font-mono font-black mt-1 block">
                  {selectedSupportProfForView.completedJobs || 0} concluídos
                </span>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 text-center">
                <span className="text-gray-400 text-[9px] block font-bold uppercase tracking-wider">Avaliação Média</span>
                <span className="text-amber-800 text-base font-mono font-black mt-1 block flex items-center justify-center gap-1">
                  ★ {selectedSupportProfForView.rating || '4.8'}
                </span>
              </div>
            </div>

            {/* Dynamic review ratings list */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block font-sans">Depoimentos e Avaliações de Anfitriões</span>
              {selectedSupportProfForView.reviews && selectedSupportProfForView.reviews.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedSupportProfForView.reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 border border-gray-100 p-2.5 rounded-xl space-y-1 text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-[#0B1F33]">{rev.raterName}</span>
                        <span className="text-amber-500 font-mono text-[9px]">★ {rev.rating}/5</span>
                      </div>
                      <p className="text-[11px] text-gray-500 italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">Nenhum depoimento detalhado indexado no momento.</p>
              )}
            </div>

            {/* Joined time info */}
            <p className="text-[10px] text-gray-400 font-sans italic text-center mt-2">
              Ingressou na CleanHost em: {selectedSupportProfForView.joinedDate || 'Fevereiro de 2024'}
            </p>

            {/* Quick hire action from profile */}
            <button
              onClick={() => {
                const tempProf = selectedSupportProfForView;
                setSelectedSupportProfForView(null);
                setHiringProf(tempProf);
                setWizSupportPropertyId(properties[0]?.id || '');
                setWizSupportDescription('');
                setWizSupportDate('');
                setWizSupportTime('09:00');
                setWizSupportNotes('');
              }}
              className="w-full py-3 bg-[#0A66FF] hover:bg-blue-600 text-white text-xs font-black rounded-xl cursor-pointer uppercase transition-all shadow-md mt-2"
            >
              Solicitar Contratação Imediata
            </button>
          </div>
        </div>
      )}

      {/* CONTRATAR MODAL DE REDE DE APOIO */}
      {hiringProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-left">
            <button
              onClick={() => setHiringProf(null)}
              className="absolute right-4 top-4 text-gray-405 hover:text-gray-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-blue-50 text-[#0A66FF] rounded">
                Formulário de Contratação Direta
              </span>
              <h3 className="font-bold text-lg text-[#0B1F33] mt-2">🔨 Contratar {hiringProf.name}</h3>
              <p className="text-xs text-gray-500">
                Especialista indicado: <strong>{hiringProf.category}</strong> • Cidade: <strong>{hiringProf.region}</strong>
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!wizSupportPropertyId || !wizSupportDescription || !wizSupportDate) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }

                const newJob: SupportJob = {
                  id: `job-${Date.now()}`,
                  professionalId: hiringProf.id,
                  hostId: loggedInUser?.id || 'host-current',
                  category: hiringProf.category,
                  propertyId: wizSupportPropertyId,
                  description: wizSupportDescription,
                  quotedValue: 0, // Pending commercial quote
                  status: 'Solicitado', // To trigger bid flow inside platform
                  date: wizSupportDate,
                  time: wizSupportTime,
                  notes: wizSupportNotes
                };

                onAddSupportJob?.(newJob);
                setHiringProf(null);
                alert(`Solicitação enviada com sucesso para ${hiringProf.name}! O técnico analisará o chamado e responderá de imediato com um orçamento de reparo.`);
              }}
              className="space-y-4 pt-2"
            >
              {/* Select Property */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-650 block">Escolha seu Imóvel *</label>
                <select
                  value={wizSupportPropertyId}
                  onChange={(e) => setWizSupportPropertyId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-150 p-2.5 rounded-xl text-xs text-[#0B1F33] font-bold outline-hidden"
                  required
                >
                  <option value="">Selecione um imóvel...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>

              {/* Service Desired / Problem Description */}
              <div className="space-y-1 font-sans">
                <label className="text-[11px] font-bold text-gray-650 block">Descrição detalhada do problema técnico *</label>
                <textarea
                  placeholder="Ex: Disjuntores desarmam sempre que liga o ar-condicionado da suíte master. Ou: pia de cozinha entupida vazando no armário inferior."
                  value={wizSupportDescription}
                  onChange={(e) => setWizSupportDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl outline-hidden h-24 resize-none font-sans"
                  required
                />
              </div>

              {/* Date & Time picking row */}
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-650 block font-sans">Data desejada *</label>
                  <input
                    type="date"
                    value={wizSupportDate}
                    onChange={(e) => setWizSupportDate(e.target.value)}
                    className="w-full bg-slate-50 border p-2 text-xs text-[#0B1F33] font-bold rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-650 block font-sans">Horário desejado</label>
                  <input
                    type="time"
                    value={wizSupportTime}
                    onChange={(e) => setWizSupportTime(e.target.value)}
                    className="w-full bg-slate-50 border p-2 text-xs text-[#0B1F33] font-bold rounded-xl"
                  />
                </div>
              </div>

              {/* Extras Observations */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-650 block font-sans">Observações adicionais e recomendações de acesso</label>
                <textarea
                  placeholder="Ex: Deixarei a chave no cofre numérico na porta da frente. O código de acesso é 4920."
                  value={wizSupportNotes}
                  onChange={(e) => setWizSupportNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl outline-hidden h-16 resize-none font-sans"
                />
              </div>

              {/* Extra warnings info */}
              <p className="text-[9px] text-[#0fb0a3] bg-teal-50 p-2.5 rounded-lg leading-relaxed font-semibold">
                🔒 <strong>Intermediação Garantida:</strong> A contratação pela plataforma oferece garantia total CleanHost contra avarias adicionais, suporte 24h e emissão automatizada de recibos estruturais.
              </p>

              {/* Action buttons list */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setHiringProf(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#0A66FF] hover:bg-blue-600 font-extrabold text-xs text-white rounded-xl transition-all shadow-3xs cursor-pointer text-center"
                >
                  Confirmar Solicitacão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
