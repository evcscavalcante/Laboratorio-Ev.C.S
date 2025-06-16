import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/lib/firebase';
import { Loader2, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar status das credenciais Firebase
    const checkFirebaseConfig = () => {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      
      if (!apiKey || !projectId || !appId) {
        setFirebaseStatus('Credenciais Firebase não configuradas');
      } else if (apiKey.length < 20 || !apiKey.startsWith('AIza')) {
        setFirebaseStatus('API Key Firebase inválida');
      } else {
        setFirebaseStatus('Firebase configurado');
      }
    };
    
    checkFirebaseConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validação básica no frontend
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validação de política de senhas mais rigorosa
    if (isSignUp && password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (isSignUp) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        toast({
          title: "Senha muito fraca",
          description: "A senha deve conter: maiúscula, minúscula, número e símbolo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    if (isSignUp && !name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Preencha seu nome completo para criar a conta.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Sanitizar nome contra XSS
    if (isSignUp && name.trim()) {
      const sanitizedName = name.trim().replace(/<[^>]*>/g, '').replace(/[<>'"&]/g, '');
      if (sanitizedName !== name.trim()) {
        toast({
          title: "Nome inválido",
          description: "O nome não pode conter caracteres especiais ou HTML.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    // Validação de consentimento LGPD
    if (isSignUp && !lgpdConsent) {
      toast({
        title: "Consentimento obrigatório",
        description: "É necessário aceitar os termos de uso e política de privacidade.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        toast({
          title: "Conta criada com sucesso",
          description: "Você pode agora fazer login com suas credenciais.",
        });
        setIsSignUp(false);
      } else {
        await signIn(email.trim(), password);
        toast({
          title: "Login realizado",
          description: "Bem-vindo ao sistema de laboratório geotécnico!",
        });
        setLocation('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      console.error('Erro detalhado:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let message = 'Erro ao processar solicitação';
      if (error.code === 'auth/user-not-found') {
        message = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Usuário não encontrado ou senha incorreta. Verifique os dados ou crie uma conta.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        message = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        message = 'Erro de configuração do Firebase. Verifique as credenciais.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Erro de conexão. Verifique sua internet.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido';
      }
      
      toast({
        title: "Erro de autenticação",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/attached_assets/file_00000000233061f898ea05ffe6a1752e_1749721558008.png" 
              alt="LABORATÓRIO Ev.C S" 
              className="w-40 h-24 object-contain"
            />
          </div>
          <CardDescription className="text-center">
            {isSignUp 
              ? 'Crie sua conta para acessar o sistema' 
              : 'Sistema de Gestão Geotécnica'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(firebaseStatus === 'Credenciais Firebase não configuradas' || firebaseStatus === 'API Key Firebase inválida') && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {firebaseStatus === 'API Key Firebase inválida' 
                  ? 'A chave de API do Firebase é inválida. Verifique as credenciais.' 
                  : 'Firebase não configurado. Solicite as credenciais ao administrador.'
                }
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Mín. 8 chars, maiúscula, número, símbolo" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={isSignUp ? 8 : 6}
              />
            </div>
            {isSignUp && (
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="lgpd-consent"
                    checked={lgpdConsent}
                    onCheckedChange={(checked) => setLgpdConsent(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="lgpd-consent" className="text-xs leading-4">
                    Aceito os{' '}
                    <a 
                      href="/termos-uso" 
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Termos de Uso
                    </a>
                    {' '}e a{' '}
                    <a 
                      href="/configuracoes-lgpd" 
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Política de Privacidade
                    </a>
                    , incluindo o processamento dos meus dados pessoais conforme LGPD.
                  </Label>
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password || (isSignUp && (!name || !lgpdConsent))}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="mr-2 h-4 w-4" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading 
                ? 'Processando...' 
                : isSignUp 
                  ? 'Criar Conta' 
                  : 'Entrar'
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              className="text-sm"
            >
              {isSignUp 
                ? 'Já tem uma conta? Fazer login' 
                : 'Não tem conta? Criar uma'
              }
            </Button>
            
            {!isSignUp && (
              <div className="text-xs text-gray-600">
                <p>Primeiro acesso? Use "Criar uma" para registrar-se no sistema.</p>
              </div>
            )}
          </div>

          {/* Links Públicos LGPD */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center space-x-4 text-xs">
              <a 
                href="/termos-uso" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Termos de Uso
              </a>
              <span className="text-gray-400">•</span>
              <a 
                href="/configuracoes-lgpd" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidade
              </a>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Firebase: {firebaseStatus}</p>
              <p>PostgreSQL: Conectado</p>
              <p>Sistema Híbrido Ativo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}