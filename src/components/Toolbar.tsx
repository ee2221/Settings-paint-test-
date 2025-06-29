import React from 'react';
import { 
  Box, 
  Sphere, 
  Cylinder, 
  Cone, 
  Torus,
  Move3D,
  RotateCcw,
  Scale,
  MousePointer2,
  Edit,
  Navigation,
  Trees,
  Mountain,
  Flower2,
  TreePine,
  TreeDeciduous
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { 
    selectedObject, 
    transformMode, 
    editMode,
    setTransformMode, 
    setEditMode,
    startObjectPlacement 
  } = useSceneStore();

  // Nature objects with more detailed geometries
  const createPineTree = () => {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75;
    group.add(trunk);
    
    // Tree layers (3 layers)
    const layerColors = ['#0F4C0F', '#1F5F1F', '#2F6F2F'];
    const layerSizes = [0.8, 0.6, 0.4];
    const layerHeights = [0.8, 0.6, 0.4];
    
    layerSizes.forEach((size, index) => {
      const coneGeometry = new THREE.ConeGeometry(size, layerHeights[index], 8);
      const coneMaterial = new THREE.MeshStandardMaterial({ color: layerColors[index] });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.y = 1.5 + (index * 0.4) + (layerHeights[index] / 2);
      group.add(cone);
    });
    
    return group;
  };

  const createOakTree = () => {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 2);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    group.add(trunk);
    
    // Foliage (sphere)
    const foliageGeometry = new THREE.SphereGeometry(1.2, 16, 12);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 2.5;
    foliage.scale.y = 0.8; // Slightly flatten
    group.add(foliage);
    
    return group;
  };

  const createFlower = () => {
    const group = new THREE.Group();
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    group.add(stem);
    
    // Flower center
    const centerGeometry = new THREE.SphereGeometry(0.08, 8, 6);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.5;
    group.add(center);
    
    // Petals
    const petalGeometry = new THREE.SphereGeometry(0.06, 6, 4);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });
    
    for (let i = 0; i < 6; i++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      const angle = (i / 6) * Math.PI * 2;
      petal.position.x = Math.cos(angle) * 0.12;
      petal.position.z = Math.sin(angle) * 0.12;
      petal.position.y = 0.5;
      petal.scale.set(0.8, 0.5, 1.2);
      group.add(petal);
    }
    
    return group;
  };

  const createBoulder = () => {
    const group = new THREE.Group();
    
    // Main boulder (irregular sphere)
    const boulderGeometry = new THREE.SphereGeometry(0.8, 8, 6);
    const boulderMaterial = new THREE.MeshStandardMaterial({ color: '#696969' });
    const boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
    boulder.scale.set(1.2, 0.8, 1.1); // Make it irregular
    boulder.position.y = 0.4;
    group.add(boulder);
    
    return group;
  };

  const createSmallRock = () => {
    const rockGeometry = new THREE.SphereGeometry(0.3, 6, 4);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: '#808080' });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.scale.set(1.3, 0.7, 1.1); // Make it irregular
    rock.position.y = 0.15;
    return rock;
  };

  const createGrassPatch = () => {
    const group = new THREE.Group();
    
    // Create multiple grass blades
    for (let i = 0; i < 12; i++) {
      const grassGeometry = new THREE.CylinderGeometry(0.01, 0.02, 0.3);
      const grassMaterial = new THREE.MeshStandardMaterial({ color: '#32CD32' });
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      
      // Random positioning within a small area
      grass.position.x = (Math.random() - 0.5) * 0.4;
      grass.position.z = (Math.random() - 0.5) * 0.4;
      grass.position.y = 0.15;
      
      // Slight random rotation
      grass.rotation.z = (Math.random() - 0.5) * 0.3;
      
      group.add(grass);
    }
    
    return group;
  };

  const primitiveTools = [
    {
      icon: Box,
      name: 'Cube',
      action: () => startObjectPlacement({
        geometry: () => new THREE.BoxGeometry(1, 1, 1),
        name: 'Cube'
      })
    },
    {
      icon: Sphere,
      name: 'Sphere',
      action: () => startObjectPlacement({
        geometry: () => new THREE.SphereGeometry(0.5, 32, 16),
        name: 'Sphere'
      })
    },
    {
      icon: Cylinder,
      name: 'Cylinder',
      action: () => startObjectPlacement({
        geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
        name: 'Cylinder'
      })
    },
    {
      icon: Cone,
      name: 'Cone',
      action: () => startObjectPlacement({
        geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
        name: 'Cone'
      })
    },
    {
      icon: Torus,
      name: 'Torus',
      action: () => startObjectPlacement({
        geometry: () => new THREE.TorusGeometry(0.5, 0.2, 16, 100),
        name: 'Torus'
      })
    }
  ] as const;

  const transformTools = [
    {
      icon: MousePointer2,
      mode: null,
      name: 'Select',
      shortcut: 'Q'
    },
    {
      icon: Move3D,
      mode: 'translate' as const,
      name: 'Move',
      shortcut: 'G'
    },
    {
      icon: RotateCcw,
      mode: 'rotate' as const,
      name: 'Rotate',
      shortcut: 'R'
    },
    {
      icon: Scale,
      mode: 'scale' as const,
      name: 'Scale',
      shortcut: 'S'
    }
  ] as const;

  const editTools = [
    {
      icon: Navigation,
      mode: 'vertex' as const,
      name: 'Edit Vertices',
      shortcut: 'V'
    },
    {
      icon: Edit,
      mode: 'edge' as const,
      name: 'Edit Edges',
      shortcut: 'E'
    }
  ] as const;

  const natureTools = [
    {
      icon: TreePine,
      name: 'Pine Tree',
      action: () => startObjectPlacement({
        geometry: createPineTree,
        name: 'Pine Tree',
        color: '#0F4C0F'
      })
    },
    {
      icon: TreeDeciduous,
      name: 'Oak Tree',
      action: () => startObjectPlacement({
        geometry: createOakTree,
        name: 'Oak Tree',
        color: '#228B22'
      })
    },
    {
      icon: Flower2,
      name: 'Flower',
      action: () => startObjectPlacement({
        geometry: createFlower,
        name: 'Flower',
        color: '#FF69B4'
      })
    },
    {
      icon: Mountain,
      name: 'Boulder',
      action: () => startObjectPlacement({
        geometry: createBoulder,
        name: 'Boulder',
        color: '#696969'
      })
    },
    {
      icon: Mountain,
      name: 'Small Rock',
      action: () => startObjectPlacement({
        geometry: createSmallRock,
        name: 'Small Rock',
        color: '#808080'
      })
    },
    {
      icon: Trees,
      name: 'Grass Patch',
      action: () => startObjectPlacement({
        geometry: createGrassPatch,
        name: 'Grass Patch',
        color: '#32CD32'
      })
    }
  ] as const;

  const handleTransformMode = (mode: 'translate' | 'rotate' | 'scale' | null) => {
    // Toggle off if clicking the same mode
    if (transformMode === mode) {
      setTransformMode(null);
    } else {
      setTransformMode(mode);
    }
  };

  const handleEditMode = (mode: 'vertex' | 'edge') => {
    // Toggle off if clicking the same mode
    if (editMode === mode) {
      setEditMode(null);
    } else {
      setEditMode(mode);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle Escape key to deselect edit modes
      if (event.key === 'Escape') {
        if (editMode) {
          setEditMode(null);
        }
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'q':
          setTransformMode(null);
          break;
        case 'g':
          handleTransformMode('translate');
          break;
        case 'r':
          handleTransformMode('rotate');
          break;
        case 's':
          handleTransformMode('scale');
          break;
        case 'v':
          if (selectedObject) handleEditMode('vertex');
          break;
        case 'e':
          if (selectedObject) handleEditMode('edge');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transformMode, editMode, selectedObject, setTransformMode, setEditMode]);

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-3 border border-white/5 z-10">
      <div className="flex flex-col gap-2">
        {/* Primitives Section */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
            Primitives
          </div>
          {primitiveTools.map(({ icon: Icon, name, action }) => (
            <button
              key={name}
              onClick={action}
              className="w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
              title={name}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {name}
              </div>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/10 my-1" />

        {/* Transform Tools Section */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
            Transform
          </div>
          {transformTools.map(({ icon: Icon, mode, name, shortcut }) => (
            <button
              key={name}
              onClick={() => handleTransformMode(mode)}
              className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                transformMode === mode
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
              title={`${name} (${shortcut})`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {name}
                <span className="text-white/60 ml-1">({shortcut})</span>
              </div>
            </button>
          ))}
        </div>

        {/* Edit Tools Section - Only show when object is selected */}
        {selectedObject && (
          <>
            {/* Separator */}
            <div className="w-full h-px bg-white/10 my-1" />
            
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
                Edit
              </div>
              {editTools.map(({ icon: Icon, mode, name, shortcut }) => {
                // Check if edge mode should be disabled for certain geometries
                const isEdgeModeDisabled = mode === 'edge' && selectedObject instanceof THREE.Mesh && (
                  selectedObject.geometry instanceof THREE.CylinderGeometry ||
                  selectedObject.geometry instanceof THREE.ConeGeometry ||
                  selectedObject.geometry instanceof THREE.SphereGeometry
                );

                return (
                  <button
                    key={name}
                    onClick={() => !isEdgeModeDisabled && handleEditMode(mode)}
                    disabled={isEdgeModeDisabled}
                    className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                      isEdgeModeDisabled
                        ? 'text-white/30 cursor-not-allowed bg-white/5'
                        : editMode === mode
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
                    }`}
                    title={isEdgeModeDisabled ? `${name} (Not available for this geometry)` : `${name} (${shortcut})`}
                  >
                    <Icon className="w-5 h-5" />
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {name}
                      {!isEdgeModeDisabled && (
                        <span className="text-white/60 ml-1">({shortcut})</span>
                      )}
                      {isEdgeModeDisabled && (
                        <span className="text-red-400 ml-1">(Not available)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Separator */}
        <div className="w-full h-px bg-white/10 my-1" />

        {/* Nature Section */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
            Nature
          </div>
          {natureTools.map(({ icon: Icon, name, action }) => (
            <button
              key={name}
              onClick={action}
              className="w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
              title={name}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;