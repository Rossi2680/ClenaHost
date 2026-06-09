import React, { useState } from 'react';
import { 
  Key, Mail, User, Shield, Phone, Sparkles, MapPin, DollarSign, Clock, CreditCard, 
  ArrowRight, ShieldCheck, HelpCircle, CheckCircle2, AlertCircle, Building, Eye, EyeOff,
  Camera, Trash2
} from 'lucide-react';
import { UserRole, Property, Professional, SupportProfessional } from '../types';
import Logo from './Logo';

// Standard Brazilian CPF digit validation (Receita Federal standard matching algorithm)
const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]+/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  return true;
};

// Standard email syntax check
const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Standard Brazilian DDD + line length validation (10 or 11 digits)
const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d]+/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

interface AuthScreenProps {
  onLoginSuccess: (session: { id: string; name: string; role: UserRole; email: string; extra?: any }) => void;
  existingProfessionals: Professional[];
  existingSupportProfessionals: SupportProfessional[];
  onAddProperty: (prop: Property) => void;
  onAddProfessional: (prof: Professional) => void;
  onAddSupportProfessional: (sup: SupportProfessional) => void;
  appMode: 'demo' | 'field';
  onSwitchMode: (newMode: 'demo' | 'field') => void;
  registeredUsers: any[];
  onAddUser: (user: any) => void;
  hideDemoControls?: boolean;
  financeSettings?: any;
}

const normalizeCity = (cityStr: string | undefined): string => {
  if (!cityStr) return 'Outras';
  const c = cityStr.trim().toLowerCase();
  if (c.includes('jundiai') || c.includes('jundiaí')) return 'Jundiaí/SP';
  if (c.includes('campinas')) return 'Campinas/SP';
  if (c.includes('são paulo') || c.includes('sao paulo')) return 'São Paulo/SP';
  if (c.includes('sorocaba')) return 'Sorocaba/SP';
  if (c.includes('indaiatuba')) return 'Indaiatuba/SP';
  if (c.includes('itupeva')) return 'Itupeva/SP';
  if (c.includes('louveira')) return 'Louveira/SP';
  if (c.includes('vinhedo')) return 'Vinhedo/SP';
  return cityStr.trim();
};

