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
}

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
  hideDemoControls = false
}: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRegRole, setSelectedRegRole] = useState<UserRole>('HOST');
  const [showPassword, setShowPassword] = useState(false);

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

    // Sócio-Administrador bypass ONLY for the official database admin email
    if (lowerEmail === 'cleanhost.oficial@gmail.com') {
      onLoginSuccess({
        id: 'admin-master',
        name: 'Sócio-Administrador HQ',
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

    const uniqueId = `${selectedRegRole.toLowerCase()}-${Date.now()}`;
    const registrationDate = new Date().toISOString();

    if (selectedRegRole === 'HOST') {
      // Validate first property details
      if (!hostPropName || !hostPropAddress) {
        setRegError('Insira os dados do seu primeiro imóvel Airbnb para que você possa agendar faxinas.');
        return;
      }

      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        name: hostPropName,
        address: hostPropAddress,
        city: hostPropCity,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        rooms: parseFloat(hostPropRooms) || 1,
        bathrooms: parseFloat(hostPropBathrooms) || 1
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
        city: regCity || hostPropCity || 'São Paulo',
        createdAt: registrationDate,
        isApproved: false,
        approvalStatus: 'pending'
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
        city: regCity || 'São Paulo',
        createdAt: registrationDate,
        isApproved: false,
        approvalStatus: 'pending',
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
        city: regCity || 'São Paulo',
        createdAt: registrationDate,
        isApproved: false,
        approvalStatus: 'pending'
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
              Profissionais confiáveis para manter seu imóvel sempre pronto.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Limpeza, manutenção e suporte rápido para anfitriões e proprietários.
            </p>
          </div>
        </div>

        {/* Dynamic tips inside dark panel */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4 relative z-10">
          <div className="flex gap-3 items-start">
            <span className="text-lg text-[#12D6C5]">🧹</span>
            <div>
              <h4 className="text-xs font-bold text-white font-display">Checklists Padronizados</h4>
              <p className="text-[10px] text-slate-300 leading-tight">Chega de surpresas nas notas do aplicativo de aluguel.</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <span className="text-lg text-emerald-400">⚡</span>
            <div>
              <h4 className="text-xs font-bold text-white font-display">Suporte e Reparos em 2h</h4>
              <p className="text-[10px] text-slate-300 leading-tight">Canos estourados, vazamentos e fechaduras com chaveiro ágil.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-lg text-[#12D6C5]">🎁</span>
            <div>
              <h4 className="text-xs font-bold text-white font-display">Programa de Fidelidade</h4>
              <p className="text-[10px] text-slate-300 leading-tight">Reduza sua taxa de intermediação operacional de 12% para apenas 5%.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-[9px] text-slate-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#12D6C5]" />
          <span>Acesso criptografado em conformidade com a LGPD</span>
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
  );
}
