import React from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [
    { label: 'Dashboard', icon: <Home className="w-4 h-4" /> }
  ],
  '/dashboard': [
    { label: 'Dashboard', icon: <Home className="w-4 h-4" /> }
  ],
  '/analytics': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Analytics' }
  ],
  '/densidade-in-situ': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Ensaios', href: '/solos' },
    { label: 'Densidade In-Situ' }
  ],
  '/densidade-real': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Ensaios', href: '/solos' },
    { label: 'Densidade Real' }
  ],
  '/densidade-max-min': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Ensaios', href: '/solos' },
    { label: 'Densidade Máx/Mín' }
  ],
  '/solos': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Ensaios' }
  ],
  '/equipamentos': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Equipamentos' }
  ],
  '/balanca-verificacao': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Verificação de Balança' }
  ],
  '/relatorios': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Relatórios' }
  ],
  '/configuracoes': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Configurações' }
  ],
  '/admin': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Administração' }
  ],
  '/admin/users': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Administração', href: '/admin' },
    { label: 'Usuários' }
  ],
  '/help/manual-usuario': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Manual do Usuário' }
  ],
  '/help/manual-admin': [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Manual Administrativo' }
  ]
};

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const [location] = useLocation();
  
  const breadcrumbItems = items || breadcrumbMap[location] || [
    { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> }
  ];

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-600 mb-6", className)}>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="flex items-center">
            {item.href ? (
              <Link href={item.href}>
                <span className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-gray-900 font-medium">
                {item.icon}
                {item.label}
              </span>
            )}
          </div>
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
          )}
        </div>
      ))}
    </nav>
  );
}