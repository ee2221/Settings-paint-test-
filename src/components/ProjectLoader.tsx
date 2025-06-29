import React, { useEffect, useState } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { 
  subscribeToObjects, 
  subscribeToGroups, 
  subscribeToLights,
  getScene,
  FirestoreObject,
  FirestoreGroup,
  FirestoreLight,
  FirestoreScene
} from '../services/firestoreService';
import * as THREE from 'three';

interface ProjectLoaderProps {
  projectId: string | null;
  userId: string | null;
}

const ProjectLoader: React.FC<ProjectLoaderProps> = ({ projectId, userId }) => {
  const { 
    objects,
    groups,
    lights,
    addObject,
    createGroup,
    addLight,
    updateSceneSettings,
    setCameraPerspective,
    setSelectedObject
  } = useSceneStore();
  
  const [loading, setLoading] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  // Helper function to recreate THREE.js objects from Firestore data
  const recreateThreeObject = (firestoreObj: FirestoreObject): THREE.Object3D | null => {
    try {
      let geometry: THREE.BufferGeometry;
      
      // Recreate geometry based on stored parameters
      if (firestoreObj.geometry?.type === 'BoxGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.BoxGeometry(
          params.width || 1,
          params.height || 1,
          params.depth || 1
        );
      } else if (firestoreObj.geometry?.type === 'SphereGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.SphereGeometry(
          params.radius || 0.5,
          params.widthSegments || 32,
          params.heightSegments || 16
        );
      } else if (firestoreObj.geometry?.type === 'CylinderGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.CylinderGeometry(
          params.radiusTop || 0.5,
          params.radiusBottom || 0.5,
          params.height || 1,
          params.radialSegments || 32
        );
      } else if (firestoreObj.geometry?.type === 'ConeGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.ConeGeometry(
          params.radius || 0.5,
          params.height || 1,
          params.radialSegments || 32
        );
      } else {
        // Default to box geometry
        geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      // Recreate material
      const materialData = firestoreObj.material || {};
      const material = new THREE.MeshStandardMaterial({
        color: materialData.color || firestoreObj.color || '#44aa88',
        transparent: materialData.transparent || false,
        opacity: materialData.opacity || 1,
        metalness: materialData.metalness || 0,
        roughness: materialData.roughness || 1,
        wireframe: materialData.wireframe || false
      });

      if (materialData.emissive) {
        material.emissive.setStyle(materialData.emissive);
      }

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // Apply transform
      mesh.position.set(
        firestoreObj.position.x,
        firestoreObj.position.y,
        firestoreObj.position.z
      );
      mesh.rotation.set(
        firestoreObj.rotation.x,
        firestoreObj.rotation.y,
        firestoreObj.rotation.z
      );
      mesh.scale.set(
        firestoreObj.scale.x,
        firestoreObj.scale.y,
        firestoreObj.scale.z
      );
      
      mesh.visible = firestoreObj.visible !== false;
      
      return mesh;
    } catch (error) {
      console.error('Error recreating THREE.js object:', error);
      return null;
    }
  };

  // Helper function to recreate THREE.js lights from Firestore data
  const recreateThreeLight = (firestoreLight: FirestoreLight): THREE.Light | null => {
    try {
      let light: THREE.Light;
      
      const position = firestoreLight.position;
      const target = firestoreLight.target;
      
      switch (firestoreLight.type) {
        case 'directional':
          light = new THREE.DirectionalLight(
            firestoreLight.color,
            firestoreLight.intensity
          );
          light.position.set(position.x, position.y, position.z);
          if (target) {
            (light as THREE.DirectionalLight).target.position.set(target.x, target.y, target.z);
          }
          break;
          
        case 'point':
          light = new THREE.PointLight(
            firestoreLight.color,
            firestoreLight.intensity,
            firestoreLight.distance || 0,
            firestoreLight.decay || 2
          );
          light.position.set(position.x, position.y, position.z);
          break;
          
        case 'spot':
          light = new THREE.SpotLight(
            firestoreLight.color,
            firestoreLight.intensity,
            firestoreLight.distance || 0,
            firestoreLight.angle || Math.PI / 3,
            firestoreLight.penumbra || 0,
            firestoreLight.decay || 2
          );
          light.position.set(position.x, position.y, position.z);
          if (target) {
            (light as THREE.SpotLight).target.position.set(target.x, target.y, target.z);
          }
          break;
          
        default:
          return null;
      }
      
      light.visible = firestoreLight.visible !== false;
      light.castShadow = firestoreLight.castShadow !== false;
      
      return light;
    } catch (error) {
      console.error('Error recreating THREE.js light:', error);
      return null;
    }
  };

  // Load project data when projectId changes
  useEffect(() => {
    if (!projectId || !userId || projectId === loadedProjectId) return;

    const loadProject = async () => {
      setLoading(true);
      
      try {
        // Clear existing scene first
        setSelectedObject(null);
        
        // Load scene metadata
        const scene = await getScene(projectId);
        if (scene?.sceneData) {
          // Apply scene settings
          updateSceneSettings({
            backgroundColor: scene.sceneData.backgroundColor || '#0f0f23',
            showGrid: scene.sceneData.showGrid !== false,
            gridSize: scene.sceneData.gridSize || 10,
            gridDivisions: scene.sceneData.gridDivisions || 10
          });
          
          // Apply camera settings
          if (scene.sceneData.cameraPerspective) {
            setCameraPerspective(scene.sceneData.cameraPerspective);
          }
        }

        // Set up real-time subscriptions for project data
        const unsubscribeObjects = subscribeToObjects(userId, projectId, (firestoreObjects) => {
          // Convert Firestore objects to THREE.js objects and add to scene
          firestoreObjects.forEach((firestoreObj) => {
            // Check if object already exists in scene
            const existingObject = objects.find(obj => obj.id === firestoreObj.id);
            if (existingObject) return;

            const threeObject = recreateThreeObject(firestoreObj);
            if (threeObject) {
              // Add to scene store with metadata
              const sceneObject = {
                id: firestoreObj.id!,
                object: threeObject,
                name: firestoreObj.name,
                visible: firestoreObj.visible !== false,
                locked: firestoreObj.locked || false,
                groupId: firestoreObj.groupId
              };
              
              // Use the store's internal method to add without triggering save
              useSceneStore.setState(state => ({
                objects: [...state.objects.filter(obj => obj.id !== firestoreObj.id), sceneObject]
              }));
            }
          });
        });

        const unsubscribeGroups = subscribeToGroups(userId, projectId, (firestoreGroups) => {
          // Convert Firestore groups to scene groups
          firestoreGroups.forEach((firestoreGroup) => {
            // Check if group already exists
            const existingGroup = groups.find(group => group.id === firestoreGroup.id);
            if (existingGroup) return;

            const sceneGroup = {
              id: firestoreGroup.id!,
              name: firestoreGroup.name,
              expanded: firestoreGroup.expanded !== false,
              visible: firestoreGroup.visible !== false,
              locked: firestoreGroup.locked || false,
              objectIds: firestoreGroup.objectIds || []
            };
            
            // Use the store's internal method to add without triggering save
            useSceneStore.setState(state => ({
              groups: [...state.groups.filter(group => group.id !== firestoreGroup.id), sceneGroup]
            }));
          });
        });

        const unsubscribeLights = subscribeToLights(userId, projectId, (firestoreLights) => {
          // Convert Firestore lights to THREE.js lights and add to scene
          firestoreLights.forEach((firestoreLight) => {
            // Check if light already exists
            const existingLight = lights.find(light => light.id === firestoreLight.id);
            if (existingLight) return;

            const threeLight = recreateThreeLight(firestoreLight);
            if (threeLight) {
              const sceneLight = {
                id: firestoreLight.id!,
                name: firestoreLight.name,
                type: firestoreLight.type as 'directional' | 'point' | 'spot',
                position: [firestoreLight.position.x, firestoreLight.position.y, firestoreLight.position.z],
                target: firestoreLight.target 
                  ? [firestoreLight.target.x, firestoreLight.target.y, firestoreLight.target.z]
                  : [0, 0, 0],
                intensity: firestoreLight.intensity,
                color: firestoreLight.color,
                visible: firestoreLight.visible !== false,
                castShadow: firestoreLight.castShadow !== false,
                distance: firestoreLight.distance || 0,
                decay: firestoreLight.decay || 2,
                angle: firestoreLight.angle || Math.PI / 3,
                penumbra: firestoreLight.penumbra || 0,
                object: threeLight
              };
              
              // Use the store's internal method to add without triggering save
              useSceneStore.setState(state => ({
                lights: [...state.lights.filter(light => light.id !== firestoreLight.id), sceneLight]
              }));
            }
          });
        });

        setLoadedProjectId(projectId);
        
        // Store unsubscribe functions for cleanup
        return () => {
          unsubscribeObjects();
          unsubscribeGroups();
          unsubscribeLights();
        };
        
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, userId, loadedProjectId]);

  // Clear scene when projectId is removed
  useEffect(() => {
    if (!projectId && loadedProjectId) {
      // Clear the scene
      useSceneStore.setState({
        objects: [],
        groups: [],
        lights: [],
        selectedObject: null,
        selectedLight: null
      });
      setLoadedProjectId(null);
    }
  }, [projectId, loadedProjectId]);

  // Show loading indicator
  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading project...</span>
        </div>
      </div>
    );
  }

  return null;
};

export default ProjectLoader;