import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
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

// Collection names - now project-based
const SCENES_COLLECTION = 'scenes';

// Helper functions to get project-specific collection paths
const getProjectObjectsCollection = (projectId: string) => `projects/${projectId}/objects`;
const getProjectGroupsCollection = (projectId: string) => `projects/${projectId}/groups`;
const getProjectLightsCollection = (projectId: string) => `projects/${projectId}/lights`;

// Scene functions (main project documents)
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
    
    // Note: In a production app, you'd also want to delete all subcollections
    // This would require a cloud function or batch operations to delete all
    // objects, groups, and lights in the project subcollections
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
    const docSnap = await getDoc(sceneRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
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

// Helper function to serialize THREE.Shape objects
const serializeShape = (shape: any): any => {
  if (!shape || !shape.getPoints) return null;
  
  try {
    // Get the points from the shape
    const points = shape.getPoints();
    const serializedPoints = points.map((point: any) => [point.x, point.y]);
    
    // Serialize holes if they exist
    const serializedHoles: any[] = [];
    if (shape.holes && Array.isArray(shape.holes)) {
      shape.holes.forEach((hole: any) => {
        if (hole.getPoints) {
          const holePoints = hole.getPoints();
          serializedHoles.push(holePoints.map((point: any) => [point.x, point.y]));
        }
      });
    }
    
    return {
      points: serializedPoints,
      holes: serializedHoles
    };
  } catch (error) {
    console.error('Error serializing shape:', error);
    return null;
  }
};

// Helper function to deep clone an object, avoiding circular references
const deepClone = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// Helper function to serialize Three.js geometry
const serializeGeometry = (geometry: any): any => {
  if (!geometry) return null;
  
  const serialized: any = {
    type: geometry.type || 'BufferGeometry'
  };
  
  // Extract parameters for common geometries
  if (geometry.parameters) {
    // Create a deep copy of parameters to avoid modifying the original
    const params = deepClone(geometry.parameters);
    
    // Special handling for ShapeGeometry
    if (geometry.type === 'ShapeGeometry' && params.shapes) {
      if (Array.isArray(params.shapes)) {
        // Multiple shapes - serialize each one
        params.shapes = params.shapes.map((shape: any) => serializeShape(shape)).filter(Boolean);
      } else {
        // Single shape - serialize it and wrap in array
        const serializedShape = serializeShape(params.shapes);
        if (serializedShape) {
          params.shapes = [serializedShape];
        } else {
          // If serialization failed, remove the shapes property
          delete params.shapes;
        }
      }
    }
    
    serialized.parameters = params;
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