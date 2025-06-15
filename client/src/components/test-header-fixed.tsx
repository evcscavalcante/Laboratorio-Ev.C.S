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
  quadrante?: string;
  camada?: string;
  fvs?: string;
  
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
  onQuadranteChange?: (value: string) => void;
  onCamadaChange?: (value: string) => void;
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
  onQuadranteChange,
  onCamadaChange,
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
    <div className="bg-white border border-gray-300 p-4 mb-6 print:mb-4">
      {/* Cabeçalho com logo oficial e título - Layout igual ao PDF */}
      <div className="grid grid-cols-3 items-center mb-4 pb-3 border-b border-gray-300">
        <div className="flex items-center">
          <img 
            src="/attached_assets/file_00000000233061f898ea05ffe6a1752e_1749721558008.png" 
            alt="Laboratório Ev.C.S" 
            className="h-16 w-auto"
          />
        </div>
        
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 whitespace-pre-line">
            {getTestTitle()}
          </h1>
        </div>
        
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">LABORATÓRIO EV.C.S</div>
            <div className="text-xs text-gray-600">Sistema Geotécnico</div>
            <div className="text-xs text-gray-600">ABNT NBR Certificado</div>
          </div>
        </div>
      </div>

      {/* Informações principais - Layout igual ao PDF (duas colunas lado a lado) */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Coluna 1 - Dados pessoais */}
        <div className="border border-gray-300">
          <div className="grid grid-cols-2 text-sm">
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Registro:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={registro}
                onChange={(e) => onRegistroChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Data:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="date" 
                value={data}
                onChange={(e) => onDataChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Horário:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="time" 
                value={hora}
                onChange={(e) => onHoraChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Operador:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={operador}
                onChange={(e) => onOperadorChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Resp. Técnico:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={responsavelCalculo}
                onChange={(e) => onResponsavelCalculoChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-r border-gray-300 font-medium">Verificador:</div>
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
        <div className="border border-gray-300">
          <div className="grid grid-cols-2 text-sm">
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Material:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={material}
                onChange={(e) => onMaterialChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Origem:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={origem}
                onChange={(e) => onOrigemChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Coordenadas:</div>
            <div className="p-2 border-b border-gray-300">
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
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Quadrante:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={quadrante}
                onChange={(e) => onQuadranteChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-b border-r border-gray-300 font-medium">Camada:</div>
            <div className="p-2 border-b border-gray-300">
              <input 
                type="text" 
                value={camada}
                onChange={(e) => onCamadaChange?.(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
                placeholder="-"
              />
            </div>
            <div className="bg-gray-100 p-2 border-r border-gray-300 font-medium">Volume:</div>
            <div className="p-2">
              <input 
                type="text" 
                value={fvs}
                onChange={(e) => onFvsChange?.(e.target.value)}
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