import React, { useState } from 'react';
import { X, FileText, Download, Printer, Share2, Check, Sparkles, Receipt } from 'lucide-react';
import { CleaningRequest } from '../types';
import Logo from './Logo';

interface ReceiptModalProps {
  request: CleaningRequest;
  isOpen: boolean;
  onClose: () => void;
  standardTax?: number;
  loyaltyTax?: number;
}

export default function ReceiptModal({ request, isOpen, onClose, standardTax = 12, loyaltyTax = 5 }: ReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!isOpen) return null;

  const taxRatePercent = request.price > 0 ? Math.round((request.appFee / request.price) * 100) : standardTax;
  const isLoyalRate = taxRatePercent <= loyaltyTax;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Create a file trigger
      const text = `
========================================
             CLEANHOST RECIBO
========================================
ID do Serviço: ${request.id}
Propriedade: ${request.propertyName}
Endereço: ${request.propertyAddress}
Tipo de Limpeza: ${request.type}
Data/Hora: ${new Date(request.dateTime).toLocaleString('pt-BR')}

Profissional Responsável: ${request.professionalName || 'Não atribuída'}
========================================
VALOR BRUTO: R$ ${request.price.toFixed(2)}
Taxa CleanHost Intermediação: R$ ${request.appFee.toFixed(2)} (${isLoyalRate ? `Tarifa Especial ${loyaltyTax}% Fidelidade` : `Tarifa Padrão ${standardTax}%`})
LÍQUIDO A RECEBER: R$ ${request.netValue.toFixed(2)}
========================================
Obrigado por utilizar o CleanHost!
"Seu imóvel pronto para o próximo hóspede"
Suporte Oficial WhatsApp: (19) 98800-7880
========================================
      `;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', `Recibo_CleanHost_${request.id}.txt`);
      tempLink.click();
    }, 1200);
  };

  const handleShare = () => {
    setSharing(true);
    const billingText = `*CleanHost Recibo - ${request.propertyName}*\n\n📅 Data: ${new Date(request.dateTime).toLocaleDateString('pt-BR')}\n🧹 Tipo: ${request.type}\n👤 Profissional: ${request.professionalName}\n💰 Bruto: R$ ${request.price.toFixed(2)}\n🔒 Taxa CleanHost (${taxRatePercent}%): R$ ${request.appFee.toFixed(2)}\n✨ Imóvel Pronto!`;
    navigator.clipboard.writeText(billingText).then(() => {
      setTimeout(() => {
        setSharing(false);
      }, 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-[#0B1F33] p-5 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#12D6C5]" />
            <h3 className="font-bold text-lg">Visualizar Recibo Oficial</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Printable Area */}
        <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto" id="printable-receipt" style={{ scrollbarWidth: 'thin' }}>
          <div className="border-4 border-dashed border-[#F4F7FA] p-6 rounded-2xl space-y-6 bg-slate-50 relative overflow-hidden">
            
            {/* Stamp */}
            <div className="absolute right-3 top-3 bg-emerald-50 text-emerald-600 border border-emerald-300 text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Pago
            </div>

            {/* Unified Logo design */}
            <div className="pb-4 border-b border-gray-250/60 flex justify-center">
              <Logo showSlogan={true} size="sm" />
            </div>

            {/* Service metadata */}
            <div className="space-y-3 text-xs text-[#0B1F33]">
              <div className="flex justify-between">
                <span className="text-gray-500">Número da Operação:</span>
                <span className="font-mono font-bold">{request.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data e Hora:</span>
                <span className="font-medium">
                  {new Date(request.dateTime).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Categoria:</span>
                <span className="font-medium bg-blue-100 text-[#0A66FF] px-2 py-0.5 rounded-sm">
                  {request.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Imóvel de Destino:</span>
                <span className="font-bold text-right max-w-[60%] truncate" title={request.propertyAddress}>
                  {request.propertyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Endereço:</span>
                <p className="text-right text-[11px] max-w-[60%] text-gray-600 italic leading-tight">
                  {request.propertyAddress}
                </p>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 mt-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={request.professionalPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80'} 
                    alt={request.professionalName} 
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-bold text-xs">{request.professionalName}</h5>
                    <p className="text-[10px] text-gray-500">Parceira de Limpeza</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-orange-600 bg-orange-50 font-semibold px-2 py-0.5 rounded-full">
                    Selo de Confiança ✦
                  </span>
                </div>
              </div>
            </div>

            {/* Values summary */}
            <div className="pt-4 border-t border-gray-200/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Valor Bruto Operado:</span>
                <span className="font-semibold text-gray-700">R$ {request.price.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-rose-600 bg-rose-50/50 p-1.5 rounded">
                <span className="text-[11px] flex items-center gap-1 font-medium">
                  Taxa Intermediação CleanHost ({isLoyalRate ? `${loyaltyTax}%` : `${standardTax}%`}):
                  {isLoyalRate && (
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-0.5">
                      <Sparkles className="w-2 h-2" /> Fidelidade
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold">- R$ {request.appFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center bg-[#0B1F33] text-white p-3 rounded-xl mt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#12D6C5]">Líquido Repassado:</span>
                <span className="text-lg font-mono font-black text-white">R$ {request.netValue.toFixed(2)}</span>
              </div>
            </div>

            {/* Note */}
            <p className="text-[10px] text-center text-gray-400 italic font-medium pt-2">
              CleanHost Intermediação Tecnológica LTDA - CNPJ: 45.922.880/0001-90
            </p>
          </div>
        </div>

        {/* Actions panel */}
        <div className="bg-[#F4F7FA] px-6 py-4 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <p className="text-[11px] text-[#0B1F33]/60 italic font-semibold text-center sm:text-left mb-2 sm:mb-0">
            Fidelidade: 11ª faxina reduz taxa a 5%
          </p>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-grow sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
              Fechar
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#0B1F33] hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-brand-blue" />
                  PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#0B1F33] hover:bg-gray-50 transition-colors cursor-pointer"
            >
               <Printer className="w-4 h-4 text-emerald-600" />
               Imprimir
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-[#0A66FF] text-white rounded-xl text-xs font-bold hover:bg-[#0051d4] transition-colors disabled:bg-emerald-600 disabled:opacity-100 cursor-pointer"
            >
              {sharing ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
