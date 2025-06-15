/**
 * Layout Responsivo para Ensaios
 * Sistema de wizard com navegação lateral e progresso
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { TestNavigation, useTestNavigation } from './test-navigation';
import { ProgressIndicator } from './progress-indicator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, FileText } from 'lucide-react';

interface TestLayoutProps {
  testType: 'densidade-in-situ' | 'densidade-real' | 'densidade-max-min';
  title: string;
  description: string;
  sections: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isCompleted: boolean;
    isRequired: boolean;
    subsections?: Array<{
      id: string;
      label: string;
      isCompleted: boolean;
    }>;
  }>;
  currentStep?: number;
  totalSteps?: number;
  onSave?: () => void;
  onGeneratePDF?: () => void;
  onClear?: () => void;
  isSaving?: boolean;
  isGeneratingPDF?: boolean;
  showNavigation?: boolean;
  children: React.ReactNode;
}

export const TestLayout: React.FC<TestLayoutProps> = ({
  testType,
  title,
  description,
  sections,
  currentStep = 0,
  totalSteps = sections.length,
  onSave,
  onGeneratePDF,
  onClear,
  isSaving = false,
  isGeneratingPDF = false,
  showNavigation = true,
  children
}) => {
  const sectionIds = sections.map(s => s.id);
  const { activeSection, scrollToSection } = useTestNavigation(sectionIds);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // Preparar dados para o indicador de progresso
  const progressSteps = sections.map(section => ({
    id: section.id,
    label: section.label,
    isCompleted: section.isCompleted,
    isActive: activeSection === section.id,
    isRequired: section.isRequired
  }));

  const completedSections = sections.filter(s => s.isCompleted).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Título e descrição */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                {description}
              </p>
            </div>

            {/* Progresso compacto para mobile */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>{completedSections} de {totalSteps}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSections / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center space-x-2">
                {onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="hidden sm:flex"
                  >
                    <Save size={16} className="mr-1" />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                )}

                {onGeneratePDF && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGeneratePDF}
                    disabled={isGeneratingPDF}
                  >
                    <FileText size={16} className="mr-1" />
                    {isGeneratingPDF ? 'Gerando...' : 'PDF'}
                  </Button>
                )}

                {/* Menu mobile */}
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden"
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                >
                  Menu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Navegação lateral - Desktop */}
        {showNavigation && (
          <div className="hidden lg:block">
            <TestNavigation
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          </div>
        )}

        {/* Navegação mobile */}
        {showNavigation && isMobileNavOpen && (
          <div className="lg:hidden absolute inset-0 z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white w-80 h-full overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Navegação</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <TestNavigation
                sections={sections}
                activeSection={activeSection}
                onSectionClick={(sectionId) => {
                  scrollToSection(sectionId);
                  setIsMobileNavOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Indicador de progresso - Mobile/Tablet */}
            <div className="lg:hidden mb-6">
              <ProgressIndicator 
                steps={progressSteps}
                className="sticky top-4 z-30"
              />
            </div>

            {/* Conteúdo do ensaio */}
            <div className="space-y-6">
              {children}
            </div>

            {/* Botões de navegação - Mobile */}
            <div className="sm:hidden mt-8 flex justify-between space-x-4">
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Progresso'}
                </Button>
              )}

              {onClear && (
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="px-6"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Painel lateral direito - Desktop */}
        <div className="hidden xl:block w-80 border-l border-gray-200 bg-white">
          <div className="p-6 space-y-6">
            {/* Indicador de progresso */}
            <ProgressIndicator steps={progressSteps} />

            {/* Ações rápidas */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Ações</h4>
              
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Progresso'}
                </Button>
              )}

              {onGeneratePDF && (
                <Button
                  onClick={onGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText size={16} className="mr-2" />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar Relatório'}
                </Button>
              )}

              {onClear && (
                <Button
                  onClick={onClear}
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  Limpar Dados
                </Button>
              )}
            </div>

            {/* Informações do ensaio */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Informações</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div>Tipo: {testType}</div>
                <div>Progresso: {completedSections}/{totalSteps} seções</div>
                <div>Status: {completedSections === totalSteps ? 'Completo' : 'Em andamento'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};