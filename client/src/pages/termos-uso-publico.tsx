import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, ExternalLink, ArrowLeft } from "lucide-react";

export default function TermosUsoPublico() {
  const handleVoltar = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Termos de Uso e Privacidade</h1>
          <p className="text-gray-600 mt-2">Sistema de Gerenciamento Geotécnico Ev.C.S</p>
        </div>

        <div className="grid gap-6">
          {/* Termos de Uso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Termos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full border rounded p-4">
                <div className="space-y-4 text-sm">
                  <h3 className="font-semibold">1. ACEITAÇÃO DOS TERMOS</h3>
                  <p>Ao utilizar o Sistema de Gerenciamento Geotécnico Ev.C.S, você concorda com estes termos de uso.</p>
                  
                  <h3 className="font-semibold">2. USO DO SISTEMA</h3>
                  <p>O sistema destina-se exclusivamente para fins profissionais de laboratório geotécnico conforme normas ABNT vigentes.</p>
                  
                  <h3 className="font-semibold">3. RESPONSABILIDADES DO USUÁRIO</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Manter dados de acesso confidenciais</li>
                    <li>Usar o sistema conforme sua finalidade técnica</li>
                    <li>Respeitar direitos de outros usuários</li>
                    <li>Inserir dados técnicos corretos e precisos</li>
                  </ul>
                  
                  <h3 className="font-semibold">4. LIMITAÇÃO DE RESPONSABILIDADE</h3>
                  <p>O sistema é fornecido "como está" para fins técnicos. Resultados de ensaios devem ser validados por profissional habilitado.</p>
                  
                  <h3 className="font-semibold">5. PROPRIEDADE INTELECTUAL</h3>
                  <p>O sistema e seus algoritmos são protegidos por direitos autorais. Dados de ensaios inseridos permanecem de propriedade do usuário.</p>
                  
                  <h3 className="font-semibold">6. MODIFICAÇÕES</h3>
                  <p>Estes termos podem ser modificados mediante notificação prévia aos usuários.</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Política de Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Política de Privacidade (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full border rounded p-4">
                <div className="space-y-4 text-sm">
                  <h3 className="font-semibold">1. DADOS COLETADOS</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Informações de cadastro (nome, email)</li>
                    <li>Dados técnicos de ensaios geotécnicos</li>
                    <li>Logs de acesso e utilização do sistema</li>
                    <li>Informações de equipamentos e calibrações</li>
                  </ul>
                  
                  <h3 className="font-semibold">2. FINALIDADE DO TRATAMENTO</h3>
                  <p>Os dados são utilizados para:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Operação do sistema de laboratório</li>
                    <li>Geração de relatórios técnicos conforme NBR</li>
                    <li>Controle de acesso e segurança</li>
                    <li>Melhoria da funcionalidade do sistema</li>
                  </ul>
                  
                  <h3 className="font-semibold">3. BASE LEGAL</h3>
                  <p>O tratamento baseia-se no consentimento do titular e no legítimo interesse para prestação do serviço técnico.</p>
                  
                  <h3 className="font-semibold">4. COMPARTILHAMENTO</h3>
                  <p>Dados não são compartilhados com terceiros sem consentimento expresso, exceto quando exigido por lei.</p>
                  
                  <h3 className="font-semibold">5. SEUS DIREITOS (LGPD)</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Confirmação da existência de tratamento</li>
                    <li>Acesso aos dados pessoais</li>
                    <li>Correção de dados incompletos ou incorretos</li>
                    <li>Anonimização, bloqueio ou eliminação</li>
                    <li>Portabilidade dos dados</li>
                    <li>Revogação do consentimento</li>
                  </ul>
                  
                  <h3 className="font-semibold">6. RETENÇÃO</h3>
                  <p>Dados são mantidos pelo período necessário para as finalidades informadas ou conforme exigido por lei.</p>
                  
                  <h3 className="font-semibold">7. SEGURANÇA</h3>
                  <p>Implementamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado.</p>
                  
                  <h3 className="font-semibold">8. CONTATO</h3>
                  <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato através do sistema.</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator />

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Contato para Dúvidas sobre Privacidade:</h4>
                  <p className="text-sm">Entre em contato através do sistema após fazer login ou pelo suporte técnico.</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Última Atualização:</h4>
                  <p className="text-sm">Versão 1.0 - 15 de junho de 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Voltar */}
          <div className="flex justify-center">
            <Button 
              onClick={handleVoltar}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}