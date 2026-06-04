import React, { useState } from 'react';
import { 
  Hammer, Wrench, Key, Sparkles, Star, MapPin, CheckCircle, Plus, 
  Trash2, Phone, AlertTriangle, FileText, DollarSign, Clock, Check, X, ShieldAlert
} from 'lucide-react';
import { SupportProfessional, SupportJob, Property } from '../types';

interface SupportSectionProps {
  properties: Property[];
  supportProfessionals: SupportProfessional[];
  supportJobs: SupportJob[];
  onAddSupportJob: (job: SupportJob) => void;
  onUpdateSupportJob: (jobId: string, updates: Partial<SupportJob>) => void;
  onAddSupportProfessional: (prof: SupportProfessional) => void;
  activeRole: 'HOST' | 'CLEANER' | 'ADMIN' | 'SUPPORT';
}

export default function SupportSection({
  properties,
  supportProfessionals,
  supportJobs,
  onAddSupportJob,
  onUpdateSupportJob,
  onAddSupportProfessional,
  activeRole
}: SupportSectionProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'my-orders' | 'register-provider'>('directory');
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
  const [newProvPriceRange, setNewProvPriceRange] = useState('R$ 100 - R$ 250');

  // Submit Quote State for Tech role
  const [quotePrices, setQuotePrices] = useState<Record<string, number>>({});

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
    if (!newProvName || !newProvPhone || !newProvRegion || !newProvPix) {
      alert('Por favor, preencha todos os campos do cadastro profissional.');
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
      estimatedPriceRange: newProvPriceRange,
      logoColor: 'bg-[#12D6C5]/10 text-[#0b1f33]'
    };

    onAddSupportProfessional(newProv);
    alert(`Cadastro na Rede de Apoio realizado com sucesso! Os anfitriões do CleanHost agora podem encontrar você para chamados.`);
    setNewProvName('');
    setNewProvPhone('');
    setNewProvRegion('');
    setNewProvPix('');
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

  const handleAcceptQuote = (job: SupportJob) => {
    onUpdateSupportJob(job.id, {
      status: 'Aceito'
    });
    alert('Orçamento aceito! O profissional foi notificado e pode prosseguir para solucionar o sinistro.');
  };

  const handleCompleteJob = (job: SupportJob, prov: SupportProfessional) => {
    onUpdateSupportJob(job.id, {
      status: 'Concluído'
    });
    alert(`Operação encerrada no aplicativo! A CleanHost registrou o serviço. Repasse retido de 10% (Fidelidade: 11º reduz para 5%).`);
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
      
      {/* Tab controls */}
      <div className="flex bg-white p-1 rounded-3xl shadow-xs border border-blue-50 gap-2">
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
          onClick={() => setActiveTab('register-provider')}
          className={`cursor-pointer px-4 py-2.5 text-xs md:text-sm font-bold font-display rounded-2xl transition-all ${activeTab === 'register-provider' ? 'bg-[#0A66FF] text-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          ✨ Cadastrar Profissional de Reparo
        </button>
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
                      <div className={`p-2.5 rounded-xl ${prov.logoColor || 'bg-blue-50 text-[#0A66FF]'}`}>
                        {getIconForCategory(prov.category)}
                      </div>
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
                const isLoyaltyReduced = prov ? prov.completedJobs >= 10 : false;
                const systemFeeValue = job.quotedValue * (isLoyaltyReduced ? 0.05 : 0.10);

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
                              <span className="text-[9px] text-gray-400">{prov.phone} • Chave Pix: {prov.pixKey}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            {job.quotedValue > 0 ? (
                              <div>
                                <span className="text-black text-xs block font-bold">R$ {job.quotedValue.toFixed(2)}</span>
                                <span className="text-[9px] text-[#12D6C5] font-semibold">Taxa Intermediação CleanHost (10%): R$ {systemFeeValue.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 italic font-bold">Aguardando cotação comercial...</span>
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
                          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border shadow-3xs">
                            <input 
                              type="number" 
                              placeholder="Fórmula de Valor R$" 
                              value={quotePrices[job.id] || ''}
                              onChange={(e) => setQuotePrices({...quotePrices, [job.id]: Number(e.target.value)})}
                              className="w-20 px-2 py-1 text-xs border rounded-lg focus:outline-hidden"
                            />
                            <button
                              onClick={() => handleSubmitQuote(job.id)}
                              className="bg-[#12D6C5] hover:bg-[#0fb0a3] text-[#0B1F33] text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                            >
                              Enviar Orçamento
                            </button>
                          </div>
                        )}

                        {/* Host approves quote */}
                        {job.status === 'Orçado' && (
                          <button
                            onClick={() => handleAcceptQuote(job)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Aprovar Orçamento
                          </button>
                        )}

                        {/* Complete work */}
                        {job.status === 'Aceito' && (
                          <button
                            onClick={() => handleCompleteJob(job, prov)}
                            className="bg-[#0A66FF] hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Marcar como Concluído
                          </button>
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

    </div>
  );
}
