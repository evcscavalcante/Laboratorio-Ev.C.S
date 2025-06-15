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
  // Funções de callback para tornar os campos funcionais
  onOperadorChange?: (value: string) => void;
  onResponsavelCalculoChange?: (value: string) => void;
  onVerificadorChange?: (value: string) => void;
  onDataChange?: (value: string) => void;
  onHoraChange?: (value: string) => void;
  onNorteChange?: (value: string) => void;
  onEsteChange?: (value: string) => void;
  onCotaChange?: (value: string) => void;
  onQuadranteChange?: (value: string) => void;
  onCamadaChange?: (value: string) => void;
  onLocalChange?: (value: string) => void;
  onMaterialChange?: (value: string) => void;
  onOrigemChange?: (value: string) => void;
  onRegistroChange?: (value: string) => void;
  onTempoChange?: (tempo: any) => void;
  onAmostreaReensaiadaChange?: (amostra: any) => void;
  onDispositivosPrecisaoChange?: (dispositivos: any) => void;
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
  dispositivosPrecisao = {},
  onOperadorChange,
  onResponsavelCalculoChange,
  onVerificadorChange,
  onDataChange,
  onHoraChange,
  onNorteChange,
  onEsteChange,
  onCotaChange,
  onQuadranteChange,
  onCamadaChange,
  onLocalChange,
  onMaterialChange,
  onOrigemChange,
  onRegistroChange,
  onTempoChange,
  onAmostreaReensaiadaChange,
  onDispositivosPrecisaoChange
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
            name="tempo"
            checked={tempo.sol || false} 
            onChange={() => onTempoChange?.({ sol: true, chuvaFraca: false, chuvaForte: false, nublado: false })}
            className="w-4 h-4"
          />
          <span className="text-sm">SOL FORTE</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            name="tempo"
            checked={tempo.chuvaFraca || false} 
            onChange={() => onTempoChange?.({ sol: false, chuvaFraca: true, chuvaForte: false, nublado: false })}
            className="w-4 h-4"
          />
          <span className="text-sm">CHUVA FRACA</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            name="tempo"
            checked={tempo.chuvaForte || false} 
            onChange={() => onTempoChange?.({ sol: false, chuvaFraca: false, chuvaForte: true, nublado: false })}
            className="w-4 h-4"
          />
          <span className="text-sm">CHUVA FORTE</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            name="tempo"
            checked={tempo.nublado || false} 
            onChange={() => onTempoChange?.({ sol: false, chuvaFraca: false, chuvaForte: false, nublado: true })}
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
            name="amostra"
            checked={amostreaReensaiada.sim || false} 
            onChange={() => onAmostreaReensaiadaChange?.({ sim: true, nao: false })}
            className="w-4 h-4"
          />
          <span className="text-sm">SIM</span>
        </label>
        <label className="flex items-center gap-1">
          <input 
            type="radio" 
            name="amostra"
            checked={amostreaReensaiada.nao || false} 
            onChange={() => onAmostreaReensaiadaChange?.({ sim: false, nao: true })}
            className="w-4 h-4"
          />
          <span className="text-sm">NÃO</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-300 p-3 sm:p-4 mb-6 print:mb-4">
      {/* Cabeçalho com logo oficial e título - Mobile First */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 items-center mb-4 pb-3 border-b border-gray-300 gap-3 sm:gap-0">
        <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
          <img 
            src="/attached_assets/file_00000000233061f898ea05ffe6a1752e_1749721558008.png" 
            alt="Laboratório Ev.C.S" 
            className="h-12 sm:h-16 w-auto"
          />
        </div>
        
        <div className="text-center">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 whitespace-pre-line leading-tight">
            {getTestTitle()}
          </h1>
        </div>
        
        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
          <div className="text-center sm:text-right">
            <div className="text-sm font-bold text-gray-900">LABORATÓRIO EV.C.S</div>
            <div className="text-xs text-gray-600">Sistema Geotécnico</div>
            <div className="text-xs text-gray-600">ABNT NBR Certificado</div>
          </div>
        </div>
      </div>

      {/* Informações principais - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Coluna 1 */}
        <div className="space-y-3">
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">OPERADOR:</span>
            <input 
              type="text" 
              value={operador}
              onChange={(e) => onOperadorChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Nome do operador"
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">RESPONSÁVEL:</span>
            <input 
              type="text" 
              value={responsavelCalculo}
              onChange={(e) => onResponsavelCalculoChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Nome do responsável"
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">VERIFICADOR:</span>
            <input 
              type="text" 
              value={verificador}
              onChange={(e) => onVerificadorChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Nome do verificador"
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">DATA:</span>
            <input 
              type="date" 
              value={data}
              onChange={(e) => onDataChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
            />
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="space-y-3">
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">NORTE:</span>
            <input 
              type="text" 
              value={norte}
              onChange={(e) => onNorteChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Coordenada Norte"
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">ESTE:</span>
            <input 
              type="text" 
              value={este}
              onChange={(e) => onEsteChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Coordenada Este"
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">COTA:</span>
            <input 
              type="text" 
              value={cota}
              onChange={(e) => onCotaChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Cota"
            />
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">QUADRANTE:</span>
            <input 
              type="text" 
              value={quadrante}
              onChange={(e) => onQuadranteChange?.(e.target.value)}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
              placeholder="Quadrante"
            />
          </div>
          {testType === 'densidade-real' && (
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700">LOCAL:</span>
              <input 
                type="text" 
                value={local}
                onChange={(e) => onLocalChange?.(e.target.value)}
                className="text-sm border-b border-gray-400 bg-transparent px-1 py-1 focus:outline-none focus:border-blue-500 min-h-[32px]"
                placeholder="Local"
              />
            </div>
          )}
        </div>

        {/* Coluna 3 */}
        <div className="space-y-3">
          {testType === 'densidade-in-situ' && (
            <>
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
                <span className="text-sm font-medium text-gray-700">CAMADA Nº:</span>
                <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{camada}</span>
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
                <span className="text-sm font-medium text-gray-700">FVS:</span>
                <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{fvs}</span>
              </div>
            </>
          )}
          {testType === 'densidade-real' && (
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700">NOME DA AMOSTRA:</span>
              <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{nomeAmostra}</span>
            </div>
          )}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">MATERIAL:</span>
            <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{material}</span>
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">ORIGEM:</span>
            <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{origem}</span>
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">REGISTRO:</span>
            <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{registro}</span>
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-gray-700">HORA:</span>
            <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{hora}</span>
          </div>
          {testType === 'densidade-real' && regSalum && (
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700">REG SALUM:</span>
              <span className="text-sm border-b border-gray-400 min-h-[32px] px-1 py-1 bg-gray-50">{regSalum}</span>
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
            <input 
              type="text" 
              value={dispositivosPrecisao.balanca || ''}
              onChange={(e) => onDispositivosPrecisaoChange?.({ ...dispositivosPrecisao, balanca: e.target.value })}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-0 focus:outline-none focus:border-blue-500 text-center w-full"
              placeholder="ID Balança"
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">ESTUFA:</div>
            <input 
              type="text" 
              value={dispositivosPrecisao.estufa || ''}
              onChange={(e) => onDispositivosPrecisaoChange?.({ ...dispositivosPrecisao, estufa: e.target.value })}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-0 focus:outline-none focus:border-blue-500 text-center w-full"
              placeholder="ID Estufa"
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">TERMÔMETRO:</div>
            <input 
              type="text" 
              value={dispositivosPrecisao.termometro || ''}
              onChange={(e) => onDispositivosPrecisaoChange?.({ ...dispositivosPrecisao, termometro: e.target.value })}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-0 focus:outline-none focus:border-blue-500 text-center w-full"
              placeholder="ID Termômetro"
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-1">CRONÔMETRO:</div>
            <input 
              type="text" 
              value={dispositivosPrecisao.cronometro || ''}
              onChange={(e) => onDispositivosPrecisaoChange?.({ ...dispositivosPrecisao, cronometro: e.target.value })}
              className="text-sm border-b border-gray-400 bg-transparent px-1 py-0 focus:outline-none focus:border-blue-500 text-center w-full"
              placeholder="ID Cronômetro"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHeader;