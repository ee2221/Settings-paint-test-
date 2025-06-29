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
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe
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

export interface FirestoreObject {
  id?: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color?: string;
  material?: {
    type: string;
    color?: string;
    opacity?: number;
    transparent?: boolean;
    metalness?: number;
    roughness?: number;
    emissive?: string;
    wireframe?: boolean;
  };
  geometry?: {
    type: string;
    parameters?: any;
  };
  visible?: boolean;
  locked?: boolean;
  groupId?: string;
  userId: string;
  sceneId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreGroup {
  id?: string;
  name: string;
  objectIds: string[];
  expanded?: boolean;
  visible?: boolean;
  locked?: boolean;
  userId: string;
  sceneId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreLight {
  id?: string;
  name: string;
  type: 'ambient' | 'directional' | 'point' | 'spot';
  position: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  color: string;
  intensity: number;
  visible?: boolean;
  castShadow?: boolean;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  userId: string;
  sceneId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const SCENES_COLLECTION = 'scenes';
const OBJECTS_COLLECTION = 'objects';
const GROUPS_COLLECTION = 'groups';
const LIGHTS_COLLECTION = 'lights';

// Scene functions
export const saveScene = async (scene: Omit<FirestoreScene, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const sceneWithTimestamps = {
      ...scene,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, SCENES_COLLECTION), sceneWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving scene:', error);
    throw error;
  }
};

export const updateScene = async (id: string, updates: Partial<FirestoreScene>): Promise<void> => {
  try {
    const sceneRef = doc(db, SCENES_COLLECTION, id);
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
    const sceneRef = doc(db, SCENES_COLLECTION, id);
    await deleteDoc(sceneRef);
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
};

export const getScenes = async (userId: string): Promise<FirestoreScene[]> => {
  try {
    const q = query(
      collection(db, SCENES_COLLECTION),
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
    const sceneRef = doc(db, SCENES_COLLECTION, id);
    const docSnap = await getDocs(query(collection(db, SCENES_COLLECTION), where('__name__', '==', id)));
    
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

// Helper function to serialize Three.js material
const serializeMaterial = (material: any): any => {
  if (!material) return null;
  
  const serialized: any = {
    type: material.type || 'MeshStandardMaterial'
  };
  
  // Extract color
  if (material.color && typeof material.color.getHexString === 'function') {
    serialized.color = `#${material.color.getHexString()}`;
  }
  
  // Extract other common properties
  if (material.opacity !== undefined) serialized.opacity = material.opacity;
  if (material.transparent !== undefined) serialized.transparent = material.transparent;
  if (material.metalness !== undefined) serialized.metalness = material.metalness;
  if (material.roughness !== undefined) serialized.roughness = material.roughness;
  if (material.wireframe !== undefined) serialized.wireframe = material.wireframe;
  
  // Extract emissive color
  if (material.emissive && typeof material.emissive.getHexString === 'function') {
    serialized.emissive = `#${material.emissive.getHexString()}`;
  }
  
  return serialized;
};

// Helper function to serialize Three.js geometry
const serializeGeometry = (geometry: any): any => {
  if (!geometry) return null;
  
  const serialized: any = {
    type: geometry.type || 'BufferGeometry'
  };
  
  // Extract parameters for common geometries
  if (geometry.parameters) {
    serialized.parameters = { ...geometry.parameters };
  }
  
  return serialized;
};

// Object conversion functions
export const objectToFirestore = (obj: any, name: string, sceneId?: string, userId?: string): FirestoreObject => {
  const firestoreObj: FirestoreObject = {
    name: name || 'Unnamed Object',
    type: obj.type || 'mesh',
    position: {
      x: obj.position?.x || 0,
      y: obj.position?.y || 0,
      z: obj.position?.z || 0
    },
    rotation: {
      x: obj.rotation?.x || 0,
      y: obj.rotation?.y || 0,
      z: obj.rotation?.z || 0
    },
    scale: {
      x: obj.scale?.x || 1,
      y: obj.scale?.y || 1,
      z: obj.scale?.z || 1
    },
    userId: userId || '',
    sceneId: sceneId
  };

  // Serialize material
  if (obj.material) {
    firestoreObj.material = serializeMaterial(obj.material);
  }
  
  // Serialize geometry
  if (obj.geometry) {
    firestoreObj.geometry = serializeGeometry(obj.geometry);
  }

  // Extract color from material if it exists and is valid
  if (obj.isMesh && obj.material && obj.material.color && typeof obj.material.color.getHexString === 'function') {
    firestoreObj.color = `#${obj.material.color.getHexString()}`;
  } else if (obj.color && typeof obj.color === 'string') {
    firestoreObj.color = obj.color;
  }

  return firestoreObj;
};

export const firestoreToObject = (firestoreObj: FirestoreObject): any => {
  return {
    id: firestoreObj.id,
    name: firestoreObj.name,
    type: firestoreObj.type,
    position: firestoreObj.position,
    rotation: firestoreObj.rotation,
    scale: firestoreObj.scale,
    color: firestoreObj.color,
    material: firestoreObj.material,
    geometry: firestoreObj.geometry,
    visible: firestoreObj.visible,
    locked: firestoreObj.locked,
    groupId: firestoreObj.groupId
  };
};

// Object CRUD functions
export const saveObject = async (object: Omit<FirestoreObject, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const objectWithTimestamps = {
      ...object,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, OBJECTS_COLLECTION), objectWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving object:', error);
    throw error;
  }
};

export const updateObject = async (id: string, updates: Partial<FirestoreObject>): Promise<void> => {
  try {
    const objectRef = doc(db, OBJECTS_COLLECTION, id);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(objectRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating object:', error);
    throw error;
  }
};

export const deleteObject = async (id: string): Promise<void> => {
  try {
    const objectRef = doc(db, OBJECTS_COLLECTION, id);
    await deleteDoc(objectRef);
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
};

export const subscribeToObjects = (userId: string, sceneId: string, callback: (objects: FirestoreObject[]) => void): Unsubscribe => {
  const q = query(
    collection(db, OBJECTS_COLLECTION),
    where('userId', '==', userId),
    where('sceneId', '==', sceneId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const objects: FirestoreObject[] = [];
    querySnapshot.forEach((doc) => {
      objects.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreObject);
    });
    callback(objects);
  });
};

// Group CRUD functions
export const saveGroup = async (group: Omit<FirestoreGroup, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const groupWithTimestamps = {
      ...group,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving group:', error);
    throw error;
  }
};

export const updateGroup = async (id: string, updates: Partial<FirestoreGroup>): Promise<void> => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, id);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(groupRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const deleteGroup = async (id: string): Promise<void> => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, id);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const subscribeToGroups = (userId: string, sceneId: string, callback: (groups: FirestoreGroup[]) => void): Unsubscribe => {
  const q = query(
    collection(db, GROUPS_COLLECTION),
    where('userId', '==', userId),
    where('sceneId', '==', sceneId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const groups: FirestoreGroup[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreGroup);
    });
    callback(groups);
  });
};

// Light CRUD functions
export const saveLight = async (light: Omit<FirestoreLight, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const lightWithTimestamps = {
      ...light,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, LIGHTS_COLLECTION), lightWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving light:', error);
    throw error;
  }
};

export const updateLight = async (id: string, updates: Partial<FirestoreLight>): Promise<void> => {
  try {
    const lightRef = doc(db, LIGHTS_COLLECTION, id);
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(lightRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating light:', error);
    throw error;
  }
};

export const deleteLight = async (id: string): Promise<void> => {
  try {
    const lightRef = doc(db, LIGHTS_COLLECTION, id);
    await deleteDoc(lightRef);
  } catch (error) {
    console.error('Error deleting light:', error);
    throw error;
  }
};

export const subscribeToLights = (userId: string, sceneId: string, callback: (lights: FirestoreLight[]) => void): Unsubscribe => {
  const q = query(
    collection(db, LIGHTS_COLLECTION),
    where('userId', '==', userId),
    where('sceneId', '==', sceneId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const lights: FirestoreLight[] = [];
    querySnapshot.forEach((doc) => {
      lights.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreLight);
    });
    callback(lights);
  });
};