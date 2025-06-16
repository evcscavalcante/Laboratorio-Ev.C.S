import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Book, 
  Calculator, 
  FileText, 
  Users, 
  Shield, 
  Cloud, 
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function ManualUsuario() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Book className="h-8 w-8" />
          Manual do Usuário - Laboratório Ev.C.S
        </h1>
        <p className="text-muted-foreground">
          Guia completo para uso do sistema geotécnico profissional
        </p>
      </div>

      {/* Visão Geral */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Visão Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            O Laboratório Ev.C.S é um sistema web completo para laboratórios geotécnicos que automatiza 
            cálculos, gera relatórios profissionais e gerencia dados com segurança.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Principais Recursos
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-6">
                <li>3 Calculadoras conforme NBR ABNT</li>
                <li>Relatórios técnicos em PDF</li>
                <li>Sistema multiorganizacional</li>
                <li>Gerenciamento de equipamentos</li>
                <li>Interface responsiva mobile</li>
                <li>Conformidade LGPD completa</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Níveis de Usuário
              </h4>
              <div className="space-y-1">
                <Badge variant="destructive" className="mr-2">ADMIN</Badge>
                <Badge variant="default" className="mr-2">MANAGER</Badge>
                <Badge variant="secondary" className="mr-2">TECHNICIAN</Badge>
                <Badge variant="outline">VIEWER</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cada organização possui usuários isolados por nível hierárquico
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculadoras */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadoras Geotécnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Densidade In Situ */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">Massa Específica Aparente In Situ (NBR 9813:2021)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Acesso:</strong> Dashboard {">"} Densidade In-Situ ou sidebar {">"} Ensaios Salvos
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Identificação Técnica:</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Operador, responsável e verificador</li>
                  <li>Data, registro, material, estaca</li>
                  <li>Coordenadas: norte, este, cota</li>
                  <li>Condições: tempo, umidade, temperatura</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Dados Laboratoriais:</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Massa úmida TOPO/BASE (g)</li>
                  <li>Volume cilindro TOPO/BASE (cm³)</li>
                  <li>Umidade: 3 determinações mínimo</li>
                  <li>Equipamentos: balança, estufa, etc.</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Cálculos Automáticos:</h5>
              <p className="text-sm text-green-700">
                Densidade aparente seca, índice de vazios (IV), compacidade relativa (CR) para TOPO e BASE.
                Status visual: APROVADO (verde) se IV ≤ 0.745 em ambos ou REPROVADO (vermelho).
              </p>
            </div>
          </div>

          <Separator />

          {/* Densidade Real */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">Massa Específica dos Sólidos (NBR 17212:2025)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Acesso:</strong> Dashboard {">"} Densidade Real ou sidebar {">"} Ensaios Salvos
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Dados do Picnômetro:</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Massa solo seco (g)</li>
                  <li>Volume picnômetro (ml)</li>
                  <li>Temperatura do ensaio (°C)</li>
                  <li>Fração passante na peneira 2,0 mm</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Determinação de Umidade:</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>3 determinações independentes</li>
                  <li>Cálculo automático da média</li>
                  <li>Validação da diferença entre determinações</li>
                  <li>Status: APROVADO se diferença ≤ 0.02 g/cm³</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Densidade Máx/Mín */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">Índices de Vazios Máximo e Mínimo (NBR 12004/12051:2021)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Acesso:</strong> Dashboard {">"} Densidade Máx/Mín ou sidebar {">"} Ensaios Salvos
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Densidade Máxima (NBR 12004):</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Massa solo + molde compactado (g)</li>
                  <li>Massa molde vazio (g)</li>
                  <li>Volume molde calibrado (cm³)</li>
                  <li>Solos não coesivos</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Densidade Mínima (NBR 12051):</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Altura solo no molde (cm)</li>
                  <li>Determinação de umidade</li>
                  <li>Status: APROVADO se diferença &gt; 0.1</li>
                  <li>Compacidade relativa automática</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios PDF */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Geração de Relatórios PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Quando Gerar:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Após completar qualquer ensaio</li>
                <li>Botão "Gerar PDF" em cada calculadora</li>
                <li>Formato profissional seguindo ABNT</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Conteúdo Incluído:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Logo da organização</li>
                <li>Dados do laboratório</li>
                <li>Cálculos detalhados</li>
                <li>Conclusões técnicas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Ensaios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Ensaios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Ensaios Salvos:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Acesso:</strong> Sidebar &gt; Ensaios Salvos</li>
                <li>Visualizar todos os ensaios por tipo</li>
                <li>Buscar ensaios por registro ou data</li>
                <li>Filtrar por tipo de ensaio</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Ações Disponíveis:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Visualizar ensaio completo</li>
                <li>Baixar PDF do relatório</li>
                <li>Excluir ensaios (se permitido)</li>
                <li>Estatísticas por categoria</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Isolamento por Organização:</h5>
            <p className="text-sm text-blue-700">
              Cada organização vê apenas seus próprios ensaios. Dados completamente isolados para segurança.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Equipamentos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestão de Equipamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Tipos de Equipamentos:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Cápsulas:</strong> Pequena, média, grande</li>
                <li><strong>Cilindros:</strong> Biselado, proctor, CBR, vazios mínimos</li>
                <li>Código único para identificação</li>
                <li>Status de calibração e localização</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Funcionalidades:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Cadastro de novos equipamentos</li>
                <li>Edição de dados existentes</li>
                <li>Controle de calibração</li>
                <li>Histórico de uso</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LGPD e Privacidade */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidade e LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Acesso Público:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Termos de Uso:</strong> Disponível sem login</li>
                <li><strong>Política de Privacidade:</strong> Acesso direto</li>
                <li>Links na tela de login</li>
                <li>Transparência total sobre coleta de dados</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Direitos do Usuário:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Exportar todos os dados</li>
                <li>Solicitar exclusão de conta</li>
                <li>Gerenciar consentimentos</li>
                <li>Configurações na sidebar &gt; LGPD</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">Conformidade Completa:</h5>
            <p className="text-sm text-green-700">
              Sistema 100% conforme com LGPD brasileira. Todos os direitos garantidos e funcionalidades transparentes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Problemas Comuns */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Resolução de Problemas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h5 className="font-medium text-yellow-800 mb-2">Não consigo fazer login</h5>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Verifique conexão com internet</li>
                <li>Use conta Google válida cadastrada</li>
                <li>Contate administrador para adicionar sua conta</li>
                <li>Novos usuários começam como VIEWER</li>
              </ul>
            </div>
            
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h5 className="font-medium text-blue-800 mb-2">Não vejo ensaios de outras organizações</h5>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Comportamento correto - dados isolados por organização</li>
                <li>Cada empresa vê apenas seus próprios dados</li>
                <li>Contate suporte se precisar mudar de organização</li>
              </ul>
            </div>
            
            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <h5 className="font-medium text-red-800 mb-2">PDF não gera ou campos faltando</h5>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                <li>Preencha todos campos do cabeçalho TestHeader</li>
                <li>Complete dados de identificação técnica</li>
                <li>Verifique valores numéricos válidos</li>
                <li>Status deve estar APROVADO ou REPROVADO</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hierarquia Organizacional */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Níveis Hierárquicos e Permissões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">VIEWER (Visualizador):</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Visualizar ensaios e relatórios</li>
                <li>Baixar PDFs existentes</li>
                <li>Acesso apenas leitura</li>
                <li>Nível inicial para novos usuários</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">TECHNICIAN (Técnico):</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Criar e editar ensaios</li>
                <li>Gerar relatórios PDF</li>
                <li>Gerenciar equipamentos básicos</li>
                <li>Salvar dados no sistema</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">MANAGER (Gerente):</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Todas as permissões de TECHNICIAN</li>
                <li>Excluir ensaios e equipamentos</li>
                <li>Visualizar relatórios e analytics</li>
                <li>Supervisionar equipe técnica</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">ADMIN (Administrador):</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Todas as permissões de MANAGER</li>
                <li>Criar usuários na organização</li>
                <li>Promover até nível MANAGER</li>
                <li>Acesso ao painel administrativo</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <h5 className="font-medium text-orange-800 mb-2">Isolamento Organizacional:</h5>
            <p className="text-sm text-orange-700">
              Cada ADMIN gerencia apenas sua própria organização. Dados completamente isolados entre empresas.
              Novos usuários sempre começam como VIEWER e precisam ser promovidos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Melhores Práticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Melhores Práticas por Função
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3">Para Técnicos (TECHNICIAN):</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Complete sempre o cabeçalho TestHeader</li>
                <li>Preencha dados de identificação técnica</li>
                <li>Valide cálculos antes de salvar</li>
                <li>Gere PDFs para documentação oficial</li>
                <li>Organize ensaios por projeto/cliente</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-3">Para Gestores (MANAGER/ADMIN):</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Monitore produtividade da equipe</li>
                <li>Valide relatórios críticos</li>
                <li>Gerencie permissões adequadamente</li>
                <li>Use analytics para insights de negócio</li>
                <li>Mantenha equipamentos calibrados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}