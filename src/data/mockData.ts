import { Property, Professional, SupportProfessional, CleaningRequest } from '../types';

export const mockProperties: Property[] = [];

export const mockProfessionals: Professional[] = [];

export const mockSupportProfessionals: SupportProfessional[] = [
  {
    id: 'sup-1',
    name: 'João Silva',
    category: 'Eletricista',
    phone: '(11) 98765-4321',
    region: 'Jundiaí/SP',
    availability: 'Disponível 24h para emergências',
    rating: 4.8,
    completedJobs: 52,
    pixKey: 'joao.eletricista@pix.com',
    bank: 'Banco Itaú',
    estimatedPriceRange: 'R$ 150 - R$ 300',
    logoColor: 'bg-yellow-50 text-yellow-600',
    status: 'Disponível',
    joinedDate: 'Janeiro de 2024 (Há mais de 2 anos)',
    biography: 'Eletricista residencial e industrial com mais de 10 anos de experiência. Especialista em diagnóstico rápido de curto-circuitos, instalação de fiação protegida, troca de disjuntores e reparação ágil de tomadas/interruptores para aluguel por temporada.',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    reviews: [
      { id: 'rev-1-1', raterName: 'Marisa P. (Anfitriã)', rating: 5, comment: 'Atendimento espetacular! Resolveu o curto da fiação em menos de 1 hora antes do meu hóspede chegar.', date: '2026-05-12' },
      { id: 'rev-1-2', raterName: 'Cláudio R. (Anfitrião)', rating: 4, comment: 'Muito profissional, recomendo fortemente para reparos ágeis.', date: '2026-05-10' }
    ]
  },
  {
    id: 'sup-2',
    name: 'Carlos Eduardo',
    category: 'Encanador',
    phone: '(11) 97654-3210',
    region: 'Jundiaí/SP',
    availability: 'Segunda a Sábado, 08h às 18h',
    rating: 4.9,
    completedJobs: 39,
    pixKey: 'carlos.encanador@pix.com',
    bank: 'Nubank',
    estimatedPriceRange: 'R$ 130 - R$ 280',
    logoColor: 'bg-blue-50 text-blue-600',
    status: 'Disponível',
    joinedDate: 'Março de 2024',
    biography: 'Especializado em detecção de vazamentos invisíveis, troca de reparos de válvulas hidra, substituição de torneiras, desentupimentos gerais e manutenção pneumática. Atendimento ágil com laudo de vazamento.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    reviews: [
      { id: 'rev-2-1', raterName: 'Paulo S. (Anfitrião)', rating: 5, comment: 'Encontrou um vazamento oculto no piso do banheiro super rápido. Economizou milhares de litros de água e taxas extras do condomínio.', date: '2026-06-02' }
    ]
  },
  {
    id: 'sup-3',
    name: 'Roberto Chaveiro',
    category: 'Chaveiro',
    phone: '(11) 96543-2109',
    region: 'São Paulo/SP',
    availability: 'Plantão 24 horas',
    rating: 4.7,
    completedJobs: 85,
    pixKey: 'roberto.chaveiro@pix.com',
    bank: 'Banco Cora IP',
    estimatedPriceRange: 'R$ 100 - R$ 200',
    logoColor: 'bg-emerald-50 text-emerald-600',
    status: 'Ocupado',
    joinedDate: 'Novembro de 2023',
    biography: 'Chaveiro residencial com foco em fechaduras eletrônicas, instalação de fechaduras biométricas para Airbnb, cópias de chaves codificadas e aberturas emergenciais em menos de 30 minutos na região metropolitana.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    reviews: [
      { id: 'rev-3-1', raterName: 'Gisela A. (Anfitriã)', rating: 5, comment: 'Hóspede perdeu as chaves às 23h de um domingo e o Roberto abriu e trocou o segredo com suprema agilidade.', date: '2026-05-28' }
    ]
  },
  {
    id: 'sup-4',
    name: 'Ana Pintora',
    category: 'Pintor',
    phone: '(11) 95432-1098',
    region: 'Jundiaí/SP',
    availability: 'Segunda a Sexta, Horário comercial',
    rating: 5.0,
    completedJobs: 15,
    pixKey: 'ana.pinturas@pix.com',
    bank: 'Banco Inter',
    estimatedPriceRange: 'R$ 200 - R$ 450 (diária)',
    logoColor: 'bg-pink-50 text-pink-600',
    status: 'Disponível',
    joinedDate: 'Julho de 2024',
    biography: 'Pintura residencial fina, especialista em retoques rápidos pós-estadia, aplicação de papel de parede, texturização, impermeabilização de paredes úmidas de áreas comuns com produtos especiais sem odor.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    reviews: [
      { id: 'rev-4-1', raterName: 'Carlos M. (Gestor)', rating: 5, comment: 'Excelente trabalho na repintura da sala de estar para as fotos profissionais. Uso tinta ecológica sem cheiro para alugar no dia seguinte.', date: '2026-06-01' }
    ]
  },
  {
    id: 'sup-5',
    name: 'Marcos Pedreiro',
    category: 'Pedreiro',
    phone: '(11) 94321-0987',
    region: 'Jundiaí/SP',
    availability: 'Flexível, sob agendamento',
    rating: 4.6,
    completedJobs: 28,
    pixKey: 'marcos.pedreiro@pix.com',
    bank: 'Caixa Econômica',
    estimatedPriceRange: 'R$ 180 - R$ 350 (diária)',
    logoColor: 'bg-violet-50 text-violet-600',
    status: 'Disponível',
    joinedDate: 'Fevereiro de 2024',
    biography: 'Reparos de azulejos, colocação de cerâmica trincada em banheiros e cozinhas, pequenos remendos de reboco e alvenaria geral com alto padrão de limpeza pós-trabalho.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    reviews: [
      { id: 'rev-5-1', raterName: 'Diana T. (Anfitriã)', rating: 4, comment: 'Pedreiro exemplar. Refez o rodapé danificado em tempo recorde e limpou tudo perfeitamente após a secagem.', date: '2026-04-15' }
    ]
  }
];

export const mockRequests: CleaningRequest[] = [];
