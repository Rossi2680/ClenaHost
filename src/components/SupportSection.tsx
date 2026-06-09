import React, { useState, useEffect } from 'react';
import { 
  Hammer, Wrench, Key, Sparkles, Star, MapPin, CheckCircle, Plus, 
  Trash2, Phone, AlertTriangle, FileText, DollarSign, Clock, Check, X, ShieldAlert,
  User, Save, Upload
} from 'lucide-react';
import { SupportProfessional, SupportJob, Property, SupportNotification } from '../types';

interface SupportSectionProps {
  properties: Property[];
  supportProfessionals: SupportProfessional[];
  supportJobs: SupportJob[];
  onAddSupportJob: (job: SupportJob) => void;
  onUpdateSupportJob: (jobId: string, updates: Partial<SupportJob>) => void;
  onAddSupportProfessional: (prof: SupportProfessional) => void;
  onUpdateSupportProfessionalInfo?: (profId: string, updates: Partial<SupportProfessional>) => void;
  financeSettings?: any;
  activeRole: 'HOST' | 'CLEANER' | 'ADMIN' | 'SUPPORT';
  loggedInUser?: any;
  supportNotifications?: SupportNotification[];
  onUpdateSupportNotifications?: React.Dispatch<React.SetStateAction<SupportNotification[]>>;
}

