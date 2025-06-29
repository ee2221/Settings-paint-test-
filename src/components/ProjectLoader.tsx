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
    updateSceneSettings,
    setCameraPerspective,
    setSelectedObject,
    loadObjectFromFirestore,
    loadGroupFromFirestore,
    loadLightFromFirestore
  } = useSceneStore();
  
  const [loading, setLoading] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  // Helper function to recreate THREE.Shape from serialized data
  const recreateShape = (serializedShape: any): THREE.Shape | null => {
    try {
      if (!serializedShape || !serializedShape.points) return null;
      
      const shape = new THREE.Shape();
      
      // Recreate the main shape path
      if (serializedShape.points.length > 0) {
        const firstPoint = serializedShape.points[0];
        shape.moveTo(firstPoint[0], firstPoint[1]);
        
        for (let i = 1; i < serializedShape.points.length; i++) {
          const point = serializedShape.points[i];
          shape.lineTo(point[0], point[1]);
        }
      }
      
      // Recreate holes if they exist
      if (serializedShape.holes && Array.isArray(serializedShape.holes)) {
        serializedShape.holes.forEach((holePoints: number[][]) => {
          if (holePoints.length > 0) {
            const hole = new THREE.Path();
            const firstPoint = holePoints[0];
            hole.moveTo(firstPoint[0], firstPoint[1]);
            
            for (let i = 1; i < holePoints.length; i++) {
              const point = holePoints[i];
              hole.lineTo(point[0], point[1]);
            }
            
            shape.holes.push(hole);
          }
        });
      }
      
      return shape;
    } catch (error) {
      console.error('Error recreating shape:', error);
      return null;
    }
  };

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
          params.depth || 1,
          params.widthSegments || 1,
          params.heightSegments || 1,
          params.depthSegments || 1
        );
      } else if (firestoreObj.geometry?.type === 'SphereGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.SphereGeometry(
          params.radius || 0.5,
          params.widthSegments || 32,
          params.heightSegments || 16,
          params.phiStart || 0,
          params.phiLength || Math.PI * 2,
          params.thetaStart || 0,
          params.thetaLength || Math.PI
        );
      } else if (firestoreObj.geometry?.type === 'CylinderGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.CylinderGeometry(
          params.radiusTop || 0.5,
          params.radiusBottom || 0.5,
          params.height || 1,
          params.radialSegments || 32,
          params.heightSegments || 1,
          params.openEnded || false,
          params.thetaStart || 0,
          params.thetaLength || Math.PI * 2
        );
      } else if (firestoreObj.geometry?.type === 'ConeGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.ConeGeometry(
          params.radius || 0.5,
          params.height || 1,
          params.radialSegments || 32,
          params.heightSegments || 1,
          params.openEnded || false,
          params.thetaStart || 0,
          params.thetaLength || Math.PI * 2
        );
      } else if (firestoreObj.geometry?.type === 'PlaneGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.PlaneGeometry(
          params.width || 1,
          params.height || 1,
          params.widthSegments || 1,
          params.heightSegments || 1
        );
      } else if (firestoreObj.geometry?.type === 'TorusGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        geometry = new THREE.TorusGeometry(
          params.radius || 1,
          params.tube || 0.4,
          params.radialSegments || 12,
          params.tubularSegments || 48,
          params.arc || Math.PI * 2
        );
      } else if (firestoreObj.geometry?.type === 'ShapeGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        
        // Recreate shapes from serialized data
        if (params.shapes && Array.isArray(params.shapes)) {
          const shapes: THREE.Shape[] = [];
          
          params.shapes.forEach((serializedShape: any) => {
            const shape = recreateShape(serializedShape);
            if (shape) {
              shapes.push(shape);
            }
          });
          
          if (shapes.length > 0) {
            geometry = new THREE.ShapeGeometry(
              shapes.length === 1 ? shapes[0] : shapes,
              params.curveSegments || 12
            );
          } else {
            // Fallback to box geometry if shape recreation fails
            console.warn('Failed to recreate shapes, falling back to box geometry');
            geometry = new THREE.BoxGeometry(1, 1, 1);
          }
        } else {
          // Fallback to box geometry if no shapes data
          console.warn('No shapes data found, falling back to box geometry');
          geometry = new THREE.BoxGeometry(1, 1, 1);
        }
      } else if (firestoreObj.geometry?.type === 'ExtrudeGeometry') {
        const params = firestoreObj.geometry.parameters || {};
        
        // Try to recreate extrude geometry
        if (params.shapes && Array.isArray(params.shapes)) {
          const shapes: THREE.Shape[] = [];
          
          params.shapes.forEach((serializedShape: any) => {
            const shape = recreateShape(serializedShape);
            if (shape) {
              shapes.push(shape);
            }
          });
          
          if (shapes.length > 0) {
            const extrudeSettings = {
              depth: params.options?.depth || 1,
              bevelEnabled: params.options?.bevelEnabled || false,
              bevelSegments: params.options?.bevelSegments || 3,
              steps: params.options?.steps || 1,
              bevelSize: params.options?.bevelSize || 0.1,
              bevelThickness: params.options?.bevelThickness || 0.1
            };
            
            geometry = new THREE.ExtrudeGeometry(
              shapes.length === 1 ? shapes[0] : shapes,
              extrudeSettings
            );
          } else {
            // Fallback to box geometry
            console.warn('Failed to recreate extrude shapes, falling back to box geometry');
            geometry = new THREE.BoxGeometry(1, 1, 1);
          }
        } else {
          // Fallback to box geometry
          console.warn('No extrude shapes data found, falling back to box geometry');
          geometry = new THREE.BoxGeometry(1, 1, 1);
        }
      } else {
        // Default to box geometry for unknown types
        console.warn(`Unknown geometry type: ${firestoreObj.geometry?.type}, falling back to box geometry`);
        geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      // Recreate material with all properties
      const materialData = firestoreObj.material || {};
      const material = new THREE.MeshStandardMaterial({
        color: materialData.color || firestoreObj.color || '#44aa88',
        transparent: materialData.transparent || false,
        opacity: materialData.opacity !== undefined ? materialData.opacity : 1,
        metalness: materialData.metalness !== undefined ? materialData.metalness : 0,
        roughness: materialData.roughness !== undefined ? materialData.roughness : 1,
        wireframe: materialData.wireframe || false
      });

      // Set emissive color if provided
      if (materialData.emissive) {
        material.emissive.setStyle(materialData.emissive);
      }

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // Apply transform properties
      mesh.position.set(
        firestoreObj.position.x || 0,
        firestoreObj.position.y || 0,
        firestoreObj.position.z || 0
      );
      mesh.rotation.set(
        firestoreObj.rotation.x || 0,
        firestoreObj.rotation.y || 0,
        firestoreObj.rotation.z || 0
      );
      mesh.scale.set(
        firestoreObj.scale.x || 1,
        firestoreObj.scale.y || 1,
        firestoreObj.scale.z || 1
      );
      
      mesh.visible = firestoreObj.visible !== false;
      
      return mesh;
    } catch (error) {
      console.error('Error recreating THREE.js object:', error);
      // Return a fallback box geometry instead of null
      const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
      const fallbackMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000' }); // Red to indicate error
      const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
      
      // Apply basic transform if available
      if (firestoreObj.position) {
        fallbackMesh.position.set(
          firestoreObj.position.x || 0,
          firestoreObj.position.y || 0,
          firestoreObj.position.z || 0
        );
      }
      
      return fallbackMesh;
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
        
        // Clear the scene state
        useSceneStore.setState({
          objects: [],
          groups: [],
          lights: [],
          selectedObject: null,
          selectedLight: null
        });
        
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
            const threeObject = recreateThreeObject(firestoreObj);
            if (threeObject) {
              // Use the store's loading function to add the object
              loadObjectFromFirestore({
                id: firestoreObj.id,
                localId: crypto.randomUUID(),
                threeObject,
                name: firestoreObj.name,
                visible: firestoreObj.visible !== false,
                locked: firestoreObj.locked || false,
                groupId: firestoreObj.groupId
              });
            }
          });
        });

        const unsubscribeGroups = subscribeToGroups(userId, projectId, (firestoreGroups) => {
          // Convert Firestore groups to scene groups
          firestoreGroups.forEach((firestoreGroup) => {
            loadGroupFromFirestore({
              id: firestoreGroup.id,
              name: firestoreGroup.name,
              expanded: firestoreGroup.expanded !== false,
              visible: firestoreGroup.visible !== false,
              locked: firestoreGroup.locked || false,
              objectIds: firestoreGroup.objectIds || []
            });
          });
        });

        const unsubscribeLights = subscribeToLights(userId, projectId, (firestoreLights) => {
          // Convert Firestore lights to THREE.js lights and add to scene
          firestoreLights.forEach((firestoreLight) => {
            const threeLight = recreateThreeLight(firestoreLight);
            if (threeLight) {
              loadLightFromFirestore({
                id: firestoreLight.id,
                name: firestoreLight.name,
                type: firestoreLight.type,
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
                threeObject: threeLight
              });
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