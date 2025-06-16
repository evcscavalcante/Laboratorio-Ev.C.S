import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
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

  async syncToFirestore(data: SyncData): Promise<boolean> {
    try {
      if (!this.auth.currentUser) {
        console.log('⚠️ Usuário não autenticado - saltando sync Firebase');
        return false;
      }

      const userId = this.auth.currentUser.uid;
      const docRef = doc(db, 'laboratory_data', data.id);
      
      const syncData = {
        ...data,
        userId,
        updatedAt: new Date().toISOString(),
        syncedAt: Timestamp.now()
      };

      await setDoc(docRef, syncData, { merge: true });
      console.log(`✅ Dados sincronizados no Firebase: ${data.id}`);
      return true;
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
      id: ensaioData.id || `${type}_${Date.now()}`,
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
      id: equipData.id || `eq_${Date.now()}`,
      type: 'equipamento',
      subtype: equipData.tipo,
      data: equipData,
      userId: this.auth.currentUser?.uid || '',
      createdAt: equipData.createdAt || new Date().toISOString(),
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