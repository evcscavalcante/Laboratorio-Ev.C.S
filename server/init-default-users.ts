import bcrypt from 'bcrypt';
import { storage } from './storage-corrected';

export async function initializeDefaultUsers() {
  try {
    // Check if users already exist
    const existingUsers = await storage.getUsers();
    if (existingUsers.length > 0) {
      console.log('Usuários já existem no sistema');
      return;
    }

    // Hash passwords
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const managerPassword = await bcrypt.hash('manager123', saltRounds);
    const supervisorPassword = await bcrypt.hash('supervisor123', saltRounds);
    const technicianPassword = await bcrypt.hash('technician123', saltRounds);

    // Create default users
    const defaultUsers = [
      {
        id: 'admin',
        username: 'admin',
        name: 'Administrador Sistema',
        email: 'admin@laboratorio-evcs.com',
        password: adminPassword,
        role: 'ADMIN',
        firstName: 'Administrador',
        lastName: 'Sistema',
        isActive: true,
        active: true,
        organizationId: null,
        profileImageUrl: null,
        permissions: null
      },
      {
        id: 'manager',
        username: 'manager',
        name: 'Gerente Laboratório',
        email: 'manager@laboratorio-evcs.com',
        password: managerPassword,
        role: 'MANAGER',
        firstName: 'Gerente',
        lastName: 'Laboratório',
        isActive: true,
        active: true,
        organizationId: null,
        profileImageUrl: null,
        permissions: null
      },
      {
        id: 'supervisor',
        username: 'supervisor',
        name: 'Supervisor Técnico',
        email: 'supervisor@laboratorio-evcs.com',
        password: supervisorPassword,
        role: 'SUPERVISOR',
        firstName: 'Supervisor',
        lastName: 'Técnico',
        isActive: true,
        active: true,
        organizationId: null,
        profileImageUrl: null,
        permissions: null
      },
      {
        id: 'technician',
        username: 'technician',
        name: 'Técnico Laboratório',
        email: 'technician@laboratorio-evcs.com',
        password: technicianPassword,
        role: 'TECHNICIAN',
        firstName: 'Técnico',
        lastName: 'Laboratório',
        isActive: true,
        active: true,
        organizationId: null,
        profileImageUrl: null,
        permissions: null
      }
    ];

    // Create users in storage
    for (const userData of defaultUsers) {
      await storage.createUser(userData);
      console.log(`Usuário criado: ${userData.username} (${userData.role})`);
    }

    console.log('✅ Usuários padrão inicializados com sucesso');
    console.log('Credenciais de acesso:');
    console.log('- admin/admin123 (Administrador)');
    console.log('- manager/manager123 (Gerente)');
    console.log('- supervisor/supervisor123 (Supervisor)');
    console.log('- technician/technician123 (Técnico)');

  } catch (error) {
    console.error('❌ Erro ao inicializar usuários padrão:', error);
  }
}