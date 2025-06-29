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
  sceneId: string; // Make sceneId required for objects
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
  sceneId: string; // Make sceneId required for groups
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
  sceneId: string; // Make sceneId required for lights
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
    const batch = writeBatch(db);
    
    // Delete the scene document
    const sceneRef = doc(db, SCENES_COLLECTION, id);
    batch.delete(sceneRef);
    
    // Delete all objects in this scene
    const objectsQuery = query(
      collection(db, OBJECTS_COLLECTION),
      where('sceneId', '==', id)
    );
    const objectsSnapshot = await getDocs(objectsQuery);
    objectsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete all groups in this scene
    const groupsQuery = query(
      collection(db, GROUPS_COLLECTION),
      where('sceneId', '==', id)
    );
    const groupsSnapshot = await getDocs(groupsQuery);
    groupsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete all lights in this scene
    const lightsQuery = query(
      collection(db, LIGHTS_COLLECTION),
      where('sceneId', '==', id)
    );
    const lightsSnapshot = await getDocs(lightsQuery);
    lightsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Commit all deletions
    await batch.commit();
  } catch (error) {
    console.error('Error deleting scene and related data:', error);
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
export const objectToFirestore = (obj: any, name: string, sceneId: string, userId: string): FirestoreObject => {
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
    userId,
    sceneId // Always require sceneId for objects
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
    groupId: firestoreObj.groupId,
    sceneId: firestoreObj.sceneId
  };
};

// Object CRUD functions - All require sceneId for isolation
export const saveObject = async (object: Omit<FirestoreObject, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    if (!object.sceneId) {
      throw new Error('sceneId is required for saving objects');
    }
    
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

// Clear all objects for a specific scene (used when loading a project)
export const clearSceneObjects = async (sceneId: string, userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    const objectsQuery = query(
      collection(db, OBJECTS_COLLECTION),
      where('sceneId', '==', sceneId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(objectsQuery);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing scene objects:', error);
    throw error;
  }
};

export const subscribeToObjects = (userId: string, sceneId: string, callback: (objects: FirestoreObject[]) => void): Unsubscribe => {
  const q = query(
    collection(db, OBJECTS_COLLECTION),
    where('userId', '==', userId),
    where('sceneId', '==', sceneId),
    orderBy('createdAt', 'asc')
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

// Group CRUD functions - All require sceneId for isolation
export const saveGroup = async (group: Omit<FirestoreGroup, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    if (!group.sceneId) {
      throw new Error('sceneId is required for saving groups');
    }
    
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

// Clear all groups for a specific scene
export const clearSceneGroups = async (sceneId: string, userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    const groupsQuery = query(
      collection(db, GROUPS_COLLECTION),
      where('sceneId', '==', sceneId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(groupsQuery);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing scene groups:', error);
    throw error;
  }
};

export const subscribeToGroups = (userId: string, sceneId: string, callback: (groups: FirestoreGroup[]) => void): Unsubscribe => {
  const q = query(
    collection(db, GROUPS_COLLECTION),
    where('userId', '==', userId),
    where('sceneId', '==', sceneId),
    orderBy('createdAt', 'asc')
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

// Light CRUD functions - All require sceneId for isolation
export const saveLight = async (light: Omit<FirestoreLight, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    if (!light.sceneId) {
      throw new Error('sceneId is required for saving lights');
    }
    
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

// Clear all lights for a specific scene
export const clearSceneLights = async (sceneId: string, userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    const lightsQuery = query(
      collection(db, LIGHTS_COLLECTION),
      where('sceneId', '==', sceneId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(lightsQuery);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing scene lights:', error);
    throw error;
  }
};

export const subscribeToLights = (userId: string, sceneId: string, callback: (lights: FirestoreLight[]) => void): Unsubscribe => {
  const q = query(
    collection(db, LIGHTS_COLLECTION),
    where('userId', '==', userId),
    where('sceneId', '==', sceneId),
    orderBy('createdAt', 'asc')
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

// Utility function to completely clear a project's data
export const clearProjectData = async (sceneId: string, userId: string): Promise<void> => {
  try {
    await Promise.all([
      clearSceneObjects(sceneId, userId),
      clearSceneGroups(sceneId, userId),
      clearSceneLights(sceneId, userId)
    ]);
  } catch (error) {
    console.error('Error clearing project data:', error);
    throw error;
  }
};