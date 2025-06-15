import React from 'react';
import { Link } from 'wouter';
import { Mountain, Target, Layers, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SolosPage() {
  const ensaios = [
    {
      title: 'Densidade In-Situ',
      description: 'Determinação da densidade do solo em seu estado natural no campo',
      icon: Target,
      href: '/densidade-in-situ',
      status: 'Disponível',
      color: 'bg-green-500'
    },
    {
      title: 'Densidade Real',
      description: 'Determinação da densidade real dos grãos de solo',
      icon: Layers,
      href: '/densidade-real',
      status: 'Disponível',
      color: 'bg-blue-500'
    },
    {
      title: 'Densidade Máxima/Mínima',
      description: 'Ensaio para determinação das densidades máxima e mínima de solos granulares',
      icon: Scale,
      href: '/densidade-max-min',
      status: 'Disponível',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Mountain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ensaios de Solos</h1>
            <p className="text-gray-600 mt-1">Selecione o tipo de ensaio geotécnico para realizar</p>
          </div>
        </div>

        {/* Cards dos Ensaios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ensaios.map((ensaio, index) => {
            const IconComponent = ensaio.icon;
            
            return (
              <Link key={index} href={ensaio.href}>
                <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full ${ensaio.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {ensaio.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-gray-900 mt-4">
                      {ensaio.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {ensaio.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>


      </div>
    </div>
  );
}