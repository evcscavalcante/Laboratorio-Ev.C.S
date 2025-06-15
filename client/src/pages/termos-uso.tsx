import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function TermosUso() {
  const { user, token } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAcceptAll = async () => {
    if (!termsAccepted || !privacyAccepted || !dataProcessingAccepted) {
      toast({
        title: "Aceite necessário",
        description: "Você deve aceitar todos os termos para continuar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Registrar consentimentos
      const consents = [
        { type: 'terms', status: 'given' },
        { type: 'privacy_policy', status: 'given' },
        { type: 'data_processing', status: 'given' }
      ];

      for (const consent of consents) {
        await fetch('/api/lgpd/consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            consentType: consent.type,
            consentStatus: consent.status
          })
        });
      }

      toast({
        title: "Termos aceitos",
        description: "Seus consentimentos foram registrados com sucesso"
      });

      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erro ao registrar consentimentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar consentimentos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <label htmlFor="terms" className="text-sm font-medium">
                  Li e aceito os Termos de Uso
                </label>
              </div>
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
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="privacy" 
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                />
                <label htmlFor="privacy" className="text-sm font-medium">
                  Li e aceito a Política de Privacidade
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Consentimento para Tratamento de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Consentimento para Tratamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), precisamos do seu consentimento 
                  expresso para tratar seus dados pessoais nas seguintes finalidades:
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tratamento autorizado:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Dados de identificação para controle de acesso</li>
                    <li>• Dados de ensaios para geração de relatórios técnicos</li>
                    <li>• Logs de sistema para segurança e auditoria</li>
                    <li>• Informações técnicas para melhoria do serviço</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Seus direitos:</h4>
                  <p className="text-sm">
                    Você pode revogar este consentimento a qualquer momento através das 
                    configurações do sistema ou solicitando a exclusão de seus dados.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="dataProcessing" 
                  checked={dataProcessingAccepted}
                  onCheckedChange={(checked) => setDataProcessingAccepted(checked === true)}
                />
                <label htmlFor="dataProcessing" className="text-sm font-medium">
                  Autorizo o tratamento dos meus dados pessoais conforme descrito
                </label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ExternalLink className="h-4 w-4" />
              <span>Versão 1.0 - Atualizada em 15/06/2025</span>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Voltar
              </Button>
              <Button 
                onClick={handleAcceptAll}
                disabled={!termsAccepted || !privacyAccepted || !dataProcessingAccepted || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Processando..." : "Aceitar e Continuar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}