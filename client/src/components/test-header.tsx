/**
 * Cabeçalho Profissional para Ensaios Geotécnicos
 * Baseado no padrão mostrado pelo usuário
 */

import React from 'react';

interface TestHeaderProps {
  testType: 'densidade-in-situ' | 'densidade-real' | 'densidade-max-min';
  operador?: string;
  responsavelCalculo?: string;
  verificador?: string;
  data?: string;
  norte?: string;
  este?: string;
  cota?: string;
  quadrante?: string;
  camada?: string;
  fvs?: string;
  material?: string;
  origem?: string;
  registro?: string;
  hora?: string;
  nomeAmostra?: string;
  regSalum?: string;
  local?: string;
  tempo?: {
    sol?: boolean;
    chuvaFraca?: boolean;
    chuvaForte?: boolean;
    nublado?: boolean;
  };
  amostreaReensaiada?: {
    sim?: boolean;
    nao?: boolean;
  };
  dispositivosPrecisao?: {
    balanca?: string;
    estufa?: string;
    termometro?: string;
    cronometro?: string;
  };
}

const TestHeader: React.FC<TestHeaderProps> = ({
  testType,
  operador = '',
  responsavelCalculo = '',
  verificador = '',
  data = '',
  norte = '',
  este = '',
  cota = '',
  quadrante = '',
  camada = '',
  fvs = '',
  material = '',
  origem = '',
  registro = '',
  hora = '',
  nomeAmostra = '',
  regSalum = '',
  local = '',
  tempo = {},
  amostreaReensaiada = {},
  dispositivosPrecisao = {}
}) => {
  const getTestTitle = () => {
    switch (testType) {
      case 'densidade-in-situ':
        return 'MASSA ESPECÍFICA APARENTE IN SITU\nNBR 9813:2021';
      case 'densidade-real':
        return 'MASSA ESPECÍFICA REAL DOS GRÃOS\nNBR 6457:2024; NBR 17212:2025';
      case 'densidade-max-min':
        return 'ÍNDICES DE VAZIOS MÁXIMO E MÍNIMO\nNBR 12004:2021; NBR 12051:2021';
      default:
        return 'ENSAIO GEOTÉCNICO';
    }
  };

  const renderTempoSection = () => (
    <div className="flex items-center gap-4">
      <span className="font-medium">TEMPO</span>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            checked={tempo.sol || false} 
            readOnly 
            className="w-4 h-4"
          />
          <span className="text-sm">SOL FORTE</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            checked={tempo.chuvaFraca || false} 
            readOnly 
            className="w-4 h-4"
          />
          <span className="text-sm">CHUVA FRACA</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            checked={tempo.chuvaForte || false} 
            readOnly 
            className="w-4 h-4"
          />
          <span className="text-sm">CHUVA FORTE</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            checked={tempo.nublado || false} 
            readOnly 
            className="w-4 h-4"
          />
          <span className="text-sm">NUBLADO</span>
        </label>
      </div>
    </div>
  );

  const renderAmostreaSection = () => (
    <div className="flex items-center gap-4">
      <span className="font-medium">CAMADA REENSAIADA:</span>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            checked={amostreaReensaiada.sim || false} 
            readOnly 
            className="w-4 h-4"
          />
          <span className="text-sm">SIM</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            checked={amostreaReensaiada.nao || false} 
            readOnly 
            className="w-4 h-4"
          />
          <span className="text-sm">NÃO</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-300 p-4 mb-6 print:mb-4">
      {/* Cabeçalho com logo oficial e título */}
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

      {/* Informações principais */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Coluna 1 */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">OPERADOR:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{operador}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">RESPONSÁVEL PELO CÁLCULO:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{responsavelCalculo}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">VERIFICADOR:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{verificador}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">DATA:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{data}</span>
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">NORTE:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{norte}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">ESTE:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{este}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">COTA:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{cota}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">QUADRANTE:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{quadrante}</span>
          </div>
          {testType === 'densidade-real' && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-medium">LOCAL:</span>
              <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{local}</span>
            </div>
          )}
        </div>

        {/* Coluna 3 */}
        <div className="space-y-2">
          {testType === 'densidade-in-situ' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium">CAMADA Nº:</span>
                <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{camada}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium">FVS:</span>
                <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{fvs}</span>
              </div>
            </>
          )}
          {testType === 'densidade-real' && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-medium">NOME DA AMOSTRA:</span>
              <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{nomeAmostra}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">MATERIAL:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{material}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">ORIGEM:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{origem}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">REGISTRO:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{registro}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm font-medium">HORA:</span>
            <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{hora}</span>
          </div>
          {testType === 'densidade-real' && regSalum && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm font-medium">REG SALUM:</span>
              <span className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">{regSalum}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seção Tempo */}
      <div className="mb-4 pb-2 border-b border-gray-300">
        {renderTempoSection()}
      </div>

      {/* Seção Amostra Reensaiada */}
      <div className="mb-4 pb-2 border-b border-gray-300">
        {renderAmostreaSection()}
      </div>

      {/* Dispositivos de Precisão */}
      <div className="bg-gray-50 p-3 border border-gray-300">
        <h3 className="text-sm font-bold mb-2 text-center">DISPOSITIVOS DE PRECISÃO</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium mb-1">BALANÇA:</div>
            <div className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">
              {dispositivosPrecisao.balanca}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">ESTUFA:</div>
            <div className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">
              {dispositivosPrecisao.estufa}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">TERMÔMETRO:</div>
            <div className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">
              {dispositivosPrecisao.termometro}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">CRONÔMETRO:</div>
            <div className="text-sm border-b border-gray-400 min-h-[1.5rem] px-1">
              {dispositivosPrecisao.cronometro}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHeader;