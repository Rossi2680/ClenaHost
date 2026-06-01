/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Phone, Sparkles, MessageSquare, ChevronRight, UserCheck, 
  HelpCircle, Star, Settings, ExternalLink, RefreshCw, LogOut, CheckSquare
} from 'lucide-react';

import { Property, Professional, SupportProfessional, CleaningRequest, SupportJob, UserRole, RequestStatus } from './types';
import { mockProperties, mockProfessionals, mockSupportProfessionals, mockRequests } from './data/mockData';

// Modular Child Section Imports
import Logo from './components/Logo';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import ReceiptModal from './components/ReceiptModal';
import HostSection from './components/HostSection';
import CleanerSection from './components/CleanerSection';
import SupportSection from './components/SupportSection';
import AdminSection from './components/AdminSection';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const [hideDemoControls, setHideDemoControls] = useState<boolean>(true);

  // Operating Mode: 'demo' (with prefilled fictional data) or 'field' (for real people testing)
  const [appMode, setAppMode] = useState<'demo' | 'field'>('field');

  // Admin access screen switcher: lets administrators swap to any other profile view on the fly
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'host' | 'cleaner' | 'support'>('admin');

  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('cleanhost_registered_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Store App Central States
  const [properties, setProperties] = useState<Property[]>(() => {
    const local = localStorage.getItem('cleanhost_properties');
    return local ? JSON.parse(local) : [];
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const local = localStorage.getItem('cleanhost_professionals');
    return local ? JSON.parse(local) : [];
  });

  const [supportProfessionals, setSupportProfessionals] = useState<SupportProfessional[]>(() => {
    const local = localStorage.getItem('cleanhost_support_professionals');
    return local ? JSON.parse(local) : [];
  });

  const [requests, setRequests] = useState<CleaningRequest[]>(() => {
    const local = localStorage.getItem('cleanhost_requests');
    return local ? JSON.parse(local) : [];
  });

  const [supportJobs, setSupportJobs] = useState<SupportJob[]>(() => {
    const local = localStorage.getItem('cleanhost_support_jobs');
    return local ? JSON.parse(local) : [];
  });

  // Role switching
  const [userRole, setUserRole] = useState<UserRole>('HOST');
  
  // Active cleaner selected in the sandbox
  const [activeCleanerId, setActiveCleanerId] = useState<string>('');

  // Active logged-in user session state
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; name: string; role: UserRole; email: string } | null>(() => {
    const saved = localStorage.getItem('cleanhost_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Finance configuration parameters
  const [financeSettings, setFinanceSettings] = useState(() => {
    const saved = localStorage.getItem('cleanhost_finance_settings');
    return saved ? JSON.parse(saved) : {
      pixKey: 'cleanhost.oficial@gmail.com',
      standardTax: 12,
      loyaltyTax: 5,
      recipientAccount: 'CleanHost Hold S.A. - Banco Cora IP',
      autoRepassActive: true
    };
  });

  // Finance transactions logs with security signatures and timestamps
  const [financeLogs, setFinanceLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('cleanhost_finance_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals state
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [selectedReceiptRequest, setSelectedReceiptRequest] = useState<CleaningRequest | null>(null);

  // Sync loggedInUser to localStorage and update role/cleaner accordingly
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('cleanhost_logged_in_user', JSON.stringify(loggedInUser));
      setUserRole(loggedInUser.role);
      // If logging in as cleaner, snap local cleaner ID
      if (loggedInUser.role === 'CLEANER') {
        setActiveCleanerId(loggedInUser.id);
      }
    } else {
      localStorage.removeItem('cleanhost_logged_in_user');
    }
  }, [loggedInUser]);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('cleanhost_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('cleanhost_professionals', JSON.stringify(professionals));
  }, [professionals]);

  useEffect(() => {
    localStorage.setItem('cleanhost_support_professionals', JSON.stringify(supportProfessionals));
  }, [supportProfessionals]);

  useEffect(() => {
    localStorage.setItem('cleanhost_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('cleanhost_support_jobs', JSON.stringify(supportJobs));
  }, [supportJobs]);

  useEffect(() => {
    localStorage.setItem('cleanhost_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('cleanhost_finance_settings', JSON.stringify(financeSettings));
  }, [financeSettings]);

  useEffect(() => {
    localStorage.setItem('cleanhost_finance_logs', JSON.stringify(financeLogs));
  }, [financeLogs]);

  // Global State Setters Passer callbacks
  const handleAddUser = (newUser: any) => {
    setRegisteredUsers(prev => [newUser, ...prev]);
  };

  const handleUpdateRegisteredUserStatus = (userId: string, isApproved: boolean, approvalStatus: 'approved' | 'rejected' | 'correction_requested') => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isApproved, approvalStatus };
      }
      return u;
    }));

    // Find registered user details to activate assets
    const targetUser = registeredUsers.find(u => u.id === userId);
    if (!targetUser) return;

    if (isApproved && approvalStatus === 'approved') {
      if (targetUser.role === 'CLEANER') {
        setProfessionals(prev => {
          if (prev.some(p => p.id === userId)) {
            return prev.map(p => p.id === userId ? { ...p, isApproved: true } : p);
          } else {
            return [...prev, {
              id: userId,
              name: targetUser.name,
              photoUrl: targetUser.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
              document: targetUser.document,
              region: targetUser.region || 'Itaim Bibi & Jardins',
              pixKey: targetUser.pixKey || 'pix@cleanhost.com',
              score: 100,
              rating: 5.0,
              totalServices: 0,
              availability: ['Manhã', 'Tarde'],
              priceStandard: 140,
              priceExpress: 190,
              distanceKm: 1.2,
              isSuperCleaner: false,
              isApproved: true
            }];
          }
        });
      } else if (targetUser.role === 'SUPPORT') {
        setSupportProfessionals(prev => {
          if (prev.some(s => s.id === userId)) {
            return prev.map(s => s.id === userId ? { ...s, isApproved: true } : s);
          } else {
            return [...prev, {
              id: userId,
              name: targetUser.name,
              category: targetUser.category || 'Manutenção Geral',
              phone: targetUser.phone,
              region: targetUser.region || 'São Paulo',
              availability: 'Comercial',
              rating: 5.0,
              completedJobs: 0,
              pixKey: targetUser.pixKey || 'pix@cleanhost.com',
              estimatedPriceRange: 'R$ 80 - R$ 250',
              logoColor: 'bg-indigo-100 text-indigo-600',
              isApproved: true
            }];
          }
        });
      }
    } else {
      // If rejected or correction requested, ensure user's professional profiles are deactivated/not listed/approved
      if (targetUser.role === 'CLEANER') {
        setProfessionals(prev => prev.filter(p => p.id !== userId));
      } else if (targetUser.role === 'SUPPORT') {
        setSupportProfessionals(prev => prev.filter(s => s.id !== userId));
      }
    }
  };

  const handleAddRequest = (newReq: CleaningRequest) => {
    setRequests(prev => [newReq, ...prev]);
  };

  const handleUpdateRequest = (reqId: string, updates: Partial<CleaningRequest>) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, ...updates } : r));
  };

  const handleAddProperty = (newProp: Property) => {
    setProperties(prev => [...prev, newProp]);
  };

  const handleUpdateCleanerInfo = (cleanerId: string, updates: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === cleanerId ? { ...p, ...updates } : p));
  };

  const handleAddProfessional = (newClean: Professional) => {
    setProfessionals(prev => [...prev, newClean]);
  };

  const handleAddSupportJob = (newJob: SupportJob) => {
    setSupportJobs(prev => [newJob, ...prev]);
  };

  const handleUpdateSupportJob = (jobId: string, updates: Partial<SupportJob>) => {
    setSupportJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));
  };

  const handleAddSupportProfessional = (newSup: SupportProfessional) => {
    setSupportProfessionals(prev => [...prev, newSup]);
  };

  const handleSwitchMode = (newMode: 'demo' | 'field') => {
    const isDemo = newMode === 'demo';
    const message = isDemo
      ? 'Deseja alternar para o Modo Demonstração? Isso carregará dados fictícios predefinidos para você visualizar e demonstrar todo o potencial do aplicativo.'
      : 'Deseja alternar para o Modo de Teste em Campo Real? Isso removerá as solicitações padrão fictícias para iniciar uma base vazia e limpa para pessoas reais, profissionais e imóveis se cadastrarem e agendarem faxinas na prática.';
      
    if (confirm(message)) {
      localStorage.setItem('cleanhost_app_mode', newMode);
      setAppMode(newMode);
      if (isDemo) {
        localStorage.setItem('cleanhost_properties', JSON.stringify(mockProperties));
        localStorage.setItem('cleanhost_professionals', JSON.stringify(mockProfessionals));
        localStorage.setItem('cleanhost_support_professionals', JSON.stringify(mockSupportProfessionals));
        localStorage.setItem('cleanhost_requests', JSON.stringify(mockRequests));
        setProperties(mockProperties);
        setProfessionals(mockProfessionals);
        setSupportProfessionals(mockSupportProfessionals);
        setRequests(mockRequests);
        setActiveCleanerId('prof-1');
      } else {
        localStorage.setItem('cleanhost_properties', JSON.stringify([]));
        localStorage.setItem('cleanhost_professionals', JSON.stringify([]));
        localStorage.setItem('cleanhost_support_professionals', JSON.stringify([]));
        localStorage.setItem('cleanhost_requests', JSON.stringify([]));
        setProperties([]);
        setProfessionals([]);
        setSupportProfessionals([]);
        setRequests([]);
        setActiveCleanerId('');
      }
      setSupportJobs([]);
      localStorage.setItem('cleanhost_support_jobs', JSON.stringify([]));
      setLoggedInUser(null);
      setUserRole('HOST');
    }
  };

  const resetLocalStorageDemo = () => {
    const isDemo = appMode === 'demo';
    const message = isDemo
      ? 'Deseja reiniciar o simulador com os dados padrão de fábrica de demonstração?'
      : 'Deseja limpar todos os dados cadastrados neste modo de teste em campo real?';

    if (confirm(message)) {
      if (isDemo) {
        localStorage.setItem('cleanhost_properties', JSON.stringify(mockProperties));
        localStorage.setItem('cleanhost_professionals', JSON.stringify(mockProfessionals));
        localStorage.setItem('cleanhost_support_professionals', JSON.stringify(mockSupportProfessionals));
        localStorage.setItem('cleanhost_requests', JSON.stringify(mockRequests));
        setProperties(mockProperties);
        setProfessionals(mockProfessionals);
        setSupportProfessionals(mockSupportProfessionals);
        setRequests(mockRequests);
        setActiveCleanerId('prof-1');
      } else {
        localStorage.setItem('cleanhost_properties', JSON.stringify([]));
        localStorage.setItem('cleanhost_professionals', JSON.stringify([]));
        localStorage.setItem('cleanhost_support_professionals', JSON.stringify([]));
        localStorage.setItem('cleanhost_requests', JSON.stringify([]));
        setProperties([]);
        setProfessionals([]);
        setSupportProfessionals([]);
        setRequests([]);
        setActiveCleanerId('');
      }
      setSupportJobs([]);
      localStorage.setItem('cleanhost_support_jobs', JSON.stringify([]));
      setLoggedInUser(null);
      setUserRole('HOST');
      alert(isDemo ? 'Demonstração reiniciada com sucesso!' : 'Banco de dados local do seu teste real limpo com sucesso!');
    }
  };

  return (
    <div id="cleanhost-root" className="min-h-screen bg-[#F4F7FA] font-sans text-[#0B1F33] flex flex-col antialiased">
      
      {/* Upper Brand Promo Alert */}
      <div className="bg-[#0B1F33] text-white text-[11px] font-bold text-center tracking-wide py-2.5 px-4 flex flex-col sm:flex-row justify-center items-center gap-1.5 border-b border-slate-800">
        <span className="bg-[#12D6C5] text-[#0B1F33] px-2 py-0.2 rounded font-mono font-black animate-pulse">NOVO</span>
        <span>Acelere a virada de hóspede no Airbnb com a velocidade da nossa Rede de Apoio e Limpeza Expressa!</span>
        <button 
          onClick={() => setShowPrivacyPolicy(true)}
          className="underline hover:text-[#12D6C5] text-white/90 font-semibold cursor-pointer ml-1"
        >
          Verificar Termos LGPD e Responsabilidades
        </button>
      </div>

      {/* Main Professional Header */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo and Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo showSlogan={false} size="sm" />
            
            {/* SYSTEM MODE TOGGLE */}
            {!hideDemoControls && (
              <div className="flex bg-[#F1F5F9] p-0.5 rounded-xl border border-slate-200 shadow-2xs items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('demo')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    appMode === 'demo'
                      ? 'bg-[#0B1F33] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔬 Simulador Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('field')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    appMode === 'field'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-[#10b981] hover:text-[#047857]'
                  }`}
                >
                  🌍 Testar em Campo Real
                </button>
              </div>
            )}
          </div>

          {/* Slogan aligned center */}
          <div className="hidden lg:block text-center max-w-sm">
            <span className="text-sm sm:text-base font-bold text-slate-700 italic">“Seu imóvel pronto para o próximo hóspede”</span>
          </div>

          {/* LOGGED IN NAVIGATION AND SIMULATION CONTROLS */}
          {loggedInUser ? (
            <div className="flex items-center gap-3">
              {/* CURRENTLY LOGGED IN BADGE */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 py-1.5 px-3 rounded-2xl shadow-2xs">
                <div className={`w-2 h-2 rounded-full animate-pulse ${appMode === 'demo' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                <div className="text-left font-sans">
                  <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">
                    {appMode === 'demo' ? 'Modo Demo \u2022 ' : (hideDemoControls ? 'Sessão Ativa \u2022 ' : 'Campo Real \u2022 ')}
                    {userRole === 'HOST' ? 'Anfitrião' : userRole === 'CLEANER' ? 'Cleaner' : userRole === 'SUPPORT' ? 'Apoio' : 'Sócio-Admin'}
                  </span>
                  <span className="text-xs font-black text-[#0B1F33]">{loggedInUser.name}</span>
                </div>
                <button
                  onClick={() => {
                    setLoggedInUser(null);
                    setUserRole('HOST');
                  }}
                  className="cursor-pointer p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors ml-2"
                  title="Sair da Conta (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-2 text-[11px] font-extrabold px-3 py-1.5 rounded-xl border ${appMode === 'demo' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-250'}`}>
              <span className="animate-pulse">🔒</span> {appMode === 'demo' ? 'Área Restrita (Demonstração)' : (hideDemoControls ? 'Acesso Restrito: Faça login para acessar' : 'Ambiente Limpo (Teste Real)')}
            </div>
          )}

        </div>
      </header>

      {/* RENDER PROFILE SCOPE INFO BAR */}
      {loggedInUser && (
        <div className="bg-white/95 border-b border-gray-100 px-4 py-2 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${appMode === 'demo' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
              <span className="font-semibold text-gray-600 font-sans">
                {userRole === 'HOST' && 'Painel do Anfitrião \u2022 Gerencie propriedades, agende faxinas e visualize checklists de entrega.'}
                {userRole === 'CLEANER' && 'Espaço do Profissional \u2022 Gerencie sua agenda de faxinas, atualize as etapas de entrega e acompanhe seus ganhos.'}
                {userRole === 'SUPPORT' && 'Rede de Apoio Técnico \u2022 Visualize pedidos de reparos urgentes e envie propostas de orçamentos rápidos.'}
                {userRole === 'ADMIN' && 'Painel do Sócio-Administrador \u2022 Monitore o faturamento, controle da base de dados e homologação de novos profissionais.'}
              </span>
            </div>

            {!hideDemoControls && (
              <div className="flex items-center gap-4">
                <button
                  onClick={resetLocalStorageDemo}
                  className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-gray-500 font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                  title="Voltar ao estado original"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500 font-semibold" />
                  {appMode === 'demo' ? 'Reset Sandbox' : 'Limpar Dados Cadastrados'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Fluid Content Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {!loggedInUser ? (
          <AuthScreen 
            onLoginSuccess={(session) => setLoggedInUser(session)}
            existingProfessionals={professionals}
            existingSupportProfessionals={supportProfessionals}
            onAddProperty={handleAddProperty}
            onAddProfessional={handleAddProfessional}
            onAddSupportProfessional={handleAddSupportProfessional}
            appMode={appMode}
            onSwitchMode={handleSwitchMode}
            registeredUsers={registeredUsers}
            onAddUser={handleAddUser}
            hideDemoControls={hideDemoControls}
          />
        ) : (
          <>
            {/* Automatic Homologation Notification Banners */}
            {(() => {
              const currentUserDetail = registeredUsers.find(u => u.id === loggedInUser?.id || u.email.toLowerCase() === loggedInUser?.email.toLowerCase());
              if (!currentUserDetail || loggedInUser.role === 'ADMIN') return null;

              if (currentUserDetail.approvalStatus === 'pending') {
                return (
                  <div id="notice-pending" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-5 mb-6 flex items-start gap-3.5 shadow-3xs animate-fade-in">
                    <span className="text-xl mt-0.5 shrink-0">📝</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-950 font-display">Cadastro em Fase de Homologação</h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed font-sans">
                        Sua solicitação foi enviada para análise da equipe CleanHost. Você receberá uma notificação assim que seu cadastro for aprovado.
                      </p>
                    </div>
                  </div>
                );
              }

              if (currentUserDetail.approvalStatus === 'approved') {
                return (
                  <div id="notice-approved" className="bg-emerald-50 border border-emerald-250 text-emerald-900 rounded-3xl p-5 mb-6 flex items-start gap-3.5 shadow-3xs animate-fade-in">
                    <span className="text-xl mt-0.5 shrink-0">🎉</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950 font-display">Cadastro Liberado com Sucesso!</h4>
                      <p className="text-xs text-emerald-800 mt-1 font-semibold leading-relaxed font-sans">
                        Parabéns! Seu cadastro foi aprovado. Agora você já pode acessar a plataforma CleanHost.
                      </p>
                    </div>
                  </div>
                );
              }

              if (currentUserDetail.approvalStatus === 'rejected') {
                return (
                  <div id="notice-rejected" className="bg-rose-50 border border-rose-220 text-rose-950 rounded-3xl p-5 mb-6 flex items-start gap-3.5 shadow-3xs animate-fade-in">
                    <span className="text-xl mt-0.5 shrink-0">⚠️</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-900 font-display">Atenção Especial Requerida</h4>
                      <p className="text-xs text-rose-700 mt-1 font-black leading-relaxed font-sans">
                        Seu cadastro precisa de ajustes. Entre em contato com o suporte da CleanHost.
                      </p>
                    </div>
                  </div>
                );
              }

              if (currentUserDetail.approvalStatus === 'correction_requested') {
                return (
                  <div id="notice-correction" className="bg-amber-50 border border-amber-220 text-amber-950 rounded-3xl p-5 mb-6 flex items-start gap-3.5 shadow-3xs animate-fade-in">
                    <span className="text-xl mt-0.5 shrink-0">✏️</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900 font-display">Ajustes Necessários no Cadastro</h4>
                      <p className="text-xs text-amber-700 mt-1 font-black leading-relaxed font-sans">
                        Seu cadastro de perfil necessita de pequenas correções documentais ou de cadastro. Entre em contato com o suporte da CleanHost para receber orientações sobre as correções necessárias.
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {/* Admin Master Switcher */}
            {loggedInUser.role === 'ADMIN' && (
              <div className="bg-white border border-[#0B1F33]/20 shadow-sm rounded-3xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#0B1F33] text-[#12D6C5] p-2 rounded-xl shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#0B1F33] flex items-center gap-1.5 leading-none">
                      🔒 Acesso Master Sócio-Administrador
                    </h2>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">Como Administrador, você possui permissão total para transitar e testar todas as áreas e telas do aplicativo.</p>
                  </div>
                </div>

                <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200 items-center gap-1">
                  <button
                    onClick={() => setAdminViewMode('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      adminViewMode === 'admin'
                        ? 'bg-[#0B1F33] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👑 Painel Admin
                  </button>
                  <button
                    onClick={() => setAdminViewMode('host')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      adminViewMode === 'host'
                        ? 'bg-[#0A66FF] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏡 Como Anfitrião
                  </button>
                  <button
                    onClick={() => setAdminViewMode('cleaner')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      adminViewMode === 'cleaner'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🧽 Como Cleaner
                  </button>
                  <button
                    onClick={() => setAdminViewMode('support')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      adminViewMode === 'support'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔧 Como Apoio Técnico
                  </button>
                </div>
              </div>
            )}

            {/* Selector for cleaner when in admin view mode and cleaner panel is active */}
            {loggedInUser.role === 'ADMIN' && adminViewMode === 'cleaner' && (
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-base">🧽</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Visualizando como Profissional</p>
                    <p className="text-[10px] text-emerald-700">Selecione qual profissional simular para visualizar sua respectiva agenda e faturamento.</p>
                  </div>
                </div>
                <select
                  value={activeCleanerId || (professionals[0]?.id || '')}
                  onChange={(e) => setActiveCleanerId(e.target.value)}
                  className="bg-white border border-emerald-200 text-emerald-950 rounded-xl px-3 py-1.5 text-xs font-bold outline-none shadow-3xs cursor-pointer min-w-[200px]"
                >
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isApproved ? '(Homologado)' : '(Pendente)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Swappable Views */}
            {(loggedInUser.role === 'ADMIN' ? adminViewMode === 'host' : (userRole === 'HOST' || userRole === 'CLIENTE')) && (
              <HostSection 
                properties={properties}
                professionals={professionals.filter(p => p.isApproved)}
                requests={requests}
                onAddRequest={handleAddRequest}
                onUpdateRequest={handleUpdateRequest}
                onAddProperty={handleAddProperty}
                onOpenReceipt={(req) => setSelectedReceiptRequest(req)}
                financeSettings={financeSettings}
                onRecordFinanceLog={(log: any) => setFinanceLogs(prev => [log, ...prev])}
                userName={loggedInUser?.name || 'Anfitrião'}
              />
            )}

            {(loggedInUser.role === 'ADMIN' ? adminViewMode === 'cleaner' : userRole === 'CLEANER') && (
              <CleanerSection 
                professionals={professionals}
                activeCleanerId={activeCleanerId || (professionals[0]?.id || '')}
                requests={requests}
                onUpdateRequest={handleUpdateRequest}
                onUpdateCleanerInfo={handleUpdateCleanerInfo}
              />
            )}

            {(loggedInUser.role === 'ADMIN' ? adminViewMode === 'support' : userRole === 'SUPPORT') && (
              <SupportSection 
                properties={properties}
                supportProfessionals={supportProfessionals}
                supportJobs={supportJobs}
                onAddSupportJob={handleAddSupportJob}
                onUpdateSupportJob={handleUpdateSupportJob}
                onAddSupportProfessional={handleAddSupportProfessional}
                activeRole={loggedInUser.role === 'ADMIN' ? 'SUPPORT' : userRole}
              />
            )}

            {(loggedInUser.role === 'ADMIN' ? adminViewMode === 'admin' : userRole === 'ADMIN') && (
              <AdminSection 
                professionals={professionals}
                requests={requests}
                supportJobs={supportJobs}
                onUpdateRequest={handleUpdateRequest}
                onUpdateCleanerInfo={handleUpdateCleanerInfo}
                onAddProfessional={handleAddProfessional}
                registeredUsers={registeredUsers}
                onUpdateRegisteredUserStatus={handleUpdateRegisteredUserStatus}
                financeSettings={financeSettings}
                onChangeFinanceSettings={setFinanceSettings}
                financeLogs={financeLogs}
              />
            )}
          </>
        )}

      </main>

      {/* Supporting Action float - WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
        <a 
          href="https://wa.me/5519988007880" 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-xl hover:bg-emerald-600 hover:scale-102 transition-all cursor-pointer group"
        >
          <Phone className="w-4 h-4 fill-white" />
          <div className="text-left leading-none">
            <span className="text-[10px] text-white/80 block uppercase tracking-wider font-bold">Suporte Direto</span>
            <span className="text-xs font-black font-mono">(19) 98800-7880</span>
          </div>
        </a>
      </div>

      {/* Persistent Visual Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm tracking-tight text-[#0A66FF]">
              Clean<span className="text-[#12D6C5]">Host</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-sm text-slate-600">“Seu imóvel pronto para o próximo hóspede”</span>
          </div>

          <div className="flex flex-wrap gap-4 font-semibold text-gray-650 justify-center">
            <button 
              onClick={() => setShowPrivacyPolicy(true)}
              className="hover:underline hover:text-[#0A66FF] cursor-pointer"
            >
              Política de Privacidade LGPD
            </button>
            <span>•</span>
            <a 
              href="https://wa.me/5519988007880" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:underline hover:text-[#0A66FF]"
            >
              Ajuda &amp; WhatsApp Oficial (19) 98800-7880
            </a>
            <span>•</span>
            <span className="text-gray-400">Copyright © 2026 CleanHost Inc.</span>
          </div>
        </div>
      </footer>

      {/* MODAL OVERLAYS */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />

      {selectedReceiptRequest && (
        <ReceiptModal 
          request={selectedReceiptRequest}
          isOpen={!!selectedReceiptRequest}
          onClose={() => setSelectedReceiptRequest(null)}
          standardTax={financeSettings.standardTax}
          loyaltyTax={financeSettings.loyaltyTax}
        />
      )}

    </div>
  );
}
