/**
 * Navegação Lateral para Ensaios
 * Permite navegação rápida entre seções com âncoras
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Info, 
  Calculator, 
  Droplets, 
  BarChart3, 
  Settings,
  ChevronRight 
} from 'lucide-react';

interface NavigationSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isRequired: boolean;
  subsections?: {
    id: string;
    label: string;
    isCompleted: boolean;
  }[];
}

interface TestNavigationProps {
  sections: NavigationSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export const TestNavigation: React.FC<TestNavigationProps> = ({
  sections,
  activeSection,
  onSectionClick,
  className
}) => {
  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full overflow-y-auto",
      "w-64 flex-shrink-0 sticky top-0",
      className
    )}>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Navegação do Ensaio
        </h3>
        
        <nav className="space-y-1">
          {sections.map((section) => (
            <div key={section.id}>
              {/* Seção principal */}
              <button
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSection === section.id
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "text-gray-700 hover:bg-gray-100",
                  section.isCompleted && "text-green-700"
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "flex-shrink-0",
                    section.isCompleted ? "text-green-600" :
                    activeSection === section.id ? "text-blue-600" : "text-gray-500"
                  )}>
                    {section.icon}
                  </span>
                  <span>{section.label}</span>
                  {section.isRequired && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </div>
                
                {/* Indicador de status */}
                <div className="flex items-center space-x-1">
                  {section.isCompleted && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <ChevronRight size={14} className={cn(
                    "transition-transform",
                    activeSection === section.id && "rotate-90"
                  )} />
                </div>
              </button>

              {/* Subseções */}
              {section.subsections && activeSection === section.id && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => onSectionClick(subsection.id)}
                      className={cn(
                        "w-full text-left px-3 py-1 text-xs text-gray-600",
                        "hover:text-gray-900 hover:bg-gray-50 rounded",
                        subsection.isCompleted && "text-green-600"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          subsection.isCompleted ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <span>{subsection.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Resumo do progresso */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Progresso Geral</div>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={`progress-${section.id}`} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{section.label}</span>
                <span className={cn(
                  "text-xs font-medium",
                  section.isCompleted ? "text-green-600" : "text-gray-400"
                )}>
                  {section.isCompleted ? "✓" : "○"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar navegação de seções
export const useTestNavigation = (totalSections: string[]) => {
  const [activeSection, setActiveSection] = React.useState(totalSections[0] || '');
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      setActiveSection(sectionId);
    }
  };

  // Observer para detectar seção ativa durante scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: [0.3, 0.7], rootMargin: '-100px 0px -100px 0px' }
    );

    totalSections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [totalSections]);

  return {
    activeSection,
    scrollToSection
  };
};