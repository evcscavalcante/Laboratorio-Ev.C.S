import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  Database 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function ConfiguracoesLGPD() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [myData, setMyData] = useState<any>(null);
  const [consents, setConsents] = useState({
    terms: false,
    privacyPolicy: false,
    dataProcessing: false,
    marketing: false
  });

  useEffect(() => {
    if (token) {
      loadMyData();
    }
  }, [token]);

  const loadMyData = async () => {
    try {
      const response = await fetch('/api/lgpd/my-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyData(data);
        setConsents({
          terms: data.lgpdCompliance?.termsAccepted || false,
          privacyPolicy: data.lgpdCompliance?.privacyPolicyAccepted || false,
          dataProcessing: data.lgpdCompliance?.dataProcessingConsent || false,
          marketing: data.lgpdCompliance?.marketingConsent || false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleConsentChange = async (consentType: string, newValue: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/lgpd/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          consentType: consentType,
          consentStatus: newValue ? 'given' : 'withdrawn'
        })
      });

      if (response.ok) {
        setConsents(prev => ({ ...prev, [consentType]: newValue }));
        toast({
          title: "Consentimento atualizado",
          description: `Suas preferências de ${consentType} foram salvas`
        });
      } else {
        throw new Error('Erro ao atualizar consentimento');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o consentimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lgpd/my-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meus-dados-evcs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Dados exportados",
          description: "Seus dados foram baixados com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!confirm('Tem certeza que deseja solicitar a exclusão de todos os seus dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lgpd/request-deletion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de exclusão será processada em até 30 dias"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Configurações de Privacidade
          </h1>
          <p className="text-gray-600 mt-2">Gerencie seus dados e consentimentos conforme a LGPD</p>
        </div>

        <div className="grid gap-6">
          {/* Resumo dos Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Resumo dos Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {myData.testData?.densityInSitu + myData.testData?.realDensity + myData.testData?.maxMinDensity || 0}
                    </div>
                    <div className="text-sm text-gray-600">Ensaios Realizados</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {myData.consents?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Consentimentos</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {myData.auditLogs?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Logs de Auditoria</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Carregando dados...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gerenciamento de Consentimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Gerenciar Consentimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Termos de Uso</div>
                  <div className="text-sm text-gray-600">
                    Aceite dos termos gerais de uso do sistema
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {consents.terms && <Badge variant="outline" className="text-green-600">Aceito</Badge>}
                  <Switch
                    checked={consents.terms}
                    onCheckedChange={(checked) => handleConsentChange('terms', checked)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Política de Privacidade</div>
                  <div className="text-sm text-gray-600">
                    Consentimento para coleta e uso de dados pessoais
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {consents.privacyPolicy && <Badge variant="outline" className="text-green-600">Aceito</Badge>}
                  <Switch
                    checked={consents.privacyPolicy}
                    onCheckedChange={(checked) => handleConsentChange('privacy_policy', checked)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Processamento de Dados</div>
                  <div className="text-sm text-gray-600">
                    Autorização para processamento de dados técnicos
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {consents.dataProcessing && <Badge variant="outline" className="text-green-600">Aceito</Badge>}
                  <Switch
                    checked={consents.dataProcessing}
                    onCheckedChange={(checked) => handleConsentChange('data_processing', checked)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Comunicações</div>
                  <div className="text-sm text-gray-600">
                    Receber notificações sobre atualizações do sistema
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {consents.marketing && <Badge variant="outline" className="text-green-600">Aceito</Badge>}
                  <Switch
                    checked={consents.marketing}
                    onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seus Direitos LGPD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Seus Direitos (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  De acordo com a Lei Geral de Proteção de Dados, você tem direito a:
                  acesso, correção, portabilidade e exclusão dos seus dados pessoais.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleDataExport}
                  disabled={loading}
                  className="h-auto py-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Download className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Exportar Meus Dados</div>
                      <div className="text-xs text-gray-600">Baixar todos os dados em JSON</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRequestDeletion}
                  disabled={loading}
                  className="h-auto py-4 border-red-200 hover:bg-red-50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">Solicitar Exclusão</div>
                      <div className="text-xs text-gray-600">Excluir todos os dados permanentemente</div>
                    </div>
                  </div>
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> A exclusão de dados resultará na perda permanente 
                  de todos os ensaios, relatórios e configurações. Esta ação não pode ser desfeita.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Histórico de Consentimentos */}
          {myData?.consents && myData.consents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Consentimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myData.consents.slice(0, 5).map((consent: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{consent.consentType}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(consent.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant={consent.consentStatus === 'given' ? 'default' : 'secondary'}>
                        {consent.consentStatus === 'given' ? 'Concedido' : 'Retirado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}