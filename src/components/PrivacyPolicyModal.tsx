import React from 'react';
import { Shield, X, Lock, CheckCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B1F33] text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#12D6C5]" />
            <h2 className="text-lg font-bold tracking-tight">Termos de Uso &amp; Política de Privacidade LGPD</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#0B1F33]/80 leading-relaxed">
          <div className="bg-[#F4F7FA] p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-[#0A66FF]">
            <Lock className="w-5 h-5 text-[#0A66FF] flex-shrink-0" />
            <p className="text-xs text-[#0B1F33] font-medium font-mono">
              Última atualização: Maio de 2026. Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-[#0B1F33] text-base">1. Natureza da Plataforma (Intermediação Tecnológica)</h3>
            <p>
              A <strong>CleanHost</strong> atua <strong>exclusivamente como intermediadora tecnológica</strong> entre anfitriões (locatários ou proprietários de imóveis de temporada) e profissionais autônomos de limpeza ou manutenção geral (Rede de Apoio). 
            </p>
            <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded">
              A responsabilidade civil, tributária e trabalhista decorrente da execução dos serviços pertence integralmente e exclusivamente aos profissionais cadastrados e aos usuários tomadores de serviço que os contratarem. A CleanHost não possui vínculo empregatício com nenhum profissional cadastrado.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-[#0B1F33] text-base">2. Proteção de Dados e LGPD</h3>
            <p>
              Processamos dados de caráter pessoal com o objetivo de conectar as partes, facilitar transações eletrônicas e geolocalização em tempo real. Os seus dados de perfil comercial são exibidos somente para conectar orçamentos e assegurar a prestação do serviço contratado.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Dados coletados:</strong> Nome completo, e-mail, telefone/WhatsApp, foto de identificação, geolocalização em tempo real (para correspondência de serviços mais próximos), chaves Pix e dados do imóvel.</li>
              <li><strong>Finalidade:</strong> Execução das solicitações de limpeza expressa, faturamento de taxas de intermediação, avaliações mútuas e suporte imediato.</li>
              <li><strong>Direitos do Usuário:</strong> Você pode, a qualquer momento, solicitar a exclusão de sua conta e dos dados pessoais armazenados enviando uma mensagem ao Suporte Operacional.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-[#0B1F33] text-base">3. Regras de Uso e Suspensão de Contas</h3>
            <p>
              As contas dos profissionais ou anfitriões serão imediatamente suspensas ou canceladas em caso de:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-red-700">
              <li>Múltiplos cancelamentos injustificados sem aviso prévio de 4 horas;</li>
              <li>Comportamento que viole as diretrizes de integridade física ou moral da comunidade CleanHost;</li>
              <li>Oferecimento de fraudes, contatos fora do app para burlar a taxa de intermediação de 12%;</li>
              <li>Uso indevido das fotos de checklist enviadas antes ou depois da limpeza.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-[#0B1F33] text-base">4. Pagamentos, Recibos e Taxas Operacionais</h3>
            <p>
              A CleanHost cobra uma comissão padrão de <strong>12%</strong> sobre o valor bruto das limpezas executadas na plataforma e <strong>10%</strong> para serviços da Rede de Apoio.
            </p>
            <p>
              <strong>Fidelização de Profissionais:</strong> Como benefício de recorrência operacional, após o profissional completar 10 faxinas ou serviços com sucesso no aplicativo, a 11ª operação e as seguintes terão a taxa de administração reduzida para apenas <strong>5%</strong>, incentivando a fidelização e a permanência de profissionais de alto desempenho.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-[#0B1F33] text-base">5. Propriedade Intelectual</h3>
            <p>
              Todo o conteúdo disponível no aplicativo CleanHost, incluindo o ícone de casa moderna estilizada com brilhos/ondas, logomarca oficial, designs, slogans e softwares são de propriedade exclusiva da CleanHost Tecnologia Ltda. O uso não autorizado constitui infração jurídica punível civil e criminalmente.
            </p>
          </section>

          <section className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Ao utilizar a CleanHost, você concorda expressamente com os presentes termos.</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F4F7FA] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0A66FF] hover:bg-[#0052D4] text-white font-semibold rounded-xl text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
}
