import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import * as THREE from 'three';

// Types for Firestore data
export interface SavedScene {
  id?: string;
  name: string;
  description?: string;
  thumbnail?: string;
  objects: SerializedObject[];
  groups: SerializedGroup[];
  lights: SerializedLight[];
  sceneSettings: any;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string;
  isPublic: boolean;
  tags?: string[];
}

export interface SerializedObject {
  id: string;
  name: string;
  type: string; // 'mesh', 'group', etc.
  visible: boolean;
  locked: boolean;
  groupId?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  geometry?: {
    type: string;
    parameters: any;
  };
  material?: {
    type: string;
    color: string;
    opacity: number;
    transparent: boolean;
    [key: string]: any;
  };
  children?: SerializedObject[];
}

export interface SerializedGroup {
  id: string;
  name: string;
  expanded: boolean;
  visible: boolean;
  locked: boolean;
  objectIds: string[];
}

export interface SerializedLight {
  id: string;
  name: string;
  type: 'directional' | 'point' | 'spot';
  position: number[];
  target: number[];
  intensity: number;
  color: string;
  visible: boolean;
  castShadow: boolean;
  distance: number;
  decay: number;
  angle: number;
  penumbra: number;
}

class FirestoreService {
  private scenesCollection = collection(db, 'scenes');

  // Serialize THREE.js objects for Firestore storage
  private serializeObject(obj: THREE.Object3D, sceneObject: any): SerializedObject {
    const serialized: SerializedObject = {
      id: sceneObject.id,
      name: sceneObject.name,
      type: obj.type,
      visible: sceneObject.visible,
      locked: sceneObject.locked,
      groupId: sceneObject.groupId,
      position: [obj.position.x, obj.position.y, obj.position.z],
      rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      scale: [obj.scale.x, obj.scale.y, obj.scale.z]
    };

    // Serialize geometry if it's a mesh
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const geometry = obj.geometry;
      serialized.geometry = {
        type: geometry.type,
        parameters: (geometry as any).parameters || {}
      };

      // Serialize material
      if (obj.material instanceof THREE.MeshStandardMaterial) {
        serialized.material = {
          type: obj.material.type,
          color: '#' + obj.material.color.getHexString(),
          opacity: obj.material.opacity,
          transparent: obj.material.transparent,
          metalness: obj.material.metalness,
          roughness: obj.material.roughness
        };
      }
    }

    // Handle groups with children
    if (obj instanceof THREE.Group && obj.children.length > 0) {
      serialized.children = obj.children.map((child, index) => 
        this.serializeObject(child, { 
          id: `${sceneObject.id}_child_${index}`, 
          name: `${sceneObject.name}_child_${index}`,
          visible: true,
          locked: false
        })
      );
    }