export default function SupportSection({
  properties,
  supportProfessionals,
  supportJobs,
  onAddSupportJob,
  onUpdateSupportJob,
  onAddSupportProfessional,
  onUpdateSupportProfessionalInfo,
  financeSettings,
  activeRole,
  loggedInUser,
  supportNotifications = [],
  onUpdateSupportNotifications
}: SupportSectionProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'my-orders' | 'register-provider' | 'profile' | 'notifications'>(
    activeRole === 'SUPPORT' ? 'profile' : 'directory'
  );
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedProfIdForRequest, setSelectedProfIdForRequest] = useState<string | null>(null);

  // New Provider Register State
  const [newProvName, setNewProvName] = useState('');
  const [newProvCat, setNewProvCat] = useState<'Eletricista' | 'Encanador' | 'Chaveiro' | 'Pedreiro' | 'Pintor' | 'Manutenção Geral'>('Manutenção Geral');
  const [newProvPhone, setNewProvPhone] = useState('');
  const [newProvRegion, setNewProvRegion] = useState('');
  const [newProvPix, setNewProvPix] = useState('');
  const [newProvBank, setNewProvBank] = useState('');
  const [newProvPriceRange, setNewProvPriceRange] = useState('R$ 100 - R$ 250');

  // Submit Quote State for Tech role
  const [quotePrices, setQuotePrices] = useState<Record<string, number>>({});
  const [activeSupId, setActiveSupId] = useState<string>('');

  // Meu Cadastro (Profile Edit) State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCategory, setProfileCategory] = useState<'Eletricista' | 'Encanador' | 'Chaveiro' | 'Pedreiro' | 'Pintor' | 'Manutenção Geral'>('Manutenção Geral');
  const [profileSpecialties, setProfileSpecialties] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileExperience, setProfileExperience] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profilePix, setProfilePix] = useState('');
  const [profilePixHolder, setProfilePixHolder] = useState('');
  const [profileBank, setProfileBank] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Notification preferences states
  const [prefPlatform, setPrefPlatform] = useState(true);
  const [prefWhatsapp, setPrefWhatsapp] = useState(true);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSms, setPrefSms] = useState(false);

  // Editing budget state
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [tempQuotePrice, setTempQuotePrice] = useState<string>('');

  // Find My Profile in supportProfessionals list
  const myProfileId = loggedInUser?.id;
  const myProfile = supportProfessionals.find(p => p.id === myProfileId);

  // Filter notifications for current professional
  const myNotifications = activeRole === 'SUPPORT' && myProfileId
    ? supportNotifications.filter(n => n.professionalId === myProfileId)
    : supportNotifications;

  const unreadCount = myNotifications.filter(n => !n.read).length;

  useEffect(() => {
    if (activeTab === 'profile' && myProfile) {
      setProfileName(myProfile.name || '');
      setProfilePhone(myProfile.phone || '');
      setProfileWhatsapp(myProfile.whatsapp || '');
      setProfileEmail(myProfile.email || loggedInUser?.email || '');
      setProfileCategory(myProfile.category || 'Manutenção Geral');
      setProfileSpecialties(myProfile.specialties || '');
      setProfileBio(myProfile.biography || '');
      setProfileExperience(myProfile.yearsOfExperience?.toString() || '');
      setProfileCity(myProfile.city || '');
      setProfileState(myProfile.state || '');
      setProfilePhoto(myProfile.photoUrl || '');
      setProfilePix(myProfile.pixKey || '');
      setProfilePixHolder(myProfile.pixHolderName || myProfile.name || '');
      setProfileBank(myProfile.bank || '');
      
      // Load preferences with default fallback values
      setPrefPlatform(myProfile.notificationPrefs?.platform !== false);
      setPrefWhatsapp(myProfile.notificationPrefs?.whatsapp !== false);
      setPrefEmail(myProfile.notificationPrefs?.email !== false);
      setPrefSms(myProfile.notificationPrefs?.sms === true);

      setProfileMsg('');
      setProfileError('');
    }
  }, [activeTab, myProfile, loggedInUser]);

  const initializeProfileForm = () => {
    if (!myProfile) return;
    setProfileName(myProfile.name || '');
    setProfilePhone(myProfile.phone || '');
    setProfileWhatsapp(myProfile.whatsapp || '');
    setProfileEmail(myProfile.email || loggedInUser?.email || '');
    setProfileCategory(myProfile.category || 'Manutenção Geral');
    setProfileSpecialties(myProfile.specialties || '');
    setProfileBio(myProfile.biography || '');
    setProfileExperience(myProfile.yearsOfExperience?.toString() || '');
    setProfileCity(myProfile.city || '');
    setProfileState(myProfile.state || '');
    setProfilePhoto(myProfile.photoUrl || '');
    setProfilePix(myProfile.pixKey || '');
    setProfilePixHolder(myProfile.pixHolderName || myProfile.name || '');
    setProfileBank(myProfile.bank || '');

    setPrefPlatform(myProfile.notificationPrefs?.platform !== false);
    setPrefWhatsapp(myProfile.notificationPrefs?.whatsapp !== false);
    setPrefEmail(myProfile.notificationPrefs?.email !== false);
    setPrefSms(myProfile.notificationPrefs?.sms === true);

    setProfileMsg('');
    setProfileError('');
  };

  const handleProfilePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Compress using canvas to avoid massive payload size issues
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height = Math.round((height * max_size) / width);
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width = Math.round((width * max_size) / height);
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
            setProfilePhoto(compressedUrl);
            setProfileError('');
          } else {
            setProfilePhoto(event.target?.result as string);
            setProfileError('');
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser || !onUpdateSupportProfessionalInfo) return;

    if (activeRole !== 'SUPPORT' && loggedInUser?.role !== 'ADMIN') {
      setProfileError('Acesso negado. Apenas o próprio profissional ou o administrador podem editar este cadastro.');
      return;
    }

    if (!profileName.trim()) {
      setProfileError('O nome do profissional é obrigatório.');
      return;
    }
    if (!profilePhone.trim()) {
      setProfileError('O telefone de contato é obrigatório.');
      return;
    }

    const updatedFields: Partial<SupportProfessional> = {
      name: profileName,
      phone: profilePhone,
      whatsapp: profileWhatsapp,
      email: profileEmail,
      category: profileCategory,
      specialties: profileSpecialties,
      biography: profileBio,
      yearsOfExperience: profileExperience ? parseInt(profileExperience, 10) : undefined,
      city: profileCity,
      state: profileState,
      region: profileCity && profileState ? `${profileCity} - ${profileState}` : (profileCity || profileState || ''),
      photoUrl: profilePhoto,
      pixKey: profilePix,
      pixHolderName: profilePixHolder,
      bank: profileBank,
      notificationPrefs: {
        platform: prefPlatform,
        whatsapp: prefWhatsapp,
        email: prefEmail,
        sms: prefSms
      }
    };

    onUpdateSupportProfessionalInfo(loggedInUser.id, updatedFields);
    setProfileError('');
    setProfileMsg('✅ Cadastro atualizado com sucesso.');

    setTimeout(() => {
      setProfileMsg('');
    }, 4500);
  };

  const handleCreateRequest = (prof: SupportProfessional) => {
    if (properties.length === 0) {
      alert('Cadastre um imóvel primeiro na aba Meu Imóvel do Anfitrião!');
      return;
    }
    setSelectedProfIdForRequest(prof.id);
    setSelectedCategory(prof.category);
    setSelectedPropId(properties[0].id);
    setDescription('');
  };

  const handleConfirmRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !selectedPropId) return;

    const chosenProf = supportProfessionals.find(p => p.id === selectedProfIdForRequest)!;
    
    const newJob: SupportJob = {
      id: `SUP-JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      professionalId: chosenProf.id,
      hostId: 'host-1',
      category: chosenProf.category,
      propertyId: selectedPropId,
      description: description,
      quotedValue: 0, // initially zero, pending quote from technician
      status: 'Solicitado',
      date: new Date().toISOString()
    };

    onAddSupportJob(newJob);
    alert(`Solicitação de reparo emergencial enviada para ${chosenProf.name}! O profissional avaliará o escopo para fechar o valor.`);
    setSelectedProfIdForRequest(null);
    setActiveTab('my-orders');
  };

  const handleRegisterProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName || !newProvPhone || !newProvRegion || !newProvPix || !newProvBank) {
      alert('Por favor, preencha todos os campos do cadastro profissional, incluindo dados bancários.');
      return;
    }

    const newProv: SupportProfessional = {
      id: `sup-${Date.now()}`,
      name: newProvName,
      category: newProvCat,
      phone: newProvPhone,
      region: newProvRegion,
      availability: 'Segunda a Sábado, Flexível',
      rating: 5.0,
      completedJobs: 0,
      pixKey: newProvPix,
      bank: newProvBank,
      estimatedPriceRange: newProvPriceRange,
      logoColor: 'bg-[#12D6C5]/10 text-[#0b1f33]'
    };

    onAddSupportProfessional(newProv);
    alert(`Cadastro na Rede de Apoio realizado com sucesso! Os anfitriões do CleanHost agora podem encontrar você para chamados.`);
    setNewProvName('');
    setNewProvPhone('');
    setNewProvRegion('');
    setNewProvPix('');
    setNewProvBank('');
    setActiveTab('directory');
  };

  // Provide bid / Quote for an order
  const handleSubmitQuote = (jobId: string) => {
    const value = quotePrices[jobId];
    if (!value || value <= 0) {
      alert('Defina um valor válido para o orçamento.');
      return;
    }

    onUpdateSupportJob(jobId, {
      quotedValue: value,
      status: 'Orçado'
    });
    alert(`Orçamento de R$ ${value.toFixed(2)} informado com sucesso. O anfitrião receberá a notificação para aprovar o fechamento.`);
  };

  const handleUpdateQuoteValue = (jobId: string) => {
    const value = Number(tempQuotePrice);
    if (isNaN(value) || value <= 0) {
      alert('Defina um valor válido para o orçamento.');
      return;
    }

    onUpdateSupportJob(jobId, {
      quotedValue: value
    });
    alert(`Orçamento atualizado para R$ ${value.toFixed(2)} com sucesso.`);
    setEditingJobId(null);
  };

  const handleAcceptQuote = (job: SupportJob) => {
    onUpdateSupportJob(job.id, {
      status: 'Aceito'
    });
    alert('Orçamento aceito! O profissional foi notificado e pode prosseguir para solucionar o sinistro.');
  };

  const handleRejectQuote = (job: SupportJob) => {
    if (window.confirm('Tem certeza de que deseja recusar este orçamento? O status retornará para Solicitado para que o prestador possa enviar nova cotação.')) {
      onUpdateSupportJob(job.id, {
        status: 'Solicitado',
        quotedValue: 0
      });
      alert('Orçamento recusado. O profissional foi notificado para rever a proposta.');
    }
  };

  const handleCompleteJob = (job: SupportJob, prov: SupportProfessional) => {
    const completedCycle = prov ? prov.completedJobs % 11 : 0;
    const isZeroTax = completedCycle === 10;
    const promoFee = financeSettings?.supportFee ?? 3;
    const rate = isZeroTax ? 0 : (promoFee / 100);
    const appFee = job.quotedValue * rate;
    const netValue = job.quotedValue - appFee;

    onUpdateSupportJob(job.id, {
      status: 'Concluído',
      appFee,
      netValue
    });

    if (prov && onUpdateSupportProfessionalInfo) {
      onUpdateSupportProfessionalInfo(prov.id, {
        completedJobs: prov.completedJobs + 1
      });
    }

    if (isZeroTax) {
      alert(`Operação encerrada no aplicativo! A CleanHost registrou o serviço. Benefício Fidelidade Concedido: intermediação com taxa ZERO (0%)! Valor total de R$ ${job.quotedValue.toFixed(2)} transferido integralmente para o parceiro.`);
    } else {
      alert(`Operação encerrada no aplicativo! A CleanHost registrou o serviço. Taxa promocional de intermediação de ${promoFee}% retida: R$ ${appFee.toFixed(2)}. Valor repassado: R$ ${netValue.toFixed(2)}.`);
    }
  };

  const getIconForCategory = (cat: string) => {
    switch (cat) {
      case 'Chaveiro':
        return <Key className="w-5 h-5" />;
      case 'Eletricista':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'Encanador':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      default:
        return <Hammer className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">

      {activeRole === 'SUPPORT' && (
        <div className="bg-[#0B1F33] text-white p-6 rounded-3xl relative overflow-hidden shadow-md space-y-4" id="support-loyalty-panel">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/50">
            <div>
              <span className="text-[10px] text-[#12D6C5] font-mono font-bold tracking-widest uppercase block">Simulador - Visão do Prestador</span>
              <h4 className="text-sm font-bold">Programa Fidelidade CleanHost</h4>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-gray-305">Selecionar Prestador:</label>
              <select
                value={activeSupId || (supportProfessionals[0]?.id || '')}
                onChange={(e) => setActiveSupId(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-hidden"
              >
                {supportProfessionals.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const currentSupId = activeSupId || (supportProfessionals[0]?.id || '');
            const activeSup = supportProfessionals.find(p => p.id === currentSupId);
            if (!activeSup) {
              return (
                <p className="text-xs text-slate-400 italic">Cadastre um profissional técnico na aba de cadastro para simular o programa de fidelidade.</p>
              );
            }
            const completedInCycle = activeSup.completedJobs % 11;
            const nextTarget = 10;
            const isEligible = completedInCycle === 10;
            const progressPct = Math.min((completedInCycle / nextTarget) * 100, 100);
            return (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-brand-blue rounded text-[9px] font-bold uppercase tracking-wider text-white">Programa Fidelidade CleanHost</span>
                      <span className="text-[10px] text-[#12D6C5] font-semibold">Tabela de Serviços Emergenciais</span>
                    </div>
                    <h5 className="text-base font-bold mt-1 text-slate-100">Meta: Conclua 10 reparos para liberar a 11ª operação livre de taxas!</h5>
                    <p className="text-[#F4F7FA]/75 text-xs">
                      Sua taxa promocional padrão é de apenas <strong>{financeSettings?.supportFee ?? 3}%</strong>. Ao completar o ciclo de 10 chamados, a 11ª operação de orçamento aprovado terá taxa de intermediação de de crucial <strong>0%</strong>!
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] block text-gray-400">Progresso do Ciclo</span>
                    <span className="text-2xl font-black text-[#12D6C5] font-mono">{completedInCycle} de 10</span>
                    <span className="text-[10px] block text-gray-400">chamados concluídos</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-700/60 rounded-full h-3">
                    <div 
                      className="bg-[#12D6C5] h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono font-bold">
                    <span>Progresso atual: {completedInCycle}/11</span>
                    {isEligible ? (
                      <span className="text-[#12D6C5]">🔥 Sensacional! Seu próximo chamado técnico terá taxa 100% Gratuita!</span>
                    ) : (
                      <span className="text-amber-400">Faltam {10 - completedInCycle} serviços para ganhar uma operação sem taxa.</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Tab controls */}
      <div className="flex bg-white p-1 rounded-3xl shadow-xs border border-blue-50 gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('directory')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeTab === 'directory' ? 'bg-[#0A66FF] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          🔍 Buscar Rede de Apoio
        </button>
        <button
          onClick={() => setActiveTab('my-orders')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all flex items-center gap-1.5 ${activeTab === 'my-orders' ? 'bg-[#0A66FF] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          🛠️ Chamados Ativos
          {supportJobs.filter(j => j.status !== 'Concluído').length > 0 && (
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all flex items-center gap-1.5 ${activeTab === 'notifications' ? 'bg-[#0A66FF] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          🔔 Alertas & Canais
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
        {activeRole === 'SUPPORT' && (
          <button
            onClick={() => setActiveTab('profile')}
            className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-[#0A66FF] text-white' : 'text-gray-555 hover:text-gray-888'}`}
          >
            👤 Meu Cadastro
          </button>
        )}
        {activeRole !== 'SUPPORT' && (
          <button
            onClick={() => setActiveTab('register-provider')}
            className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeTab === 'register-provider' ? 'bg-[#0A66FF] text-white' : 'text-gray-555 hover:text-gray-888'}`}
          >
            ✨ Cadastrar Profissional de Reparo
          </button>
        )}
      </div>

      {/* RENDER VIEW: DIRECTORY SPLIT */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          <div className="bg-[#0B1F33] text-white p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-xl font-bold tracking-tight">O que é a Rede de Apoio CleanHost?</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Tudo o que seu imóvel precisa em um só lugar. Eletricistas, encanadores, pintores e chaveiros disponíveis para resolver imprevistos com rapidez e segurança.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-[11px] text-[#12D6C5] font-mono">
              Taxa de intermediação da Rede de Apoio: 5%.
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportProfessionals.map(prov => (
              <div 
                key={prov.id}
                className="bg-white border border-gray-100 hover:border-blue-200 transition-all rounded-3xl p-5 space-y-4 shadow-3xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      {prov.photoUrl ? (
                        <img 
                          src={prov.photoUrl} 
                          alt={prov.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-blue-50 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`p-2.5 rounded-xl ${prov.logoColor || 'bg-blue-50 text-[#0A66FF]'}`}>
                          {getIconForCategory(prov.category)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-[#0B1F33]">{prov.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-slate-50 px-2 py-0.5 rounded">
                          {prov.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 font-bold text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                      <span>★</span>
                      <span>{prov.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {prov.region}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {prov.availability}
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-[#0B1F33]">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Preço Estimado: {prov.estimatedPriceRange}
                    </p>
                    {prov.yearsOfExperience !== undefined && prov.yearsOfExperience > 0 && (
                      <p className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                        <span>🛡️</span> {prov.yearsOfExperience} {prov.yearsOfExperience === 1 ? 'ano' : 'anos'} de experiência
                      </p>
                    )}
                    {prov.specialties && (
                      <div className="text-[11px] bg-blue-50/60 text-blue-700 p-2 rounded-xl leading-relaxed mt-1">
                        <strong className="text-[9px] uppercase tracking-wider block text-blue-800 font-mono mb-0.5">Especialidades:</strong>
                        {prov.specialties}
                      </div>
                    )}
                    {prov.biography && (
                      <p className="text-[11px] text-gray-400 italic line-clamp-2 leading-relaxed border-l-2 border-slate-200 pl-2 mt-1">
                        "{prov.biography}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-1.5">
                  <span className="text-[10px] text-gray-400 font-mono italic">
                    {prov.completedJobs} reparos concluídos
                  </span>

                  <button
                    onClick={() => handleCreateRequest(prov)}
                    className="cursor-pointer bg-[#0A66FF] hover:bg-blue-600 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-3xs"
                  >
                    Solicitar Chamado
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick inline request wizard popup */}
          {selectedProfIdForRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                  onClick={() => setSelectedProfIdForRequest(null)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <form onSubmit={handleConfirmRequest} className="space-y-4">
                  <h3 className="font-bold text-base text-[#0B1F33] flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Chamado Emergencial de {selectedCategory}
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 block">Selecione o Imóvel com Problema</label>
                    <select
                      value={selectedPropId}
                      onChange={(e) => setSelectedPropId(e.target.value)}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs text-[#0B1F33]"
                      required
                    >
                      <option value="">Selecione...</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 block">Sintoma / Descrição da Manutenção</label>
                    <textarea 
                      placeholder="Ex: Vazamento sob a pia da cozinha molhando a área de serviço."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs p-2.5 border rounded-xl outline-hidden h-24 resize-none"
                      required
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 bg-slate-50 p-3 rounded-lg leading-snug">
                    ℹ️ <strong>Como funciona o pagamento?</strong> O prestador receberá este chamado, analisará as imagens/instruções e proporá um valor final. Após a aprovação do anfitrião, o reparo é executado. A taxa operacional CleanHost é descontada direto no Pix do profissional.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0A66FF] hover:bg-blue-600 font-bold text-xs text-white rounded-xl transition-all cursor-pointer"
                  >
                    Disparar Solicitação para Profissional
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RENDER VIEW: MY SERVICES & ORDERS IN PROGRESS */}
      {activeTab === 'my-orders' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-[#0B1F33]">Histórico de Ocorrências e Reparos Emergenciais</h3>
          
          {unreadCount > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-rose-900">🚨 Novas solicitações de serviço recebidas!</p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Você possui <strong>{unreadCount} solicitação(ões) não lida(s)</strong> enviada(s) pelos clientes. Acesse a aba <strong>Alertas & Canais</strong> para verificar os detalhes imediatamente e acionar os orçamentos.
                </p>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="mt-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  Ver solicitações agora →
                </button>
              </div>
            </div>
          )}
          
          {supportJobs.length === 0 ? (
            <div className="py-8 text-center text-gray-400 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
              <AlertTriangle className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p className="font-medium text-xs">Nenhum chamado gerado.</p>
              <p className="text-[11px] text-gray-400">Quando houver problemas com descarga, chaves perdidas ou lâmpadas queimadas, consulte a Rede de Apoio!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supportJobs.map(job => {
                const prov = supportProfessionals.find(p => p.id === job.professionalId)!;
                const prop = properties.find(p => p.id === job.propertyId);
                const completedCycle = prov ? prov.completedJobs % 11 : 0;
                const isZeroTax = completedCycle === 10;
                const promoFee = financeSettings?.supportFee ?? 3;
                const systemFeePct = isZeroTax ? 0 : promoFee;
                const systemFeeValue = job.quotedValue * (systemFeePct / 100);

                return (
                  <div key={job.id} className="border border-gray-100 rounded-2xl p-4 bg-slate-50 relative flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-max block mb-1">
                            {job.category}
                          </span>
                          <h4 className="font-bold text-xs text-[#0B1F33]">Chamado: {job.id}</h4>
                          <p className="text-xs text-gray-500 mt-1"><strong>Endereço:</strong> {prop ? prop.name : 'Imóvel'}</p>
                          <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 mt-2 font-medium">
                            📝 <strong>Descrição do problema:</strong> "{job.description}"
                          </p>
                        </div>

                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-blue-100 text-[#0A66FF] rounded">
                          {job.status}
                        </span>
                      </div>

                      {/* Professional Info & actions card */}
                      {prov && (
                        <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-white rounded-xl border border-gray-100 gap-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-[#0B1F33] text-white">★</div>
                            <div>
                              <p className="font-bold text-xs">{prov.name}</p>
                              <span className="text-[9px] text-gray-400">
                                {prov.phone}
                                {(loggedInUser?.role === 'ADMIN' || loggedInUser?.id === prov.id || loggedInUser?.id === job.hostId) && prov.pixKey && (
                                  <span> • Chave Pix: {prov.pixKey}</span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {editingJobId === job.id ? (
                              <div className="flex items-center gap-1.5 focus-within:ring-1 focus-within:ring-blue-500 rounded-lg p-1 bg-slate-50 border border-amber-200">
                                <span className="text-[11px] font-bold text-gray-500 pl-1">R$</span>
                                <input
                                  type="number"
                                  placeholder="Novo valor"
                                  step="0.01"
                                  value={tempQuotePrice}
                                  onChange={(e) => setTempQuotePrice(e.target.value)}
                                  className="w-20 px-1 py-0.5 text-xs text-right focus:outline-hidden bg-transparent font-bold text-slate-800"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuoteValue(job.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold p-1 rounded-md cursor-pointer flex items-center justify-center shrink-0"
                                  title="Salvar Novo Orçamento"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingJobId(null)}
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-bold p-1 rounded-md cursor-pointer flex items-center justify-center shrink-0"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                {job.quotedValue > 0 ? (
                                  <div>
                                    <span className="text-black text-xs block font-bold">R$ {job.quotedValue.toFixed(2)}</span>
                                    <span className="text-[9px] text-[#12D6C5] font-semibold">Taxa Intermediação CleanHost ({systemFeePct}%): R$ {systemFeeValue.toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-amber-600 italic font-bold">Aguardando cotação comercial...</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simulation buttons depending on user profile or debug mechanics available to simulate provider bid */}
                    <div className="mt-4 pt-3 border-t border-gray-200/50 flex flex-wrap gap-2 justify-between items-center bg-slate-100/50 p-3 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono">Simulador de Chamados Operacionais</span>

                      <div className="flex gap-1.5 flex-wrap">
                        {/* Simulation trigger: Provider quote input */}
                        {job.status === 'Solicitado' && (
                          <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-[#12D6C5]/30 focus-within:border-[#12D6C5] transition-all">
                            <span className="text-xs font-black text-slate-400">R$</span>
                            <input 
                              type="number" 
                              placeholder="Digite o valor do serviço (ex: 250)" 
                              value={quotePrices[job.id] || ''}
                              onChange={(e) => setQuotePrices({...quotePrices, [job.id]: Number(e.target.value)})}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSubmitQuote(job.id);
                                }
                              }}
                              className="w-48 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleSubmitQuote(job.id)}
                              className="bg-[#12D6C5] hover:bg-[#0fb0a3] text-[#0B1F33] text-[10px] font-extrabold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                            >
                              🚀 Enviar Orçamento
                            </button>
                          </div>
                        )}

                        {/* Host approves quote */}
                        {job.status === 'Orçado' && (
                          <div className="flex gap-1.5 items-center">
                            {editingJobId !== job.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingJobId(job.id);
                                    setTempQuotePrice(job.quotedValue.toString());
                                  }}
                                  className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  ✏️ Editar Orçamento
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAcceptQuote(job)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Aprovar Orçamento
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectQuote(job)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  ❌ Recusar Orçamento
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 italic">
                                Editando valor no painel acima...
                              </span>
                            )}
                          </div>
                        )}

                        {/* Complete work */}
                        {job.status === 'Aceito' && (
                          <div className="flex flex-col gap-2 items-start bg-amber-50/55 p-3 rounded-xl border border-amber-100 w-full">
                            <span className="text-[11px] font-bold text-amber-700 animate-pulse flex items-center gap-1">
                              ⏳ Orçamento Aprovado! Aguardando o cliente pagar o Pix de R$ {job.quotedValue.toFixed(2)}
                            </span>
                            <div className="flex gap-1.5 items-center flex-wrap">
                              {editingJobId !== job.id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingJobId(job.id);
                                      setTempQuotePrice(job.quotedValue.toString());
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    ✏️ Editar Orçamento
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Confirma que recebeu o Pix de R$ ${job.quotedValue.toFixed(2)} e o serviço foi concluído?`)) {
                                        handleCompleteJob(job, prov);
                                      }
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Confirmar Recebimento & Concluir
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 italic">
                                  Editando valor no painel acima...
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Completed message */}
                        {job.status === 'Concluído' && (
                          <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                            ✓ Serviço Realizado &amp; Pago
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: PROVIDER SIGN UP DETAILS */}
      {activeTab === 'register-provider' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-bold text-base text-[#0B1F33]">Cadastro de Profissional Técnico - Rede de Apoio</h3>
            <p className="text-xs text-gray-400 mt-1">
              Ofereça seus serviços rápidos de eletricista, encanador ou chaveiro para os maiores anfitriões de aluguel por temporada de SP.
            </p>
          </div>

          <form onSubmit={handleRegisterProvider} className="space-y-3.5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Seu Nome / Razão Social</label>
                <input 
                  type="text"
                  placeholder="Ex: Julio Antunes Chaves"
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 font-medium">Sua Categoria de Especialidade</label>
                <select
                  value={newProvCat}
                  onChange={(e) => setNewProvCat(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Chaveiro">🔑 Chaveiro</option>
                  <option value="Eletricista">⚡ Eletricista</option>
                  <option value="Encanador">🚰 Encanador</option>
                  <option value="Pintor">🎨 Pintor</option>
                  <option value="Pedreiro">🧱 Pedreiro</option>
                  <option value="Manutenção Geral">🛠️ Manutenção Geral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">WhatsApp / Telefone Comercial</label>
                <input 
                  type="text"
                  placeholder="Ex: (19) 98800-7880"
                  value={newProvPhone}
                  onChange={(e) => setNewProvPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Faixa de Preço Estimada</label>
                <input 
                  type="text"
                  placeholder="Ex: R$ 90 - R$ 250"
                  value={newProvPriceRange}
                  onChange={(e) => setNewProvPriceRange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Região de Atendimento</label>
              <input 
                type="text"
                placeholder="Ex: Zona Norte e Oeste de São Paulo"
                value={newProvRegion}
                onChange={(e) => setNewProvRegion(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Banco para Depósitos / Repasses Pix</label>
              <input 
                type="text"
                placeholder="Ex: Nubank, Itaú, Banco Cora"
                value={newProvBank}
                onChange={(e) => setNewProvBank(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Sua Chave Pix para Recebimentos Diretos</label>
              <input 
                type="text"
                placeholder="Ex: celulardoprestador@pix.com"
                value={newProvPix}
                onChange={(e) => setNewProvPix(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full py-3 bg-[#0A66FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Cadastrar Minha Empresa
            </button>
          </form>
        </div>
      )}

      {/* RENDER VIEW: MY PROFILE EDIT */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-6 animate-fade-in" id="my-profile-edit-section">
          <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-[#0B1F33] flex items-center gap-2">👤 Meu Cadastro</h3>
              <p className="text-xs text-gray-400 mt-1">
                Mantenha suas informações sempre atualizadas para garantir facilidade de contato para anfitriões.
              </p>
            </div>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Foto de perfil" className="w-14 h-14 rounded-full object-cover border border-blue-100 shadow-xs" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-100 text-[#0a66ff] font-extrabold flex items-center justify-center border border-dashed border-blue-200">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200" id="profile-success-msg">
              {profileMsg}
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Foto de Perfil */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-xs font-extrabold text-[#0B1F33] block">📸 Foto de Perfil</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md animate-fade-in" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-[#0a66ff] font-extrabold flex items-center justify-center border-2 border-[#0a66ff]/25">
                      <span className="text-2xl uppercase">
                        {profileName ? profileName.charAt(0) : '?'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1 font-sans">
                  <p className="text-xs font-bold text-slate-700">Adicionar ou alterar sua foto</p>
                  <p className="text-[11px] text-slate-400 pb-1">Utilize formatos JPG e PNG de até 3MB.</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <label className="cursor-pointer bg-[#0A66FF] hover:bg-blue-600 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all shadow-3xs inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Escolher Foto
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePhotoFileChange} 
                        className="hidden" 
                      />
                    </label>

                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="cursor-pointer bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#0D6EFD] uppercase tracking-wider">👤 Dados Pessoais</h4>
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Nome / Razão Social</label>
                  <input 
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">E-mail Comercial</label>
                  <input 
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Telefone</label>
                  <input 
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">WhatsApp</label>
                  <input 
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    value={profileWhatsapp}
                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33]"
                  />
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#0D6EFD] uppercase tracking-wider">🛠️ Dados Profissionais</h4>
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Categoria Principal</label>
                  <select
                    value={profileCategory}
                    onChange={(e) => setProfileCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33] font-medium"
                  >
                    <option value="Eletricista">⚡ Eletricista</option>
                    <option value="Encanador">🚰 Encanador</option>
                    <option value="Chaveiro">🔑 Chaveiro</option>
                    <option value="Pintor">🎨 Pintor</option>
                    <option value="Pedreiro">🧱 Pedreiro</option>
                    <option value="Manutenção Geral">🛠️ Manutenção Geral</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Anos de Experiência</label>
                  <input 
                    type="number"
                    placeholder="Ex: 8"
                    value={profileExperience}
                    onChange={(e) => setProfileExperience(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33]"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Especialidades</label>
                <input 
                  type="text"
                  placeholder="Ex: Quadro elétrico trifásico, automação residencial, disjuntores e fiação"
                  value={profileSpecialties}
                  onChange={(e) => setProfileSpecialties(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 text-[#0b1f33]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Descrição Profissional</label>
                <textarea 
                  placeholder="Descreva suas competências técnicas, experiência em condomínios de temporada e garantias oferecidas..."
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full text-xs p-3 border rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 h-24 resize-none text-[#0b1f33]"
                />
              </div>
            </div>

            {/* Área de Atendimento */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#0D6EFD] uppercase tracking-wider">📍 Área de Atendimento</h4>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Cidade</label>
                  <input 
                    type="text"
                    placeholder="Ex: Campinas"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden text-[#0b1f33]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Estado</label>
                  <input 
                    type="text"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={profileState}
                    onChange={(e) => setProfileState(e.target.value.toUpperCase())}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden text-[#0b1f33]"
                  />
                </div>
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="space-y-3 bg-blue-50/30 p-4 rounded-2xl border border-blue-50/10">
              <h4 className="text-xs font-extrabold text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Dados Financeiros (Exibição Segura)
              </h4>
              <p className="text-[10px] text-gray-400">
                Informações visíveis apenas para você e a administração para validação de faturamento e repasses Pix.
              </p>

              <div className="grid sm:grid-cols-2 gap-3.5 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Chave Pix</label>
                  <input 
                    type="text"
                    placeholder="E-mail, CPF, celular ou aleatória"
                    value={profilePix}
                    onChange={(e) => setProfilePix(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden bg-white text-[#0b1f33]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Nome do Favorecido</label>
                  <input 
                    type="text"
                    placeholder="Nome completo cadastrado no Pix"
                    value={profilePixHolder}
                    onChange={(e) => setProfilePixHolder(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden bg-white text-[#0b1f33]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Banco / Instituição Fin.</label>
                <input 
                  type="text"
                  placeholder="Ex: Banco do Brasil, Nubank, Itaú"
                  value={profileBank}
                  onChange={(e) => setProfileBank(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border rounded-xl outline-hidden bg-white text-[#0b1f33]"
                />
              </div>
            </div>

            {/* Preferred Notification Channels */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#0D6EFD] uppercase tracking-wider flex items-center gap-1.5">
                    📢 CANAIS DE NOTIFICAÇÃO DO PROFISSIONAL
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Selecione por quais canais você deseja ser alertado imediatamente ao receber novos chamados emergenciais.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-3xs">Configurável</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {/* Platform */}
                <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer transition-all select-none">
                  <input 
                    type="checkbox"
                    checked={prefPlatform}
                    onChange={(e) => setPrefPlatform(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0a66ff] border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">🖥️ Plataforma Interna</p>
                    <p className="text-[10px] text-slate-400">Ver alertas e central no próprio painel.</p>
                  </div>
                </label>

                {/* WhatsApp */}
                <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer transition-all select-none">
                  <input 
                    type="checkbox"
                    checked={prefWhatsapp}
                    onChange={(e) => setPrefWhatsapp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">🟢 WhatsApp Business</p>
                    <p className="text-[10px] text-slate-400">Mensagens diretas no número celular.</p>
                  </div>
                </label>

                {/* Email */}
                <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer transition-all select-none">
                  <input 
                    type="checkbox"
                    checked={prefEmail}
                    onChange={(e) => setPrefEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">✉️ E-mail Comercial</p>
                    <p className="text-[10px] text-slate-400">Notificações detalhadas na caixa de entrada.</p>
                  </div>
                </label>

                {/* SMS Future Ready */}
                <label className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer transition-all select-none">
                  <input 
                    type="checkbox"
                    checked={prefSms}
                    onChange={(e) => setPrefSms(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 border-gray-300 focus:ring-rose-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                      📱 SMS Emergencial
                      <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-200 font-bold px-1 rounded animate-pulse">Beta</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Preparado para integração Twilio/AWS.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Feedback & Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
              <button
                type="button"
                onClick={() => {
                  initializeProfileForm();
                  setActiveTab('my-orders');
                }}
                className="cursor-pointer px-4.5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl text-gray-500 hover:text-gray-800 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="cursor-pointer px-6 py-2.5 bg-[#0a66ff] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                🔔 Central de Notificações Integradas
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Acompanhe em tempo real os alertas gerados pelo sistema, incluindo as simulações dos canais de WhatsApp, E-mail e SMS.
              </p>
            </div>
            {myNotifications.length > 0 && (
              <button
                onClick={() => {
                  if (onUpdateSupportNotifications) {
                    onUpdateSupportNotifications(prev => 
                      prev.map(n => n.professionalId === myProfileId ? { ...n, read: true } : n)
                    );
                  }
                }}
                className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all self-start md:self-auto"
              >
                ✓ Marcar Todas como Lidas
              </button>
            )}
          </div>

          {/* Quick Config Alert */}
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-705">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Canais Ativos Atualmente</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${myProfile?.notificationPrefs?.platform !== false ? 'bg-indigo-100 text-[#0d6efd]' : 'bg-gray-100 text-gray-400'}`}>
                  🖥️ Plataforma: {myProfile?.notificationPrefs?.platform !== false ? 'Ativado' : 'Desativado'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${myProfile?.notificationPrefs?.whatsapp !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                  🟢 WhatsApp: {myProfile?.notificationPrefs?.whatsapp !== false ? 'Ativado' : 'Desativado'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${myProfile?.notificationPrefs?.email !== false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
                  ✉️ E-mail: {myProfile?.notificationPrefs?.email !== false ? 'Ativado' : 'Desativado'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${myProfile?.notificationPrefs?.sms === true ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-400'}`}>
                  📱 SMS (Future): {myProfile?.notificationPrefs?.sms === true ? 'Habilitado' : 'Não Usar'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="cursor-pointer text-xs font-bold text-[#0D6EFD] hover:underline"
            >
              Alterar preferências →
            </button>
          </div>

          {/* Notifications List */}
          {myNotifications.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-600">Nenhum alerta recente</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Quando contratantes criarem novos chamados para a sua especialidade, os avisos aparecerão instantaneamente aqui e serão despachados nos canais habilitados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myNotifications.map((notification) => {
                return (
                  <div 
                    key={notification.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      notification.read 
                        ? 'bg-slate-50/50 border-slate-100' 
                        : 'bg-white border-blue-100 shadow-xs ring-1 ring-blue-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                            notification.read ? 'bg-slate-200 text-slate-600' : 'bg-red-500 text-white animate-pulse'
                          }`}>
                            {notification.read ? 'LIDO' : 'NOVO ALERTA'}
                          </span>
                          <span className="text-xs font-mono text-gray-400 font-bold">{notification.id}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notification.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 mt-1">{notification.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{notification.message}</p>
                      </div>

                      {!notification.read && (
                        <button
                          onClick={() => {
                            if (onUpdateSupportNotifications) {
                              onUpdateSupportNotifications(prev =>
                                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                              );
                            }
                          }}
                          className="cursor-pointer shrink-0 text-xs font-bold text-[#0D6EFD] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                          title="Marcar como lida"
                        >
                          Lida
                        </button>
                      )}
                    </div>

                    {/* Integrated Multi-Channel Dispatches Logs */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid md:grid-cols-3 gap-4">
                      {/* WhatsApp Box */}
                      <div className="p-3.5 bg-emerald-50/20 border border-emerald-100/40 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                            🟢 WhatsApp Simulator
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            notification.sentChannels.whatsapp ? 'bg-emerald-150 text-emerald-900' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {notification.sentChannels.whatsapp ? 'DESPACHADO' : 'INATIVO'}
                          </span>
                        </div>
                        {notification.sentChannels.whatsapp ? (
                          <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-[#0A66FF] font-bold block mb-0.5">Destinatário: {myProfile?.phone || '(Celular Cadastrado)'}</span>
                            <span className="italic">"Você recebeu uma nova solicitação de serviço na CleanHost. Acesse sua conta ..."</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Desativado nas preferências de cadastro.</p>
                        )}
                      </div>

                      {/* Email Box */}
                      <div className="p-3.5 bg-blue-50/20 border border-blue-100/40 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                            ✉️ E-mail SMTP Direct
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            notification.sentChannels.email ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {notification.sentChannels.email ? 'DESPACHADO' : 'INATIVO'}
                          </span>
                        </div>
                        {notification.sentChannels.email ? (
                          <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-[#0A66FF] font-bold block mb-0.5">Para: {myProfile?.email || loggedInUser?.email || 'email@provedor.com'}</span>
                            <span className="font-bold text-slate-700 block text-[9px]">Assunto: Nova Solicitação CleanHost</span>
                            <span className="italic block mt-1">"Prezado {myProfile?.name}, recebemos nova solicitação de serviço na CleanHost e..."</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Desativado nas preferências de cadastro.</p>
                        )}
                      </div>

                      {/* SMS Box (Future Architectural Gateway) */}
                      <div className="p-3.5 bg-purple-50/20 border border-purple-100/40 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
                            📱 Gateway SMS (Twilio)
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            notification.sentChannels.sms ? 'bg-purple-100 text-purple-900' : 'bg-purple-50 text-purple-400'
                          }`}>
                            {notification.sentChannels.sms ? 'SIMULADO' : 'INATIVO'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
                            <span>Conexão Gateway</span>
                            <span className={notification.sentChannels.sms ? 'text-amber-600' : 'text-slate-400'}>
                              {notification.sentChannels.sms ? 'Test Ready' : 'Standby'}
                            </span>
                          </div>
                          <p className="text-[9px] leading-tight text-slate-400 font-mono">
                            {notification.sentChannels.sms 
                              ? `📱 SMS transmitido para ${myProfile?.phone || 'cadastrado'}.` 
                              : `Gateway Twilio/AWS SMS API pronto para acoplamento.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
