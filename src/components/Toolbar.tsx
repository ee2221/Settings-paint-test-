import React, { useState } from 'react';
import { Box, Circle, Triangle, Cylinder, Cone, Cherry as Sphere, Plus, Move, RotateCw, Scale, Edit, MousePointer, ChevronDown, Lightbulb, Sun, Zap, TreePine, Flower, Mountain } from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { 
    selectedObject, 
    transformMode, 
    editMode, 
    setTransformMode, 
    setEditMode,
    startObjectPlacement,
    addLight
  } = useSceneStore();
  
  const [showObjectMenu, setShowObjectMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic geometric shapes
  const basicShapes = [
    {
      name: 'Cube',
      icon: Box,
      geometry: () => new THREE.BoxGeometry(1, 1, 1),
      color: '#44aa88'
    },
    {
      name: 'Sphere',
      icon: Sphere,
      geometry: () => new THREE.SphereGeometry(0.5, 32, 16),
      color: '#aa4488'
    },
    {
      name: 'Cylinder',
      icon: Cylinder,
      geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      color: '#4488aa'
    },
    {
      name: 'Cone',
      icon: Cone,
      geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
      color: '#88aa44'
    },
    {
      name: 'Plane',
      icon: Triangle,
      geometry: () => new THREE.PlaneGeometry(2, 2),
      color: '#aa8844'
    },
    {
      name: 'Torus',
      icon: Circle,
      geometry: () => new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      color: '#8844aa'
    }
  ];

  // Nature objects - trees, flowers, and rocks
  const natureObjects = [
    {
      name: 'Pine Tree',
      icon: TreePine,
      geometry: () => {
        const group = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.5;
        group.add(trunk);
        
        // Tree layers (3 cone layers)
        const layerColors = ['#228B22', '#32CD32', '#90EE90'];
        const layerSizes = [0.8, 0.6, 0.4];
        const layerHeights = [0.8, 0.6, 0.4];
        const layerPositions = [1.2, 1.6, 1.9];
        
        layerSizes.forEach((size, i) => {
          const layerGeometry = new THREE.ConeGeometry(size, layerHeights[i], 8);
          const layerMaterial = new THREE.MeshStandardMaterial({ color: layerColors[i] });
          const layer = new THREE.Mesh(layerGeometry, layerMaterial);
          layer.position.y = layerPositions[i];
          group.add(layer);
        });
        
        return group;
      },
      color: '#228B22'
    },
    {
      name: 'Oak Tree',
      icon: TreePine,
      geometry: () => {
        const group = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.6;
        group.add(trunk);
        
        // Tree crown (sphere)
        const crownGeometry = new THREE.SphereGeometry(0.9, 16, 12);
        const crownMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 1.5;
        crown.scale.y = 0.8; // Slightly flatten the crown
        group.add(crown);
        
        return group;
      },
      color: '#228B22'
    },
    {
      name: 'Flower',
      icon: Flower,
      geometry: () => {
        const group = new THREE.Group();
        
        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.8, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        group.add(stem);
        
        // Flower center
        const centerGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.8;
        group.add(center);
        
        // Flower petals
        const petalGeometry = new THREE.SphereGeometry(0.12, 8, 6);
        const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });
        
        for (let i = 0; i < 6; i++) {
          const petal = new THREE.Mesh(petalGeometry, petalMaterial);
          const angle = (i / 6) * Math.PI * 2;
          petal.position.x = Math.cos(angle) * 0.15;
          petal.position.z = Math.sin(angle) * 0.15;
          petal.position.y = 0.8;
          petal.scale.set(0.8, 0.4, 0.8);
          group.add(petal);
        }
        
        return group;
      },
      color: '#FF69B4'
    },
    {
      name: 'Sunflower',
      icon: Flower,
      geometry: () => {
        const group = new THREE.Group();
        
        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.04, 1.2, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.6;
        group.add(stem);
        
        // Flower center
        const centerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 1.2;
        group.add(center);
        
        // Sunflower petals
        const petalGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.02);
        const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
        
        for (let i = 0; i < 12; i++) {
          const petal = new THREE.Mesh(petalGeometry, petalMaterial);
          const angle = (i / 12) * Math.PI * 2;
          petal.position.x = Math.cos(angle) * 0.2;
          petal.position.z = Math.sin(angle) * 0.2;
          petal.position.y = 1.2;
          petal.rotation.y = angle;
          group.add(petal);
        }
        
        return group;
      },
      color: '#FFD700'
    },
    {
      name: 'Boulder',
      icon: Mountain,
      geometry: () => {
        // Create an irregular rock shape using a modified sphere
        const geometry = new THREE.SphereGeometry(0.6, 8, 6);
        const positions = geometry.attributes.position;
        
        // Randomly modify vertices to create irregular rock shape
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Add some randomness to make it look more rock-like
          const noise = (Math.random() - 0.5) * 0.3;
          const length = Math.sqrt(x * x + y * y + z * z);
          const newLength = length + noise;
          
          positions.setXYZ(
            i,
            (x / length) * newLength,
            (y / length) * newLength * (0.7 + Math.random() * 0.3), // Make it flatter
            (z / length) * newLength
          );
        }
        
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#696969'
    },
    {
      name: 'Small Rock',
      icon: Mountain,
      geometry: () => {
        // Create a smaller, more angular rock
        const geometry = new THREE.DodecahedronGeometry(0.3);
        const positions = geometry.attributes.position;
        
        // Slightly modify vertices for more natural look
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          const noise = (Math.random() - 0.5) * 0.1;
          const length = Math.sqrt(x * x + y * y + z * z);
          const newLength = length + noise;
          
          positions.setXYZ(
            i,
            (x / length) * newLength,
            (y / length) * newLength,
            (z / length) * newLength
          );
        }
        
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#A0A0A0'
    },
    {
      name: 'Pebble',
      icon: Mountain,
      geometry: () => {
        // Create a smooth, small pebble
        const geometry = new THREE.SphereGeometry(0.15, 12, 8);
        const positions = geometry.attributes.position;
        
        // Slightly flatten and make irregular
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Flatten the Y axis and add slight irregularity
          positions.setXYZ(
            i,
            x * (1 + (Math.random() - 0.5) * 0.1),
            y * 0.6 * (1 + (Math.random() - 0.5) * 0.1),
            z * (1 + (Math.random() - 0.5) * 0.1)
          );
        }
        
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#B8860B'
    },
    {
      name: 'Grass Patch',
      icon: TreePine,
      geometry: () => {
        const group = new THREE.Group();
        
        // Create multiple grass blades
        const bladeGeometry = new THREE.BoxGeometry(0.02, 0.3, 0.01);
        const bladeMaterial = new THREE.MeshStandardMaterial({ color: '#32CD32' });
        
        for (let i = 0; i < 20; i++) {
          const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
          
          // Random position within a small area
          blade.position.x = (Math.random() - 0.5) * 0.6;
          blade.position.z = (Math.random() - 0.5) * 0.6;
          blade.position.y = 0.15;
          
          // Random rotation and slight scale variation
          blade.rotation.y = Math.random() * Math.PI * 2;
          blade.rotation.x = (Math.random() - 0.5) * 0.2;
          blade.scale.y = 0.8 + Math.random() * 0.4;
          
          group.add(blade);
        }
        
        return group;
      },
      color: '#32CD32'
    }
  ];

  const handleObjectSelect = (shape: typeof basicShapes[0] | typeof natureObjects[0]) => {
    startObjectPlacement({
      geometry: shape.geometry,
      name: shape.name,
      color: shape.color
    });
    setShowObjectMenu(false);
  };

  const handleLightAdd = (type: 'directional' | 'point' | 'spot') => {
    const position = selectedObject 
      ? [
          selectedObject.position.x + 2,
          selectedObject.position.y + 2,
          selectedObject.position.z + 2
        ]
      : [2, 2, 2];

    addLight(type, position);
  };

  const transformTools = [
    {
      icon: MousePointer,
      mode: null,
      title: 'Select',
      shortcut: 'Q'
    },
    {
      icon: Move,
      mode: 'translate' as const,
      title: 'Move',
      shortcut: 'G'
    },
    {
      icon: RotateCw,
      mode: 'rotate' as const,
      title: 'Rotate',
      shortcut: 'R'
    },
    {
      icon: Scale,
      mode: 'scale' as const,
      title: 'Scale',
      shortcut: 'S'
    }
  ];

  const editTools = [
    {
      icon: Edit,
      mode: 'vertex' as const,
      title: 'Edit Vertices',
      shortcut: 'V'
    },
    {
      icon: Edit,
      mode: 'edge' as const,
      title: 'Edit Edges',
      shortcut: 'E'
    }
  ];

  const lightTools = [
    {
      icon: Sun,
      type: 'directional' as const,
      title: 'Directional Light',
      description: 'Parallel rays like sunlight'
    },
    {
      icon: Lightbulb,
      type: 'point' as const,
      title: 'Point Light',
      description: 'Omnidirectional like a bulb'
    },
    {
      icon: Zap,
      type: 'spot' as const,
      title: 'Spot Light',
      description: 'Focused cone of light'
    }
  ];

  const tabs = [
    { id: 'basic', name: 'Basic', icon: Box },
    { id: 'nature', name: 'Nature', icon: TreePine }
  ];

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-3 border border-white/5 z-10">
      <div className="flex flex-col gap-2">
        {/* Add Object Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowObjectMenu(!showObjectMenu)}
            className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center justify-center group relative hover:scale-105 active:scale-95"
            title="Add Object (A)"
          >
            <Plus className="w-5 h-5" />
            <ChevronDown className="w-3 h-3 ml-1" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Add Object (A)
            </div>
          </button>

          {/* Object Menu */}
          {showObjectMenu && (
            <div className="absolute left-full ml-2 top-0 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-20 min-w-80">
              {/* Header */}
              <div className="p-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-white/90">Add 3D Object</h3>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-blue-400 bg-blue-500/10 border-b-2 border-blue-500'
                        : 'text-white/70 hover:text-white/90 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-3">
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-2 gap-2">
                    {basicShapes.map((shape) => (
                      <button
                        key={shape.name}
                        onClick={() => handleObjectSelect(shape)}
                        className="p-3 rounded-lg hover:bg-white/5 flex flex-col items-center gap-2 transition-colors group"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: shape.color + '20', color: shape.color }}
                        >
                          <shape.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-white/90 group-hover:text-white">
                          {shape.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'nature' && (
                  <div className="grid grid-cols-2 gap-2">
                    {natureObjects.map((obj) => (
                      <button
                        key={obj.name}
                        onClick={() => handleObjectSelect(obj)}
                        className="p-3 rounded-lg hover:bg-white/5 flex flex-col items-center gap-2 transition-colors group"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: obj.color + '20', color: obj.color }}
                        >
                          <obj.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-white/90 group-hover:text-white text-center">
                          {obj.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lights Section */}
              <div className="border-t border-white/10 p-3">
                <h4 className="text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                  Lights
                </h4>
                <div className="space-y-1">
                  {lightTools.map((light) => (
                    <button
                      key={light.type}
                      onClick={() => handleLightAdd(light.type)}
                      className="w-full p-2 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-colors group"
                    >
                      <light.icon className="w-4 h-4 text-yellow-400" />
                      <div className="text-left">
                        <div className="text-sm text-white/90 group-hover:text-white">
                          {light.title}
                        </div>
                        <div className="text-xs text-white/60">
                          {light.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/10" />

        {/* Transform Tools */}
        {transformTools.map(({ icon: Icon, mode, title, shortcut }) => (
          <button
            key={title}
            onClick={() => setTransformMode(mode)}
            className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative hover:scale-105 active:scale-95 ${
              transformMode === mode
                ? 'bg-blue-500/30 text-blue-300'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
            title={`${title} (${shortcut})`}
          >
            <Icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {title} ({shortcut})
            </div>
          </button>
        ))}

        {/* Separator */}
        <div className="w-full h-px bg-white/10" />

        {/* Edit Tools */}
        {editTools.map(({ icon: Icon, mode, title, shortcut }) => {
          // Check if edge mode should be disabled for certain geometries
          const isDisabled = mode === 'edge' && selectedObject instanceof THREE.Mesh && (
            selectedObject.geometry instanceof THREE.CylinderGeometry ||
            selectedObject.geometry instanceof THREE.ConeGeometry ||
            selectedObject.geometry instanceof THREE.SphereGeometry
          );

          return (
            <button
              key={title}
              onClick={() => !isDisabled && setEditMode(mode)}
              disabled={isDisabled}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                isDisabled
                  ? 'text-white/30 cursor-not-allowed'
                  : editMode === mode
                    ? 'bg-green-500/30 text-green-300 hover:scale-105 active:scale-95'
                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
              title={isDisabled ? `${title} (Not available for this geometry)` : `${title} (${shortcut})`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {isDisabled ? `${title} (Not available)` : `${title} (${shortcut})`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;