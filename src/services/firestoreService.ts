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
  Unsubscribe,
  writeBatch
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
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection names - each project gets its own subcollections
const SCENES_COLLECTION = 'scenes';

// Helper functions to get project-specific collection paths
const getProjectObjectsCollection = (projectId: string) => `${SCENES_COLLECTION}/${projectId}/objects`;
const getProjectGroupsCollection = (projectId: string) => `${SCENES_COLLECTION}/${projectId}/groups`;
const getProjectLightsCollection = (projectId: string) => `${SCENES_COLLECTION}/${projectId}/lights`;

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
    const batch = writeBatch(db);
    
    // Delete all objects in the project
    const objectsQuery = query(collection(db, getProjectObjectsCollection(id)));
    const objectsSnapshot = await getDocs(objectsQuery);
    objectsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete all groups in the project
    const groupsQuery = query(collection(db, getProjectGroupsCollection(id)));
    const groupsSnapshot = await getDocs(groupsQuery);
    groupsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete all lights in the project
    const lightsQuery = query(collection(db, getProjectLightsCollection(id)));
    const lightsSnapshot = await getDocs(lightsQuery);
    lightsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the scene document itself
    const sceneRef = doc(db, SCENES_COLLECTION, id);
    batch.delete(sceneRef);
    
    // Commit all deletions
    await batch.commit();
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
};

export const getScenes = async (userId: string): Promise<FirestoreScene[]> => {
  try {
    const q = query(
      collection(db, SCENES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const scenes: FirestoreScene[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      scenes.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreScene);
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
export const objectToFirestore = (obj: any, name: string, projectId?: string, userId?: string): FirestoreObject => {
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
    userId: userId || ''
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

// Project-specific Object CRUD functions
export const saveObject = async (object: Omit<FirestoreObject, 'id' | 'createdAt' | 'updatedAt'>, userId: string, projectId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const objectWithTimestamps = {
      ...object,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, getProjectObjectsCollection(projectId)), objectWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving object:', error);
    throw error;
  }
};

export const updateObject = async (id: string, updates: Partial<FirestoreObject>, projectId: string): Promise<void> => {
  try {
    const objectRef = doc(db, getProjectObjectsCollection(projectId), id);
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

export const deleteObject = async (id: string, projectId: string): Promise<void> => {
  try {
    const objectRef = doc(db, getProjectObjectsCollection(projectId), id);
    await deleteDoc(objectRef);
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
};

export const subscribeToObjects = (userId: string, projectId: string, callback: (objects: FirestoreObject[]) => void): Unsubscribe => {
  const q = query(
    collection(db, getProjectObjectsCollection(projectId)),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
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

// Project-specific Group CRUD functions
export const saveGroup = async (group: Omit<FirestoreGroup, 'id' | 'createdAt' | 'updatedAt'>, userId: string, projectId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const groupWithTimestamps = {
      ...group,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, getProjectGroupsCollection(projectId)), groupWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving group:', error);
    throw error;
  }
};

export const updateGroup = async (id: string, updates: Partial<FirestoreGroup>, projectId: string): Promise<void> => {
  try {
    const groupRef = doc(db, getProjectGroupsCollection(projectId), id);
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

export const deleteGroup = async (id: string, projectId: string): Promise<void> => {
  try {
    const groupRef = doc(db, getProjectGroupsCollection(projectId), id);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const subscribeToGroups = (userId: string, projectId: string, callback: (groups: FirestoreGroup[]) => void): Unsubscribe => {
  const q = query(
    collection(db, getProjectGroupsCollection(projectId)),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
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

// Project-specific Light CRUD functions
export const saveLight = async (light: Omit<FirestoreLight, 'id' | 'createdAt' | 'updatedAt'>, userId: string, projectId: string): Promise<string> => {
  try {
    const now = Timestamp.now();
    const lightWithTimestamps = {
      ...light,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, getProjectLightsCollection(projectId)), lightWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving light:', error);
    throw error;
  }
};

export const updateLight = async (id: string, updates: Partial<FirestoreLight>, projectId: string): Promise<void> => {
  try {
    const lightRef = doc(db, getProjectLightsCollection(projectId), id);
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

export const deleteLight = async (id: string, projectId: string): Promise<void> => {
  try {
    const lightRef = doc(db, getProjectLightsCollection(projectId), id);
    await deleteDoc(lightRef);
  } catch (error) {
    console.error('Error deleting light:', error);
    throw error;
  }
};

export const subscribeToLights = (userId: string, projectId: string, callback: (lights: FirestoreLight[]) => void): Unsubscribe => {
  const q = query(
    collection(db, getProjectLightsCollection(projectId)),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
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

// Batch operations for better performance
export const saveProjectData = async (
  projectId: string,
  userId: string,
  objects: FirestoreObject[],
  groups: FirestoreGroup[],
  lights: FirestoreLight[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();

    // Save all objects
    objects.forEach(obj => {
      const docRef = doc(collection(db, getProjectObjectsCollection(projectId)));
      batch.set(docRef, {
        ...obj,
        userId,
        createdAt: now,
        updatedAt: now
      });
    });

    // Save all groups
    groups.forEach(group => {
      const docRef = doc(collection(db, getProjectGroupsCollection(projectId)));
      batch.set(docRef, {
        ...group,
        userId,
        createdAt: now,
        updatedAt: now
      });
    });

    // Save all lights
    lights.forEach(light => {
      const docRef = doc(collection(db, getProjectLightsCollection(projectId)));
      batch.set(docRef, {
        ...light,
        userId,
        createdAt: now,
        updatedAt: now
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error saving project data:', error);
    throw error;
  }
};

// Load complete project data
export const loadProjectData = async (projectId: string, userId: string): Promise<{
  objects: FirestoreObject[];
  groups: FirestoreGroup[];
  lights: FirestoreLight[];
}> => {
  try {
    const [objectsSnapshot, groupsSnapshot, lightsSnapshot] = await Promise.all([
      getDocs(query(
        collection(db, getProjectObjectsCollection(projectId)),
        where('userId', '==', userId)
      )),
      getDocs(query(
        collection(db, getProjectGroupsCollection(projectId)),
        where('userId', '==', userId)
      )),
      getDocs(query(
        collection(db, getProjectLightsCollection(projectId)),
        where('userId', '==', userId)
      ))
    ]);

    const objects: FirestoreObject[] = [];
    objectsSnapshot.forEach(doc => {
      objects.push({ id: doc.id, ...doc.data() } as FirestoreObject);
    });

    const groups: FirestoreGroup[] = [];
    groupsSnapshot.forEach(doc => {
      groups.push({ id: doc.id, ...doc.data() } as FirestoreGroup);
    });

    const lights: FirestoreLight[] = [];
    lightsSnapshot.forEach(doc => {
      lights.push({ id: doc.id, ...doc.data() } as FirestoreLight);
    });

    return { objects, groups, lights };
  } catch (error) {
    console.error('Error loading project data:', error);
    throw error;
  }
};