export default function AuthScreen({
  onLoginSuccess,
  existingProfessionals,
  existingSupportProfessionals,
  onAddProperty,
  onAddProfessional,
  onAddSupportProfessional,
  appMode,
  onSwitchMode,
  registeredUsers,
  onAddUser,
  hideDemoControls = false,
  financeSettings
}: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRegRole, setSelectedRegRole] = useState<UserRole>('HOST');
  const [showPassword, setShowPassword] = useState(false);

  const getCityMetrics = (cityName: string) => {
    const cityUsers = (registeredUsers || []).filter(u => normalizeCity(u.city) === cityName);
    const hosts = cityUsers.filter(u => u.role === 'HOST' || u.role === 'CLIENTE').length;
    const cleaners = cityUsers.filter(u => u.role === 'CLEANER').length;
    const support = cityUsers.filter(u => u.role === 'SUPPORT').length;
    const total = cityUsers.length;
    return { hosts, cleaners, support, total };
  };

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // General Form Fields - Registration
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDocument, setRegDocument] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regBairro, setRegBairro] = useState('');
  const [regCep, setRegCep] = useState('');
  const [regRegion, setRegRegion] = useState('');
  const [regPixKey, setRegPixKey] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regPhoto, setRegPhoto] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setRegError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 400; // 400px maximum resolution is ideal for avatar photos
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
            // Save as low-footprint jpeg image at 75% quality (~20-40kb instead of 5-10MB!)
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
            setRegPhoto(compressedUrl);
            setRegError('');
          } else {
            setRegPhoto(e.target?.result as string);
            setRegError('');
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // Role-Specific Fields - Host (creating their first property)
  const [hostPropName, setHostPropName] = useState('');
  const [hostPropAddress, setHostPropAddress] = useState('');
  const [hostPropCity, setHostPropCity] = useState('São Paulo');
  const [hostPropRooms, setHostPropRooms] = useState('1');
  const [hostPropBathrooms, setHostPropBathrooms] = useState('1');

  // Role-Specific Fields - Professional (Cleaner)
  const [cleanerPriceStd, setCleanerPriceStd] = useState('140');
  const [cleanerPriceExp, setCleanerPriceExp] = useState('190');
  const [cleanerAvailability, setCleanerAvailability] = useState<string[]>(['Manhã', 'Tarde']);

  // Role-Specific Fields - Support (Apoio Técnico)
  const [supportCategory, setSupportCategory] = useState<'Eletricista' | 'Encanador' | 'Chaveiro' | 'Pedreiro' | 'Pintor' | 'Manutenção Geral'>('Chaveiro');
  const [supportPriceRange, setSupportPriceRange] = useState('R$ 80 - R$ 200');
  const [supportAvailabilityText, setSupportAvailabilityText] = useState('Segunda a Sexta, horário comercial');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor, preencha todos os campos.');
      return;
    }

    const lowerEmail = loginEmail.toLowerCase();

    // Rossi Admin bypass ONLY for the official database admin email
    if (lowerEmail === 'cleanhost.oficial@gmail.com') {
      onLoginSuccess({
        id: 'admin-master',
        name: 'Rossi Admin',
        role: 'ADMIN',
        email: lowerEmail,
        extra: { isSuperAdmin: true }
      });
      return;
    }

    // Check custom users registered in memory database
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === lowerEmail);
    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== loginPassword) {
        setLoginError('Senha de acesso incorreta.');
        return;
      }
      onLoginSuccess({
        id: matchedUser.id,
        name: matchedUser.name,
        role: matchedUser.role,
        email: matchedUser.email,
        extra: matchedUser.extra || {}
      });
      return;
    }

    // Default error for any unrecognized credential in production
    setLoginError('Nenhuma conta correspondente a este e-mail foi encontrada no sistema. Se você acabou de se cadastrar, aguarde a aprovação inicial da nossa equipe.');
  };

  const handleCheckboxToggle = (val: string) => {
    if (cleanerAvailability.includes(val)) {
      setCleanerAvailability(prev => prev.filter(c => c !== val));
    } else {
      setCleanerAvailability(prev => [...prev, val]);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Common validations
    if (!regName || !regEmail || !regPhone || !regDocument || !regPassword) {
      setRegError('Por favor, preencha as informações básicas coletadas pela LGPD.');
      return;
    }

    if (!selectedRegRole) {
      setRegError('Por favor, selecione uma modalidade de perfil.');
      return;
    }

    if (selectedRegRole === 'ADMIN') {
      setRegError('Não é permitido criar uma conta sob a modalidade Administrador através do cadastro comum. Favor utilizar um e-mail de acesso previamente credenciado.');
      return;
    }

    // Email Syntax Validation
    if (!isValidEmail(regEmail)) {
      setRegError('E-mail em formato inválido. Por favor, forneça um endereço de e-mail real.');
      return;
    }

    // Phone Length/DDD Validation
    if (!isValidPhone(regPhone)) {
      setRegError('Telefone inválido. Forneça o DDD e o número completo (ex: 11999999999).');
      return;
    }

    // Receita Federal standard matching logic
    if (!isValidCPF(regDocument)) {
      setRegError('CPF inválido. Por favor, insira um CPF com os 11 dígitos verificados.');
      return;
    }

    // Password strength check
    if (regPassword.length < 6) {
      setRegError('A senha de acesso deve possuir pelo menos 6 caracteres.');
      return;
    }

    // Avoid duplicate accounts matching by Email
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (emailExists) {
      setRegError('Este e-mail de acesso já possui um cadastro no sistema CleanHost.');
      return;
    }

    // Avoid duplicate accounts matching by CPF
    const strippedCPF = regDocument.replace(/[^\d]+/g, '');
    const cpfExists = registeredUsers.some(u => u.document?.replace(/[^\d]+/g, '') === strippedCPF);
    if (cpfExists) {
      setRegError('Este CPF de titularidade já possui um cadastro no sistema.');
      return;
    }

    if (!regPhoto) {
      setRegError('A foto de rosto é obrigatória para o cadastro do perfil. Envie ou tire uma foto.');
      return;
    }

    if (!regCity) {
      setRegError('Por favor, selecione sua cidade.');
      return;
    }

    if (!regBairro) {
      setRegError('Por favor, informe seu bairro.');
      return;
    }

    const uniqueId = `${selectedRegRole.toLowerCase()}-${Date.now()}`;
    const registrationDate = new Date().toISOString();

    if (selectedRegRole === 'HOST') {
      // Validate first property details
      if (!hostPropName || !hostPropAddress) {
        setRegError('Insira os dados do seu primeiro imóvel Airbnb para que você possa agendar faxinas.');
        return;
      }

      let finalCity = regCity;
      let finalEstado = 'SP';
      if (regCity && regCity.includes('/')) {
        const parts = regCity.split('/');
        finalCity = parts[0];
        finalEstado = parts[1];
      }

      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        name: hostPropName,
        address: hostPropAddress,
        city: finalCity,
        estado: finalEstado,
        bairro: regBairro,
        cep: regCep,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        rooms: parseFloat(hostPropRooms) || 1,
        bathrooms: parseFloat(hostPropBathrooms) || 1,
        ownerId: uniqueId,
        ownerEmail: regEmail
      };

      // Add to main memory list
      onAddProperty(newProperty);

      onAddUser({
        id: uniqueId,
        name: regName,
        email: regEmail,
        role: 'HOST',
        password: regPassword,
        phone: regPhone,
        document: regDocument,
        photoUrl: regPhoto,
        city: regCity,
        bairro: regBairro,
        cep: regCep,
        createdAt: registrationDate,
        isApproved: false,
        approvalStatus: (regCity === 'Jundiaí/SP' || regCity === 'São Paulo/SP') ? 'pending' : 'LISTA_DE_ESPERA',
        status: (regCity === 'Jundiaí/SP' || regCity === 'São Paulo/SP') ? 'PENDENTE' : 'LISTA_DE_ESPERA'
      });

      setRegSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          id: uniqueId,
          name: regName,
          role: 'HOST',
          email: regEmail,
          extra: { phone: regPhone, document: regDocument, photoUrl: regPhoto }
        });
      }, 1500);

    } else if (selectedRegRole === 'CLEANER') {
      if (!regRegion || !regPixKey || !cleanerPriceStd) {
        setRegError('Preencha seu endereço de atuação, chave Pix para repasses e valores padrão.');
        return;
      }

      const newCleaner: Professional = {
        id: uniqueId,
        name: regName,
        photoUrl: regPhoto,
        document: regDocument,
        region: regRegion,
        pixKey: regPixKey,
        score: 100, // Starts at perfect score!
        rating: 5.0,
        totalServices: 0,
        availability: cleanerAvailability.length > 0 ? cleanerAvailability : ['Manhã', 'Tarde'],
        priceStandard: parseFloat(cleanerPriceStd) || 140,
        priceExpress: parseFloat(cleanerPriceExp) || 190,
        distanceKm: 0.5,
        isSuperCleaner: false,
        isApproved: false // Awaiting administrator manual validation
      };

      onAddProfessional(newCleaner);

      onAddUser({
        id: uniqueId,
        name: regName,
        email: regEmail,
        role: 'CLEANER',
        password: regPassword,
        phone: regPhone,
        document: regDocument,
        photoUrl: regPhoto,
        city: regCity,
        bairro: regBairro,
        cep: regCep,
        createdAt: registrationDate,
        isApproved: false,
        approvalStatus: (regCity === 'Jundiaí/SP' || regCity === 'São Paulo/SP') ? 'pending' : 'LISTA_DE_ESPERA',
        status: (regCity === 'Jundiaí/SP' || regCity === 'São Paulo/SP') ? 'PENDENTE' : 'LISTA_DE_ESPERA',
        extra: { cleanerId: uniqueId }
      });
      
      setRegSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          id: uniqueId,
          name: regName,
          role: 'CLEANER',
          email: regEmail,
          extra: { cleanerId: uniqueId, photoUrl: regPhoto }
        });
      }, 1500);

    } else if (selectedRegRole === 'SUPPORT') {
      if (!regRegion || !regPixKey) {
        setRegError('Preencha a região de atendimento técnico e chave Pix de pagamento.');
        return;
      }

      const newSupport: SupportProfessional = {
        id: uniqueId,
        name: regName,
        category: supportCategory,
        phone: regPhone,
        region: regRegion,
        availability: supportAvailabilityText,
        rating: 5.0,
        completedJobs: 0,
        pixKey: regPixKey,
        estimatedPriceRange: supportPriceRange,
        logoColor: 'bg-indigo-100 text-indigo-600'
      };

      onAddSupportProfessional(newSupport);

      onAddUser({
        id: uniqueId,
        name: regName,
        email: regEmail,
        role: 'SUPPORT',
        password: regPassword,
        phone: regPhone,
        document: regDocument,
        photoUrl: regPhoto,
        city: regCity,
        bairro: regBairro,
        cep: regCep,
        createdAt: registrationDate,
        isApproved: false,
        approvalStatus: (regCity === 'Jundiaí/SP' || regCity === 'São Paulo/SP') ? 'pending' : 'LISTA_DE_ESPERA',
        status: (regCity === 'Jundiaí/SP' || regCity === 'São Paulo/SP') ? 'PENDENTE' : 'LISTA_DE_ESPERA'
      });

      setRegSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          id: uniqueId,
          name: regName,
          role: 'SUPPORT',
          email: regEmail,
          extra: { photoUrl: regPhoto }
        });
      }, 1500);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto my-6 bg-white rounded-3xl border border-blue-50 shadow-lg overflow-hidden grid md:grid-cols-12 min-h-[600px] animate-fade-in">
      
      {/* Dynamic left decorative info panel */}
      <div className="md:col-span-5 bg-gradient-to-br from-[#0B1F33] via-[#091C2D] to-[#0A66FF] p-8 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="space-y-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl inline-block">
            <Logo size="sm" showSlogan={false} />
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white leading-tight">
              Mais Praticidade, Menos Preocupação e Reservas Sem Estresse!
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              A CleanHost conecta proprietários aos melhores profissionais de limpeza e rede de apoio técnico da sua região. Imóvel pronto em minutos, inteligência e tranquilidade para o seu bolso.
            </p>
          </div>
        </div>

        {/* 🚀 Bloco Fase de Lançamento */}
        <div className="bg-white/10 border border-white/10 p-4 rounded-2xl space-y-2 relative z-10 mt-4">
          <h4 className="text-xs font-black text-[#12D6C5] flex items-center gap-1.5 font-display uppercase tracking-wider">
            🚀 Fase de Lançamento CleanHost
          </h4>
          <p className="text-[11px] text-slate-200 leading-normal">
            Os primeiros usuários participarão da construção da plataforma e terão acesso aos benefícios e taxas reduzidas da fase inicial.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[9px] font-mono text-slate-300">
            <div>
              <span className="block text-slate-400 font-sans uppercase">Taxa Parcerias Faxina:</span>
              <strong className="text-white text-xs">{financeSettings?.cleanerFee ?? 5}%</strong>
            </div>
            <div>
              <span className="block text-slate-400 font-sans uppercase">Taxa Apoio Técnico:</span>
              <strong className="text-white text-xs">{financeSettings?.supportFee ?? 3}%</strong>
            </div>
          </div>
        </div>

        {/* Dynamic tips inside dark panel */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 relative z-10">
          <div className="flex gap-2.5 items-start">
            <span className="text-base text-[#12D6C5]">🧹</span>
            <div>
              <h4 className="text-[11px] font-bold text-white font-display">Mais Oportunidades &amp; Clientes</h4>
              <p className="text-[9px] text-slate-300 leading-tight">Preencha sua agenda com faxinas agendadas de forma recorrente e simplificada.</p>
            </div>
          </div>
          
          <div className="flex gap-2.5 items-start">
            <span className="text-base text-emerald-400">⚡</span>
            <div>
              <h4 className="text-[11px] font-bold text-white font-display">Suporte Técnico Agência</h4>
              <p className="text-[9px] text-slate-300 leading-tight">Rede de apoio de resposta rápida para intervenções urgentes de elétrica, hidráulica e chaveiro.</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <span className="text-base text-[#12D6C5]">🎁</span>
            <div>
              <h4 className="text-[11px] font-bold text-white font-display">Programa de Fidelidade</h4>
              <p className="text-[9px] text-slate-300 leading-tight">Ciclo de 10 chamados garante o 11º serviço técnico ou de faxina com taxa ZERO!</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-[9px] text-slate-400 font-mono flex items-center gap-1 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-[#12D6C5]" />
          <span>Segurança e transparência total de ponta a ponta</span>
        </div>
      </div>

      {/* Main interaction panels */}
      <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Main Top Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-2">
            <button
              onClick={() => { setActiveTab('login'); setRegSuccess(false); }}
              className={`flex-1 cursor-pointer py-2.5 text-xs font-bold font-display rounded-xl transition-all ${activeTab === 'login' ? 'bg-[#0B1F33] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
            >
              🔑 Entrar
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegSuccess(false); }}
              className={`flex-1 cursor-pointer py-2.5 text-xs font-bold font-display rounded-xl transition-all ${activeTab === 'register' ? 'bg-[#0B1F33] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
            >
              ✨ Criar Nova Conta
            </button>
          </div>

          {activeTab === 'login' ? (
            /* ================= LOGIN VIEW ================= */
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black font-display text-[#0B1F33]">Digite seu acesso</h3>
                <p className="text-xs text-gray-500">Acesse sua carteira e gerencie as faxinas de seus imóveis.</p>
              </div>

              {loginError && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2 border border-rose-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ex: host@airbnb.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0A66FF] focus:bg-white pl-10 pr-4 py-2.5 rounded-2xl text-xs outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Senha de Acesso</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0A66FF] focus:bg-white pl-10 pr-10 py-2.5 rounded-2xl text-xs outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0A66FF] hover:bg-blue-700 text-white font-bold font-display text-xs py-3 rounded-2xl transition-all shadow-xs flex justify-center items-center gap-2 cursor-pointer mt-2"
                >
                  Confirmar Acesso
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Production Mode Helpful Notice */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[#0B1F33]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">🏢</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0B1F33]">Plataforma CleanHost</span>
                  </div>
                  <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                    Ambiente corporativo seguro para credenciamento de profissionais de faxina, anfitriões, clientes e parceiros técnicos locais do mercado de curta-temporada.
                  </p>
                  <p className="text-[10px] mt-1.5 text-slate-500">
                    Se você é novo(a) por aqui, utilize a aba de cadastro <strong>"Criar Nova Conta"</strong> acima para registrar seus dados cadastrais. Seus dados estarão sujeitos à homologação.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* ================= SIGN UP / REGISTER VIEW ================= */
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-black font-display text-[#0B1F33]">Crie seu primeiro acesso</h3>
                <p className="text-xs text-gray-500">Cadastre-se na rede que transforma a logística de curtas estadias.</p>
              </div>

              {regSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-3xl text-sm font-semibold flex flex-col items-center justify-center text-center border border-emerald-100 space-y-2 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-spin" />
                  <span className="font-display font-bold text-base mt-2">Parabéns! Conta registrada com sucesso.</span>
                  <p className="text-xs font-normal text-emerald-700">Fazendo login e sincronizando seus dados na nuvem...</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  
                  {regError && (
                    <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2 border border-rose-100">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Primary Registration Role Switcher */}
                  <div className="space-y-1 pb-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Qual sua modalidade de uso?</label>
                    <div className="grid shadow-2xs grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setSelectedRegRole('HOST'); setRegError(''); }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center ${selectedRegRole === 'HOST' ? 'bg-[#0A66FF] text-white shadow-xs' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                      >
                        🏠 Anfitrião / Cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedRegRole('CLEANER'); setRegError(''); }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center ${selectedRegRole === 'CLEANER' ? 'bg-[#0A66FF] text-white shadow-xs' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                        title="Profissional de Limpeza"
                      >
                        🧹 Cleaner / Faxina
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedRegRole('SUPPORT'); setRegError(''); }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center ${selectedRegRole === 'SUPPORT' ? 'bg-[#0A66FF] text-white shadow-xs' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                        title="Rede de Apoio"
                      >
                        🛠️ Apoio Técnico
                      </button>
                    </div>
                  </div>

                  {/* STEP 1: GENERAL PERSONAL DETAILS (FOR ALL ROLES) */}
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Passo 1: Dados Pessoais</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block">Nome Completo</label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block">E-mail</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="Ex: joao@email.com"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block">WhatsApp / Celular</label>
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="Ex: (19) 98800-1234"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block">CPF / Documento</label>
                        <input
                          type="text"
                          value={regDocument}
                          onChange={(e) => setRegDocument(e.target.value)}
                          placeholder="Ex: 345.198.880-12"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 block">Defina uma Senha</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-semibold"
                      />
                    </div>

                    {/* Cidade, Bairro e CEP (Para proximidade) */}
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Região de Atuação (Geolocalização / Proximidade)</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500 block">Cidade <span className="text-rose-500">*</span></label>
                          <select
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-semibold text-slate-800"
                          >
                             <option value="">Selecione...</option>
                            <option value="Jundiaí/SP">Jundiaí/SP (Ativa)</option>
                            <option value="São Paulo/SP">São Paulo/SP (Ativa)</option>
                            <option value="Campinas/SP">Campinas/SP</option>
                            <option value="Sorocaba/SP">Sorocaba/SP</option>
                            <option value="Indaiatuba/SP">Indaiatuba/SP</option>
                            <option value="Itupeva/SP">Itupeva/SP</option>
                            <option value="Louveira/SP">Louveira/SP</option>
                            <option value="Vinhedo/SP">Vinhedo/SP</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500 block">Bairro <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            value={regBairro}
                            onChange={(e) => setRegBairro(e.target.value)}
                            placeholder="Ex: Anhangabaú"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500 block">CEP (Opcional)</label>
                          <input
                            type="text"
                            value={regCep}
                            onChange={(e) => setRegCep(e.target.value)}
                            placeholder="Ex: 13200-000"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none text-slate-800"
                          />
                        </div>
                      </div>

                      {regCity && regCity !== 'Jundiaí/SP' && regCity !== 'São Paulo/SP' && (
                        <div id="waitlist-toast" className="bg-amber-50 text-amber-950 border border-amber-200 rounded-xl p-3 text-[10px] leading-relaxed font-bold animate-fade-in">
                          ⚠️ Sua cidade ainda está em fase de expansão.
                          Cadastre-se agora para entrar na lista de espera e seja avisado quando a CleanHost chegar à sua região.
                        </div>
                      )}
                    </div>

                    {/* Foto de Rosto (Obrigatória) */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 block flex items-center justify-between">
                        <span>Foto de Rosto (Obrigatória) <span className="text-rose-500">*</span></span>
                        <span className="text-[8px] text-slate-400 bg-slate-100 font-mono px-1.5 py-0.5 rounded-sm">Segurança &amp; LGPD</span>
                      </label>
                      
                      {regPhoto ? (
                        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-3xs">
                          <img 
                            src={regPhoto} 
                            alt="Sua foto de rosto" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 ring-4 ring-emerald-50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Foto Carregada!
                            </p>
                            <p className="text-[9px] text-gray-400 mt-0.5">Sua imagem será exibida para segurança das visitas e anfitriões.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRegPhoto('')}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-rose-100"
                            title="Remover foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all ${
                            isDragging 
                              ? 'border-[#0A66FF] bg-blue-50/50 scale-[0.99]' 
                              : 'border-slate-300 hover:border-[#0A66FF] bg-white'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePhotoUpload(e.target.files[0]);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="bg-slate-50 p-2.5 rounded-full text-slate-400 mb-1.5 border border-slate-100">
                            <Camera className="w-5 h-5 text-slate-500 animate-pulse" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">Arraste sua foto aqui ou <span className="text-[#0A66FF] underline">escolha um arquivo</span></p>
                          <p className="text-[9px] text-slate-400 mt-1 leading-tight">É obrigatório o envio de uma foto de rosto nítida para segurança.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 2: ROLE-SPECIFIC MANDATORY DETAILS */}
                  
                  {/* ANFITRIÃO / CLIENTE PATH DETAILS (PROPERTY DETAILS) */}
                  {selectedRegRole === 'HOST' && (
                    <div className="space-y-3 bg-[#0A66FF]/5 p-4 rounded-2xl border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-[#0A66FF] block tracking-wider">Passo 2: Dados do seu Imóvel ou Residência (Para Solicitar Serviços)</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-600 block">Apelido do Imóvel (Ex: Apartamento Copacabana, Minha Casa, Escritório)</label>
                        <input
                          type="text"
                          value={hostPropName}
                          onChange={(e) => setHostPropName(e.target.value)}
                          placeholder="Ex: Apartamento Beira Mar Copacabana"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-600 block">Endereço Completo</label>
                        <input
                          type="text"
                          value={hostPropAddress}
                          onChange={(e) => setHostPropAddress(e.target.value)}
                          placeholder="Ex: Av. Atlântica, 1420 - Apt 402"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Cidade</label>
                          <select
                            value={hostPropCity}
                            onChange={(e) => setHostPropCity(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-medium"
                          >
                            <option value="São Paulo">São Paulo</option>
                            <option value="Guarujá">Guarujá</option>
                            <option value="Rio de Janeiro">Rio de Janeiro</option>
                            <option value="Campinas">Campinas</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Quartos</label>
                          <select
                            value={hostPropRooms}
                            onChange={(e) => setHostPropRooms(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-medium"
                          >
                            <option value="1">1 Quarto</option>
                            <option value="2">2 Quartos</option>
                            <option value="3">3 Quartos</option>
                            <option value="4">4+ Quartos</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Banheiros</label>
                          <select
                            value={hostPropBathrooms}
                            onChange={(e) => setHostPropBathrooms(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-medium"
                          >
                            <option value="1">1 Banheiro</option>
                            <option value="1.5">1.5 Banheiros</option>
                            <option value="2">2 Banheiros</option>
                            <option value="3">3+ Banheiros</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PROFISSIONAL DE LIMPEZA DETAILS */}
                  {selectedRegRole === 'CLEANER' && (
                    <div className="space-y-4">
                      {/* 🎁 Programa Fidelidade CleanHost public content section */}
                      <div className="bg-emerald-600 text-white p-5 rounded-3xl border border-emerald-500 shadow-3xs space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎁</span>
                          <h4 className="text-sm font-black font-display text-white">Programa Fidelidade CleanHost</h4>
                        </div>
                        <p className="text-xs text-white leading-relaxed font-semibold">
                          A cada 10 serviços concluídos pela plataforma, o próximo serviço será realizado sem taxa de intermediação.
                        </p>
                        <p className="text-[11px] text-emerald-100 leading-tight font-sans">
                          Quanto mais você trabalha, mais benefícios recebe.
                        </p>
                        
                        {/* EXEMPLO VISUAL */}
                        <div className="bg-slate-950/30 p-4 rounded-2xl border border-white/10 space-y-2 mt-1">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#12D6C5] block font-bold">Exemplo Visual</span>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2 pt-1 border-t border-white/5">
                            <div className="space-y-0.5">
                              <span className="block font-black text-[#12D6C5] font-mono text-sm leading-none">10 de 10</span>
                              <span className="text-[9px] text-emerald-200 font-bold">serviços concluídos</span>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-emerald-100 font-black block">🎁 Próximo serviço = Taxa Zero</span>
                              <span className="text-[9px] text-white/70 italic block">O contador reinicia automaticamente.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Passo 2: Suas Regiões, Tarifas &amp; Pix (Todos os Dados)</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Bairros de Atuação (Região)</label>
                          <input
                            type="text"
                            value={regRegion}
                            onChange={(e) => setRegRegion(e.target.value)}
                            placeholder="Ex: Pinheiros e Vila Madalena"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Chave Pix para repasses</label>
                          <input
                            type="text"
                            value={regPixKey}
                            onChange={(e) => setRegPixKey(e.target.value)}
                            placeholder="Ex: CPF ou celular pix"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Valor Faxina Padrão (R$)</label>
                          <input
                            type="number"
                            value={cleanerPriceStd}
                            onChange={(e) => setCleanerPriceStd(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Valor Faxina Expressa (Urgente) (R$)</label>
                          <input
                            type="number"
                            value={cleanerPriceExp}
                            onChange={(e) => setCleanerPriceExp(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-600 block">Turnos Disponíveis</label>
                        <div className="flex gap-4">
                          {['Manhã', 'Tarde', 'Noite'].map((turno) => (
                            <label key={turno} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cleanerAvailability.includes(turno)}
                                onChange={() => handleCheckboxToggle(turno)}
                                className="rounded text-[#0A66FF]"
                              />
                              {turno}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    </div>
                  )}

                  {/* APOIO TÉCNICO REGISTRATION DETAILS */}
                  {selectedRegRole === 'SUPPORT' && (
                    <div className="space-y-3 bg-violet-500/5 p-4 rounded-2xl border border-violet-100">
                      <span className="text-[10px] uppercase font-bold text-violet-700 block tracking-wider">Passo 2: Categoria Técnica &amp; Cobrança (Todos os Dados)</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Sua Especialidade / Categoria</label>
                          <select
                            value={supportCategory}
                            onChange={(e) => setSupportCategory(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-medium"
                          >
                            <option value="Chaveiro">🔑 Chaveiro</option>
                            <option value="Encanador">💧 Encanador</option>
                            <option value="Eletricista">⚡ Eletricista</option>
                            <option value="Pintor">🎨 Pintor</option>
                            <option value="Pedreiro">🧱 Pedreiro</option>
                            <option value="Manutenção Geral">🛠️ Manutenção Geral</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Região de Atendimento</label>
                          <input
                            type="text"
                            value={regRegion}
                            onChange={(e) => setRegRegion(e.target.value)}
                            placeholder="Ex: Zona Oeste e Pinheiros"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Chave Pix para Recebimentos</label>
                          <input
                            type="text"
                            value={regPixKey}
                            onChange={(e) => setRegPixKey(e.target.value)}
                            placeholder="Chave Pix para repasses rápidos"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600 block">Estimativa de Preço Inicial (R$)</label>
                          <input
                            type="text"
                            value={supportPriceRange}
                            onChange={(e) => setSupportPriceRange(e.target.value)}
                            placeholder="Ex: R$ 80 - R$ 150"
                            className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-600 block">Disponibilidade (Horários)</label>
                        <input
                          type="text"
                          value={supportAvailabilityText}
                          onChange={(e) => setSupportAvailabilityText(e.target.value)}
                          placeholder="Ex: Sábado e Domingo 24h"
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}



                  <button
                    type="submit"
                    className="w-full bg-[#0B1F33] hover:bg-[#091C2D] text-white font-bold font-display text-xs py-3 rounded-2xl transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer mt-3"
                  >
                    Salvar Dados e Criar Conta
                    <CheckCircle2 className="w-4 h-4 text-[#12D6C5]" />
                  </button>

                </form>
              )}
            </div>
          )}

        </div>

        <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-gray-400">
          Problemas de conexão? Contate suporte direto 24h no <strong>(19) 98800-7880</strong>
        </div>
      </div>

    </div>

    {/* SEÇÃO PÚBLICA: CIDADES CLEANHOST & EXPANSÃO */}
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-0 font-sans space-y-12 animate-fade-in" id="public-landing-expansion">

      {/* 6. DESTACAR DIFERENCIAL DA CLEANHOST */}
      <div className="bg-[#0B1F33] text-white p-8 sm:p-10 rounded-3xl space-y-6 shadow-sm border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 text-white/5 font-black text-9xl pointer-events-none">⭐</div>
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] text-[#12D6C5] font-mono font-bold tracking-widest uppercase block">CONEXÃO E PRATICIDADE</span>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white">
            Tudo o que seu imóvel precisa em um só lugar.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            A CleanHost conecta de forma inteligente e ágil todos os profissionais necessários para manter seus imóveis sempre prontos para receber hóspedes reais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xl">🏠</span>
            <h4 className="text-xs font-black text-[#12D6C5] font-display uppercase tracking-wider">Anfitriões e Clientes</h4>
            <p className="text-[11px] text-slate-300">Proprietários e gestores de aluguel por temporada focados em avaliações 5 estrelas e taxa de ocupação máxima.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xl">🧹</span>
            <h4 className="text-xs font-black text-[#12D6C5] font-display uppercase tracking-wider">Profissionais de Limpeza</h4>
            <p className="text-[11px] text-slate-300">Cleaners homologados com checklists padronizados e preferências em chamados urgentes.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xl">🔧</span>
            <h4 className="text-xs font-black text-[#12D6C5] font-display uppercase tracking-wider">Rede de Apoio Especializada</h4>
            <p className="text-[11px] text-slate-300">Chaveiros, eletricistas e encanadores de prontidão para emergências graves durante a estadia.</p>
          </div>
        </div>
      </div>

      {/* 1. ADICIONAR SEÇÃO "POR QUE FAZER PARTE DA CLEANHOST" */}
      <div className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-base font-black text-[#0B1F33] uppercase tracking-wider font-display">
            🤝 Por que fazer parte da CleanHost?
          </h2>
          <p className="text-xs text-slate-500">
            Benefícios corporativos e operacionais sob medida para cada tipo de perfil de usuário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Anfitrião */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4 hover:border-blue-100 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-[#0A66FF]/10 text-[#0A66FF] w-10 h-10 rounded-2xl flex items-center justify-center text-xl">
                🏠
              </div>
              <h3 className="font-bold text-sm text-[#0B1F33] font-display">Anfitrião / Cliente</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Praticidade absoluta para gerenciar e preparar suas propriedades com suporte rápido de emergência 24h.
              </p>
            </div>
            <ul className="space-y-2 pt-3 border-t border-slate-50 text-[11px] text-slate-600 font-sans">
              <li className="flex items-center gap-1.5 font-semibold">✅ Contratação ultra-rápida</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Profissionais verificados próximos</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Rede de apoio para emergências</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Gestão do imóvel sem estresse</li>
            </ul>
          </div>

          {/* Card Cleaner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4 hover:border-emerald-100 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-emerald-500/10 text-emerald-600 w-10 h-10 rounded-2xl flex items-center justify-center text-xl">
                🧹
              </div>
              <h3 className="font-bold text-sm text-[#0B1F33] font-display">Profissional de Limpeza</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Aumente sua renda diária preenchendo sua agenda de serviços operacionais em sua própria região de atendimento.
              </p>
            </div>
            <ul className="space-y-2 pt-3 border-t border-slate-50 text-[11px] text-slate-600 font-sans">
              <li className="flex items-center gap-1.5 font-semibold">✅ Mais oportunidades de trabalho</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Carteira de clientes recorrentes</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Programa Fidelidade CleanHost</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Serviços próximos à sua residência</li>
            </ul>
          </div>

          {/* Card Rede Apoio */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4 hover:border-violet-100 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-violet-500/10 text-violet-600 w-10 h-10 rounded-2xl flex items-center justify-center text-xl">
                🛠️
              </div>
              <h3 className="font-bold text-sm text-[#0B1F33] font-display">Rede de Apoio</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Receba chamados frequentes de reparos, elétrica, hidráulica e chaveiro com pagamentos pix instantâneos.
              </p>
            </div>
            <ul className="space-y-2 pt-3 border-t border-slate-50 text-[11px] text-slate-600 font-sans">
              <li className="flex items-center gap-1.5 font-semibold">✅ Novos parceiros comerciais</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Atendimento focado na sua região</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Ampliação de carteira orgânica</li>
              <li className="flex items-center gap-1.5 font-semibold">✅ Alta recorrência operacional</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. DESTACAR PROGRAMA FIDELIDADE & 7. REFORÇAR CONFIANÇA */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">

        {/* Programa Fidelidade Card */}
        <div className="bg-emerald-600 text-white p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-emerald-500 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-emerald-700/20 font-black text-9xl pointer-events-none">🎁</div>
          <div className="space-y-2.5 relative z-10">
            <span className="bg-emerald-500 text-white font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
              Taxa Zero de Verdade
            </span>
            <h3 className="text-lg font-black font-display text-white">🎁 Programa Fidelidade CleanHost</h3>
            <p className="text-xs text-emerald-100 leading-relaxed font-semibold">
              A cada 10 serviços de faxina ou manutenção técnica concluídos integralmente pela plataforma, o próximo serviço terá taxa de intermediação operacional ZERO!
            </p>
          </div>

          {/* PROGRESS BAR MOCKUP */}
          <div className="bg-slate-950/30 p-4 rounded-2xl border border-white/10 space-y-2 relative z-10 mt-2">
            <span className="text-[8px] uppercase font-mono tracking-widest text-[#12D6C5] block font-black">Meta de Recompensa Mensal</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-emerald-200">
                <span>10 de 10 concluídos</span>
                <span className="text-[#12D6C5] font-black">Prêmio Ativo!</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-2 flex-1 rounded-sm bg-[#12D6C5]" title="Concluído"></div>
                ))}
              </div>
              <p className="text-[10px] text-white/80 italic font-medium leading-tight">
                Seu contador do programa de fidelidade é atualizado automaticamente ao fim de cada ciclo.
              </p>
            </div>
          </div>
        </div>

        {/* 7. REFORÇAR CONFIANÇA */}
        <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="bg-[#0B1F33] text-white font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
              Plataforma Blindada
            </span>
            <h3 className="text-lg font-black font-display text-[#0B1F33]">🔒 Segurança e Transparência</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trabalhamos com dados reais e processos transparentes e auditáveis para máxima segurança de todos os membros.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">👤 Usuários Aprovados</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Processo rigoroso de homologação de documentos.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">⭐ Avaliações Reais</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Feedbacks reais auditados após cada serviço prestado.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-150">
              <span className="text-xs font-bold text-slate-800 block">📋 Histórico Auditável</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Siga os checklists de conformidade do início ao fim.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-150">
              <span className="text-xs font-bold text-slate-800 block">🛡️ Reputação Orgânica</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Crescimento de destaque baseado nos seus resultados reais.</p>
            </div>
          </div>
        </div>

      </div>

      {/* CIDADES CLEANHOST & CONTADORES DE DEMANDA */}
      <div className="space-y-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-base font-black text-[#0B1F33] uppercase tracking-wider flex items-center justify-center md:justify-start gap-2 font-display">
            <span>📍</span> Cidades CleanHost &amp; Lista de Espera Real
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o termômetro de interesse operacional. Ativamos a cobertura com base no número total de cadastros reais em auditoria.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="cidades-grid-demand">
          {/* Active Cities */}
          {[
            'Jundiaí/SP', 'São Paulo/SP'
          ].map(cityName => {
            const metrics = getCityMetrics(cityName);
            return (
              <div key={cityName} className="bg-emerald-500/5 border-2 border-emerald-500 p-5 rounded-3xl space-y-4 shadow-3xs transition-transform hover:scale-[1.02] relative">
                <span className="absolute top-4 right-4 bg-emerald-600 text-white font-mono text-[8px] font-bold uppercase px-2 py-0.5 rounded-md">Ativa</span>
                <div>
                  <h3 className="font-extrabold text-xs text-[#0B1F33] flex items-center gap-1">✅ {cityName}</h3>
                  <p className="text-[9px] text-emerald-700 font-bold mt-1">Operações Liberadas 100%</p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-emerald-500/10 text-[10px] font-bold text-slate-600">
                  <div className="flex justify-between">
                    <span>🏠 Anfitriões/Cli:</span>
                    <span className="text-[#0B1F33] font-black">{metrics.hosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🧹 Faxinas:</span>
                    <span className="text-[#0B1F33] font-black">{metrics.cleaners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔧 Apoio Técnico:</span>
                    <span className="text-[#0B1F33] font-black">{metrics.support}</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-500/20 pt-1.5 text-[#0B1F33] font-black text-xs">
                    <span>Total Cadastros:</span>
                    <span className="text-emerald-700 font-mono text-xs">{metrics.total}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* List of Waiting Cities */}
          {[
            'Campinas/SP', 'Sorocaba/SP', 
            'Indaiatuba/SP', 'Itupeva/SP', 'Louveira/SP', 'Vinhedo/SP'
          ].map(cityName => {
            const metrics = getCityMetrics(cityName);
            return (
              <div key={cityName} className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-3xs transition-transform hover:scale-[1.01] relative">
                <span className="absolute top-4 right-4 bg-amber-105 text-amber-800 font-mono text-[8px] font-bold uppercase px-2 py-0.5 rounded-md border border-amber-200">Espera</span>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-800">🟡 {cityName}</h3>
                  <p className="text-[9px] text-slate-400 mt-1">Fase de Captação de Demanda</p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>🏠 Anfitriões/Cli:</span>
                    <span className="text-slate-800 font-black">{metrics.hosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🧹 Faxinas:</span>
                    <span className="text-slate-800 font-black">{metrics.cleaners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔧 Apoio Técnico:</span>
                    <span className="text-slate-800 font-black">{metrics.support}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 text-slate-800 font-black text-xs">
                     <span>Total Espera:</span>
                    <span className="text-[#0A66FF] font-mono text-xs">{metrics.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  </>
  );
}
