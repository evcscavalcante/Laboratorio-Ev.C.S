/**
 * Cabeçalho Profissional para Ensaios Geotécnicos
 * Layout igual ao PDF conforme especificação
 */

import React from 'react';

interface TestHeaderProps {
  testType: 'densidade-in-situ' | 'densidade-real' | 'densidade-max-min';
  operador?: string;
  responsavelCalculo?: string;
  verificador?: string;
  data?: string;
  hora?: string;
  material?: string;
  origem?: string;
  registro?: string;
  norte?: string;
  este?: string;
  cota?: string;
  local?: string;
  quadrante?: string;
  camada?: string;
  estaca?: string;
  fvs?: string;
  nomeAmostra?: string;
  regSalum?: string;
  tempo?: any;
  amostreaReensaiada?: any;
  dispositivosPrecisao?: any;
  
  // Callbacks para tornar os campos funcionais
  onOperadorChange?: (value: string) => void;
  onResponsavelCalculoChange?: (value: string) => void;
  onVerificadorChange?: (value: string) => void;
  onDataChange?: (value: string) => void;
  onHoraChange?: (value: string) => void;
  onMaterialChange?: (value: string) => void;
  onOrigemChange?: (value: string) => void;
  onRegistroChange?: (value: string) => void;
  onNorteChange?: (value: string) => void;
  onEsteChange?: (value: string) => void;
  onCotaChange?: (value: string) => void;
  onQuadranteChange?: (value: string) => void;
  onCamadaChange?: (value: string) => void;
  onEstacaChange?: (value: string) => void;
  onFvsChange?: (value: string) => void;
}

export default function TestHeader({
  testType,
  operador = '',
  responsavelCalculo = '',
  verificador = '',
  data = '',
  hora = '',
  material = '',
  origem = '',
  registro = '',
  norte = '',
  este = '',
  quadrante = '',
  camada = '',
  estaca = '',
  fvs = '',
  onOperadorChange,
  onResponsavelCalculoChange,
  onVerificadorChange,
  onDataChange,
  onHoraChange,
  onMaterialChange,
  onOrigemChange,
  onRegistroChange,
  onNorteChange,
  onEsteChange,
  onCotaChange,
  onQuadranteChange,
  onCamadaChange,
  onEstacaChange,
  onFvsChange
}: TestHeaderProps) {

  const getTestTitle = () => {
    switch (testType) {
      case 'densidade-in-situ':
        return 'MASSA ESPECÍFICA APARENTE\nIN SITU\nNBR 9813:2021';
      case 'densidade-real':
        return 'MASSA ESPECÍFICA DOS SÓLIDOS\nNBR 17212:2025';
      case 'densidade-max-min':
        return 'ÍNDICES DE VAZIOS\nMÁXIMO E MÍNIMO\nNBR 12004:2021 e NBR 12051:2021';
      default:
        return 'ENSAIO GEOTÉCNICO';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-1 md:p-2 mb-4 shadow-sm">
      {/* Cabeçalho otimizado para mobile */}
      <div className="flex flex-col md:grid md:grid-cols-3 items-center mb-4 pb-3 border-b border-blue-300">
        {/* Mobile: Logo centralizado */}
        <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
          <img 
            src="/attached_assets/file_00000000233061f898ea05ffe6a1752e_1749721558008.png" 
            alt="Laboratório Ev.C.S" 
            className="h-8 md:h-16 w-auto"
          />
        </div>
        
        {/* Título do ensaio */}
        <div className="text-center mb-2 md:mb-0">
          <h1 className="text-sm md:text-lg font-bold text-blue-900 whitespace-pre-line leading-tight">
            {getTestTitle()}
          </h1>
        </div>
        
        {/* Desktop: Info do laboratório (oculta no mobile) */}
        <div className="hidden md:flex justify-end">
          <div className="text-right">
            <div className="text-sm font-bold text-blue-900">LABORATÓRIO EV.C.S</div>
            <div className="text-xs text-blue-700">Sistema Geotécnico</div>
            <div className="text-xs text-blue-700">ABNT NBR Certificado</div>
          </div>
        </div>
      </div>

      {/* Informações principais - Mobile-first responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-4">
        {/* Coluna 1 - Dados principais */}
        <div className="border border-blue-200 rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_2fr] text-xs md:text-sm">
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Registro:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={registro}
                onChange={(e) => onRegistroChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs md:text-sm"
                placeholder="DIS-001"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Data:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="date" 
                value={data}
                onChange={(e) => onDataChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs md:text-sm"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Hora:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="time" 
                value={hora}
                onChange={(e) => onHoraChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs md:text-sm"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Operador:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={operador}
                onChange={(e) => onOperadorChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Resp. Técnico:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={responsavelCalculo}
                onChange={(e) => onResponsavelCalculoChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-blue-50 p-2 border-r border-blue-200 font-medium text-blue-900">Verificador:</div>
            <div className="p-2">
              <input 
                type="text" 
                value={verificador}
                onChange={(e) => onVerificadorChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
          </div>
        </div>

        {/* Coluna 2 - Dados técnicos */}
        <div className="border border-blue-200 rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_2fr] text-xs md:text-sm">
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Material:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={material}
                onChange={(e) => onMaterialChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Origem:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={origem}
                onChange={(e) => onOrigemChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Coordenadas:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={`${norte || ''} ${este || ''}`.trim()}
                onChange={(e) => {
                  const coords = e.target.value.split(' ');
                  onNorteChange?.(coords[0] || '');
                  onEsteChange?.(coords[1] || '');
                }}
                className="w-full bg-transparent border-none outline-none"
                placeholder="Norte Este"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Quadrante:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={quadrante}
                onChange={(e) => onQuadranteChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-blue-50 p-2 border-b border-r border-blue-200 font-medium text-blue-900">Camada:</div>
            <div className="p-2 border-b border-blue-200">
              <input 
                type="text" 
                value={camada}
                onChange={(e) => onCamadaChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-blue-50 p-2 border-r border-blue-200 font-medium text-blue-900">Estaca:</div>
            <div className="p-2">
              <input 
                type="text" 
                value={estaca}
                onChange={(e) => onEstacaChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}