    return serialized;
  }

  // Deserialize Firestore data back to THREE.js objects
  private deserializeObject(serialized: SerializedObject): THREE.Object3D {
    let obj: THREE.Object3D;

    if (serialized.type === 'Group' || serialized.children) {
      // Create group
      obj = new THREE.Group();
      
      // Add children if they exist
      if (serialized.children) {
        serialized.children.forEach(child => {
          const childObj = this.deserializeObject(child);
          obj.add(childObj);
        });
      }
    } else if (serialized.geometry) {
      // Create geometry based on type
      let geometry: THREE.BufferGeometry;
      
      switch (serialized.geometry.type) {
        case 'BoxGeometry':
          const boxParams = serialized.geometry.parameters;
          geometry = new THREE.BoxGeometry(
            boxParams.width || 1,
            boxParams.height || 1,
            boxParams.depth || 1
          );
          break;
        case 'SphereGeometry':
          const sphereParams = serialized.geometry.parameters;
          geometry = new THREE.SphereGeometry(
            sphereParams.radius || 0.5,
            sphereParams.widthSegments || 32,
            sphereParams.heightSegments || 16
          );
          break;
        case 'CylinderGeometry':
          const cylinderParams = serialized.geometry.parameters;
          geometry = new THREE.CylinderGeometry(
            cylinderParams.radiusTop || 0.5,
            cylinderParams.radiusBottom || 0.5,
            cylinderParams.height || 1,
            cylinderParams.radialSegments || 32
          );
          break;
        case 'ConeGeometry':
          const coneParams = serialized.geometry.parameters;
          geometry = new THREE.ConeGeometry(
            coneParams.radius || 0.5,
            coneParams.height || 1,
            coneParams.radialSegments || 32
          );
          break;
        case 'TorusGeometry':
          const torusParams = serialized.geometry.parameters;
          geometry = new THREE.TorusGeometry(
            torusParams.radius || 0.5,
            torusParams.tube || 0.2,
            torusParams.radialSegments || 16,
            torusParams.tubularSegments || 100
          );
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      // Create material
      let material: THREE.Material;
      if (serialized.material) {
        material = new THREE.MeshStandardMaterial({
          color: serialized.material.color,
          opacity: serialized.material.opacity,
          transparent: serialized.material.transparent,
          metalness: serialized.material.metalness || 0,
          roughness: serialized.material.roughness || 1
        });
      } else {
        material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
      }

      obj = new THREE.Mesh(geometry, material);
    } else {
      // Fallback to empty group
      obj = new THREE.Group();
    }

    // Apply transform
    obj.position.set(...serialized.position);
    obj.rotation.set(...serialized.rotation);
    obj.scale.set(...serialized.scale);

    return obj;
  }

  // Save scene to Firestore
  async saveScene(
    name: string,
    objects: any[],
    groups: any[],
    lights: any[],
    sceneSettings: any,
    description?: string,
    isPublic: boolean = false,
    userId?: string
  ): Promise<string> {
    try {
      const serializedObjects = objects.map(obj => 
        this.serializeObject(obj.object, obj)
      );

      const sceneData: Omit<SavedScene, 'id'> = {
        name,
        description,
        objects: serializedObjects,
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          expanded: group.expanded,
          visible: group.visible,
          locked: group.locked,
          objectIds: group.objectIds
        })),
        lights: lights.map(light => ({
          id: light.id,
          name: light.name,
          type: light.type,
          position: light.position,
          target: light.target,
          intensity: light.intensity,
          color: light.color,
          visible: light.visible,
          castShadow: light.castShadow,
          distance: light.distance,
          decay: light.decay,
          angle: light.angle,
          penumbra: light.penumbra
        })),
        sceneSettings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId,
        isPublic,
        tags: []
      };

      const docRef = await addDoc(this.scenesCollection, sceneData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving scene:', error);
      throw error;
    }
  }

  // Load scene from Firestore
  async loadScene(sceneId: string): Promise<{
    objects: any[],
    groups: any[],
    lights: any[],
    sceneSettings: any,
    metadata: { name: string, description?: string }
  }> {
    try {
      const docRef = doc(this.scenesCollection, sceneId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Scene not found');
      }

      const data = docSnap.data() as SavedScene;

      // Deserialize objects
      const objects = data.objects.map(serializedObj => ({
        id: serializedObj.id,
        object: this.deserializeObject(serializedObj),
        name: serializedObj.name,
        visible: serializedObj.visible,
        locked: serializedObj.locked,
        groupId: serializedObj.groupId
      }));

      return {
        objects,
        groups: data.groups,
        lights: data.lights,
        sceneSettings: data.sceneSettings,
        metadata: {
          name: data.name,
          description: data.description
        }
      };
    } catch (error) {
      console.error('Error loading scene:', error);
      throw error;
    }
  }

  // Update existing scene
  async updateScene(
    sceneId: string,
    name: string,
    objects: any[],
    groups: any[],
    lights: any[],
    sceneSettings: any,
    description?: string
  ): Promise<void> {
    try {
      const docRef = doc(this.scenesCollection, sceneId);
      
      const serializedObjects = objects.map(obj => 
        this.serializeObject(obj.object, obj)
      );

      const updateData = {
        name,
        description,
        objects: serializedObjects,
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          expanded: group.expanded,
          visible: group.visible,
          locked: group.locked,
          objectIds: group.objectIds
        })),
        lights: lights.map(light => ({
          id: light.id,
          name: light.name,
          type: light.type,
          position: light.position,
          target: light.target,
          intensity: light.intensity,
          color: light.color,
          visible: light.visible,
          castShadow: light.castShadow,
          distance: light.distance,
          decay: light.decay,
          angle: light.angle,
          penumbra: light.penumbra
        })),
        sceneSettings,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating scene:', error);
      throw error;
    }
  }

  // Delete scene
  async deleteScene(sceneId: string): Promise<void> {
    try {
      const docRef = doc(this.scenesCollection, sceneId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting scene:', error);
      throw error;
    }
  }

  // Get all scenes (with optional filtering)
  async getScenes(userId?: string, isPublic?: boolean, limitCount: number = 50): Promise<SavedScene[]> {
    try {
      let q = query(this.scenesCollection, orderBy('updatedAt', 'desc'), limit(limitCount));

      if (userId && isPublic !== undefined) {
        q = query(
          this.scenesCollection,
          where('userId', '==', userId),
          where('isPublic', '==', isPublic),
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        );
      } else if (userId) {
        q = query(
          this.scenesCollection,
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        );
      } else if (isPublic !== undefined) {
        q = query(
          this.scenesCollection,
          where('isPublic', '==', isPublic),
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const scenes: SavedScene[] = [];

      querySnapshot.forEach((doc) => {
        scenes.push({
          id: doc.id,
          ...doc.data()
        } as SavedScene);
      });

      return scenes;
    } catch (error) {
      console.error('Error getting scenes:', error);
      throw error;
    }
  }

  // Get public scenes for browsing
  async getPublicScenes(limitCount: number = 20): Promise<SavedScene[]> {
    return this.getScenes(undefined, true, limitCount);
  }

  // Get user's scenes
  async getUserScenes(userId: string, limitCount: number = 50): Promise<SavedScene[]> {
    return this.getScenes(userId, undefined, limitCount);
  }

  // Search scenes by name or tags
  async searchScenes(searchTerm: string, isPublic: boolean = true): Promise<SavedScene[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that searches by name prefix
      const q = query(
        this.scenesCollection,
        where('isPublic', '==', isPublic),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        orderBy('name'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const scenes: SavedScene[] = [];

      querySnapshot.forEach((doc) => {
        scenes.push({
          id: doc.id,
          ...doc.data()
        } as SavedScene);
      });

      return scenes;
    } catch (error) {
      console.error('Error searching scenes:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();