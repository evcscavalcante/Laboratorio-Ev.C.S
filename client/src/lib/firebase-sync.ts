import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export interface SyncData {
  id: string;
  type: 'ensaio' | 'equipamento';
  subtype?: string;
  data: any;
  userId: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

class FirebaseSync {
  private auth = getAuth();

  async syncToFirestore(data: SyncData, isNew: boolean = false): Promise<boolean> {
    try {
      if (!this.auth.currentUser) {
        console.log('⚠️ Usuário não autenticado - saltando sync Firebase');
        return false;
      }

      const userId = this.auth.currentUser.uid;
      
      const syncData = {
        ...data,
        userId,
        updatedAt: new Date().toISOString(),
        syncedAt: Timestamp.now()
      };

      if (isNew) {
        // Para novos documentos, usar addDoc para garantir ID único
        const docRef = await addDoc(collection(db, 'laboratory_data'), syncData);
        console.log(`✅ Novo documento criado no Firebase: ${docRef.id}`);
        return true;
      } else {
        // Para atualizações, usar setDoc com ID específico
        const docId = String(data.id).replace(/[^a-zA-Z0-9_-]/g, '_');
        const docRef = doc(db, 'laboratory_data', docId);
        
        await setDoc(docRef, { ...syncData, id: docId }, { merge: true });
        console.log(`✅ Documento atualizado no Firebase: ${docId}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar com Firebase:', error);
      return false;
    }
  }

  async getFromFirestore(id: string): Promise<SyncData | null> {
    try {
      const docRef = doc(db, 'laboratory_data', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as SyncData;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar do Firebase:', error);
      return null;
    }
  }

  async syncEnsaio(ensaioData: any, type: string): Promise<boolean> {
    const syncData: SyncData = {
      id: String(ensaioData.id || `${type}_${Date.now()}`),
      type: 'ensaio',
      subtype: type,
      data: ensaioData,
      userId: this.auth.currentUser?.uid || '',
      createdAt: ensaioData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.syncToFirestore(syncData);
  }

  async syncEquipamento(equipData: any): Promise<boolean> {
    const syncData: SyncData = {
      id: String(equipData.id || `eq_${Date.now()}`),
      type: 'equipamento',
      subtype: equipData.tipo || 'unknown',
      data: equipData,
      userId: this.auth.currentUser?.uid || '',
      createdAt: equipData.created_at || equipData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Para equipamentos novos (sem ID fixo), criar documento único
    const isNew = !equipData.id || equipData.id.toString().startsWith('eq_');
    return await this.syncToFirestore(syncData, isNew);
  }

  async syncOrganization(orgData: any): Promise<boolean> {
    const syncData: SyncData = {
      id: orgData.id || `org_${Date.now()}`,
      type: 'organizacao' as any,
      subtype: 'organization',
      data: orgData,
      userId: this.auth.currentUser?.uid || '',
      organizationId: orgData.id?.toString(),
      createdAt: orgData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.syncToFirestore(syncData);
  }

  watchUserData(callback: (data: SyncData[]) => void): () => void {
    if (!this.auth.currentUser) {
      return () => {};
    }

    const q = query(
      collection(db, 'laboratory_data'),
      where('userId', '==', this.auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const data: SyncData[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data() as SyncData);
      });
      callback(data);
    });
  }
}

export const firebaseSync = new FirebaseSync();