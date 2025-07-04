import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, UserCheck, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: number;
  type: 'new_user' | 'role_change' | 'system_alert';
  title: string;
  message: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  currentRole?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  userRole: string;
}

export function NotificationBell({ userRole }: NotificationBellProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();
  const mountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Buscar notificações (hooks devem vir antes de qualquer return condicional)
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!mountedRef.current) return [];
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Falha ao carregar notificações');
      return response.json();
    },
    refetchInterval: 30000,
    enabled: !!token && mountedRef.current,
    retry: (failureCount, error) => {
      return failureCount < 2 && mountedRef.current;
    },
    retryDelay: 1000,
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      if (!mountedRef.current) return;
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Falha ao marcar notificação');
      return response.json();
    },
    onSuccess: () => {
      if (mountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    },
    onError: (error) => {
      if (mountedRef.current) {
        console.error('Erro ao marcar notificação:', error);
      }
    },
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!mountedRef.current) return;
      
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Falha ao marcar todas');
      return response.json();
    },
    onSuccess: () => {
      if (mountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        toast({
          title: "Notificações marcadas",
          description: "Todas as notificações foram marcadas como lidas.",
        });
      }
    },
    onError: (error) => {
      if (mountedRef.current) {
        console.error('Erro ao marcar todas as notificações:', error);
      }
    },
  });

  // Promover usuário
  const promoteUserMutation = useMutation({
    mutationFn: async ({ email, newRole }: { email: string; newRole: string }) => {
      if (!mountedRef.current) return;
      
      const response = await fetch('/api/admin/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, newRole }),
      });
      if (!response.ok) throw new Error('Falha ao promover usuário');
      return response.json();
    },
    onSuccess: (_, variables) => {
      if (mountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        toast({
          title: "Usuário promovido",
          description: `Role alterado para ${variables.newRole} com sucesso.`,
        });
      }
    },
    onError: (error) => {
      if (mountedRef.current) {
        console.error('Erro ao promover usuário:', error);
        toast({
          title: "Erro",
          description: "Falha ao promover usuário. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handlePromoteUser = (email: string, newRole: string) => {
    promoteUserMutation.mutate({ email, newRole });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_user':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'role_change':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'system_alert':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há alguns momentos';
    }
  };

  // Apenas DEVELOPER e ADMIN veem notificações (check após todos os hooks)
  if (userRole !== 'DEVELOPER' && userRole !== 'ADMIN') {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96 max-h-96 overflow-y-auto" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification: Notification) => (
              <div key={notification.id} className="p-2">
                <Card className={`${!notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-sm">
                          {notification.title}
                        </CardTitle>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs mb-2">
                      {notification.message}
                    </CardDescription>
                    
                    {notification.type === 'new_user' && notification.userEmail && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => handlePromoteUser(notification.userEmail!, 'VIEWER')}
                          disabled={promoteUserMutation.isPending}
                        >
                          Visualizador
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => handlePromoteUser(notification.userEmail!, 'TECHNICIAN')}
                          disabled={promoteUserMutation.isPending}
                        >
                          Técnico
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => handlePromoteUser(notification.userEmail!, 'MANAGER')}
                          disabled={promoteUserMutation.isPending}
                        >
                          Gerente
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => handlePromoteUser(notification.userEmail!, 'ADMIN')}
                          disabled={promoteUserMutation.isPending}
                        >
                          Administrador
                        </Button>
                      </div>
                    )}
                    
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs mt-2"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}