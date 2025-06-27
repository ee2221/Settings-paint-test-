import { useState, useEffect } from 'react';
import {
  FirestoreObject,
  FirestoreGroup,
  FirestoreLight,
  FirestoreScene,
  subscribeToObjects,
  subscribeToGroups,
  subscribeToLights,
  saveObject,
  updateObject,
  deleteObject,
  saveGroup,
  updateGroup,
  deleteGroup,
  saveLight,
  updateLight,
  deleteLight,
  objectToFirestore,
  firestoreToObject
} from '../services/firestoreService';
import * as THREE from 'three';

// Hook for managing objects with Firestore
export const useFirestoreObjects = () => {
  const [objects, setObjects] = useState<FirestoreObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToObjects((firestoreObjects) => {
      setObjects(firestoreObjects);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addObject = async (object: THREE.Object3D, name: string) => {
    try {
      const firestoreData = objectToFirestore(object, name);
      await saveObject(firestoreData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add object');
      throw err;
    }
  };

  const updateObjectData = async (id: string, object: THREE.Object3D, name: string) => {
    try {
      const firestoreData = objectToFirestore(object, name, id);
      await updateObject(id, firestoreData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update object');
      throw err;
    }
  };

  const removeObject = async (id: string) => {
    try {
      await deleteObject(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove object');
      throw err;
    }
  };

  return {
    objects,
    loading,
    error,
    addObject,
    updateObject: updateObjectData,
    removeObject
  };
};

// Hook for managing groups with Firestore
export const useFirestoreGroups = () => {
  const [groups, setGroups] = useState<FirestoreGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToGroups((firestoreGroups) => {
      setGroups(firestoreGroups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addGroup = async (groupData: Omit<FirestoreGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await saveGroup({
        ...groupData,
        createdAt: undefined,
        updatedAt: undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add group');
      throw err;
    }
  };

  const updateGroupData = async (id: string, groupData: Partial<FirestoreGroup>) => {
    try {
      await updateGroup(id, groupData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
      throw err;
    }
  };

  const removeGroup = async (id: string) => {
    try {
      await deleteGroup(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove group');
      throw err;
    }
  };

  return {
    groups,
    loading,
    error,
    addGroup,
    updateGroup: updateGroupData,
    removeGroup
  };
};

// Hook for managing lights with Firestore
export const useFirestoreLights = () => {
  const [lights, setLights] = useState<FirestoreLight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToLights((firestoreLights) => {
      setLights(firestoreLights);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addLight = async (lightData: Omit<FirestoreLight, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await saveLight({
        ...lightData,
        createdAt: undefined,
        updatedAt: undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add light');
      throw err;
    }
  };

  const updateLightData = async (id: string, lightData: Partial<FirestoreLight>) => {
    try {
      await updateLight(id, lightData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update light');
      throw err;
    }
  };

  const removeLight = async (id: string) => {
    try {
      await deleteLight(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove light');
      throw err;
    }
  };

  return {
    lights,
    loading,
    error,
    addLight,
    updateLight: updateLightData,
    removeLight
  };
};

// Hook for converting Firestore objects to THREE.js objects
export const useThreeObjects = (firestoreObjects: FirestoreObject[]) => {
  const [threeObjects, setThreeObjects] = useState<Array<{
    id: string;
    object: THREE.Object3D;
    name: string;
    visible: boolean;
    locked: boolean;
    groupId?: string;
  }>>([]);

  useEffect(() => {
    const convertedObjects = firestoreObjects.map(firestoreObj => {
      const threeObject = firestoreToObject(firestoreObj);
      if (threeObject && firestoreObj.id) {
        return {
          id: firestoreObj.id,
          object: threeObject,
          name: firestoreObj.name,
          visible: firestoreObj.visible,
          locked: firestoreObj.locked,
          groupId: firestoreObj.groupId
        };
      }
      return null;
    }).filter(Boolean) as Array<{
      id: string;
      object: THREE.Object3D;
      name: string;
      visible: boolean;
      locked: boolean;
      groupId?: string;
    }>;

    setThreeObjects(convertedObjects);
  }, [firestoreObjects]);

  return threeObjects;
};

// Combined hook for easier integration
export const useFirestoreScene = () => {
  const objectsHook = useFirestoreObjects();
  const groupsHook = useFirestoreGroups();
  const lightsHook = useFirestoreLights();
  
  const threeObjects = useThreeObjects(objectsHook.objects);

  const loading = objectsHook.loading || groupsHook.loading || lightsHook.loading;
  const error = objectsHook.error || groupsHook.error || lightsHook.error;

  return {
    // Objects
    objects: threeObjects,
    firestoreObjects: objectsHook.objects,
    addObject: objectsHook.addObject,
    updateObject: objectsHook.updateObject,
    removeObject: objectsHook.removeObject,
    
    // Groups
    groups: groupsHook.groups,
    addGroup: groupsHook.addGroup,
    updateGroup: groupsHook.updateGroup,
    removeGroup: groupsHook.removeGroup,
    
    // Lights
    lights: lightsHook.lights,
    addLight: lightsHook.addLight,
    updateLight: lightsHook.updateLight,
    removeLight: lightsHook.removeLight,
    
    // Status
    loading,
    error
  };
};