import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FirestoreScene {
  id?: string;
  name: string;
  description?: string;
  sceneData: any;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION_NAME = 'scenes';

export const saveScene = async (scene: Omit<FirestoreScene, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const sceneWithTimestamps = {
      ...scene,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sceneWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving scene:', error);
    throw error;
  }
};

export const updateScene = async (id: string, updates: Partial<FirestoreScene>): Promise<void> => {
  try {
    const sceneRef = doc(db, COLLECTION_NAME, id);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(sceneRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating scene:', error);
    throw error;
  }
};

export const deleteScene = async (id: string): Promise<void> => {
  try {
    const sceneRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(sceneRef);
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
};

export const getScenes = async (userId: string): Promise<FirestoreScene[]> => {
  try {
    // Remove orderBy to avoid composite index requirement
    // We'll sort on the client side instead
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const scenes: FirestoreScene[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      scenes.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreScene);
    });
    
    // Sort by createdAt on the client side (most recent first)
    scenes.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });
    
    return scenes;
  } catch (error) {
    console.error('Error getting scenes:', error);
    throw error;
  }
};

export const getScene = async (id: string): Promise<FirestoreScene | null> => {
  try {
    const sceneRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', id)));
    
    if (!docSnap.empty) {
      const doc = docSnap.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as FirestoreScene;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting scene:', error);
    throw error;
  }
};