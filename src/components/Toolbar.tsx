import React, { useState } from 'react';
import { Box, Cylinder, Cherry as Sphere, Triangle, Plus, Move3D, RotateCw, Scale, MousePointer, Minus, Star, Heart, Hexagon, Circle, Square, Diamond } from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { 
    setTransformMode, 
    transformMode, 
    setEditMode, 
    editMode, 
    startObjectPlacement,
    sceneSettings
  } = useSceneStore();
  
  const [activeTab, setActiveTab] = useState<'tools' | 'objects'>('tools');
  const [activeObjectCategory, setActiveObjectCategory] = useState<'basic' | 'advanced'>('basic');

  // Don't render if hideAllMenus is enabled
  if (sceneSettings.hideAllMenus) {
    return null;
  }

  const tools = [
    {
      icon: MousePointer,
      mode: null,
      title: 'Select',
      description: 'Select and manipulate objects'
    },
    {
      icon: Move3D,
      mode: 'translate' as const,
      title: 'Move',
      description: 'Move objects in 3D space'
    },
    {
      icon: RotateCw,
      mode: 'rotate' as const,
      title: 'Rotate',
      description: 'Rotate objects around their center'
    },
    {
      icon: Scale,
      mode: 'scale' as const,
      title: 'Scale',
      description: 'Resize objects uniformly or non-uniformly'
    }
  ];

  const editModes = [
    {
      icon: MousePointer,
      mode: null,
      title: 'Object Mode',
      description: 'Edit entire objects'
    },
    {
      icon: Circle,
      mode: 'vertex' as const,
      title: 'Vertex Mode',
      description: 'Edit individual vertices'
    },
    {
      icon: Minus,
      mode: 'edge' as const,
      title: 'Edge Mode',
      description: 'Edit edges and faces'
    }
  ];

  // Create a 5-pointed star geometry
  const createStarGeometry = () => {
    const shape = new THREE.Shape();
    const outerRadius = 1;
    const innerRadius = 0.4;
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    
    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  // Create a heart geometry
  const createHeartGeometry = () => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    
    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    
    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  // Create a diamond geometry
  const createDiamondGeometry = () => {
    const geometry = new THREE.ConeGeometry(1, 2, 8);
    // Rotate to make it look more like a diamond
    geometry.rotateX(Math.PI);
    geometry.translate(0, 0.5, 0);
    return geometry;
  };

  // Create a hexagon geometry
  const createHexagonGeometry = () => {
    const shape = new THREE.Shape();
    const radius = 1;
    const sides = 6;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  const basicShapes = [
    {
      icon: Box,
      name: 'Cube',
      geometry: () => new THREE.BoxGeometry(1, 1, 1),
      color: '#4ade80'
    },
    {
      icon: Sphere,
      name: 'Sphere',
      geometry: () => new THREE.SphereGeometry(0.5, 32, 16),
      color: '#60a5fa'
    },
    {
      icon: Cylinder,
      name: 'Cylinder',
      geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      color: '#f472b6'
    },
    {
      icon: Triangle,
      name: 'Cone',
      geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
      color: '#fbbf24'
    },
    {
      icon: Square,
      name: 'Plane',
      geometry: () => new THREE.PlaneGeometry(2, 2),
      color: '#a78bfa'
    },
    {
      icon: Circle,
      name: 'Torus',
      geometry: () => new THREE.TorusGeometry(0.6, 0.2, 16, 100),
      color: '#34d399'
    },
    {
      icon: Star,
      name: 'Star',
      geometry: createStarGeometry,
      color: '#fde047'
    },
    {
      icon: Heart,
      name: 'Heart',
      geometry: createHeartGeometry,
      color: '#f87171'
    },
    {
      icon: Diamond,
      name: 'Diamond',
      geometry: createDiamondGeometry,
      color: '#c084fc'
    },
    {
      icon: Hexagon,
      name: 'Hexagon',
      geometry: createHexagonGeometry,
      color: '#fb7185'
    }
  ];

  const advancedShapes = [
    {
      icon: Box,
      name: 'Dodecahedron',
      geometry: () => new THREE.DodecahedronGeometry(0.7),
      color: '#06b6d4'
    },
    {
      icon: Triangle,
      name: 'Icosahedron',
      geometry: () => new THREE.IcosahedronGeometry(0.7),
      color: '#8b5cf6'
    },
    {
      icon: Box,
      name: 'Octahedron',
      geometry: () => new THREE.OctahedronGeometry(0.7),
      color: '#10b981'
    },
    {
      icon: Triangle,
      name: 'Tetrahedron',
      geometry: () => new THREE.TetrahedronGeometry(0.7),
      color: '#f59e0b'
    },
    {
      icon: Circle,
      name: 'Torus Knot',
      geometry: () => new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16),
      color: '#ef4444'
    }
  ];

  const objectCategories = [
    { id: 'basic', name: 'Basic Shapes', shapes: basicShapes },
    { id: 'advanced', name: 'Advanced', shapes: advancedShapes }
  ];

  const handleObjectPlace = (shapeConfig: any) => {
    startObjectPlacement({
      geometry: shapeConfig.geometry,
      name: shapeConfig.name,
      color: shapeConfig.color
    });
  };

  return (
    <div className="absolute left-4 top-4 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-4 border border-white/5 z-10">
      {/* Tab Navigation */}
      <div className="flex mb-4 bg-[#2a2a2a] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'tools'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveTab('objects')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'objects'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          Objects
        </button>
      </div>

      {activeTab === 'tools' && (
        <div className="space-y-4">
          {/* Transform Tools */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3">Transform</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map(({ icon: Icon, mode, title, description }) => (
                <button
                  key={title}
                  onClick={() => setTransformMode(mode)}
                  className={`group relative p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    transformMode === mode
                      ? 'border-blue-500/50 bg-blue-500/20 text-blue-400'
                      : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/90'
                  }`}
                  title={description}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{title}</div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Modes */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3">Edit Mode</h3>
            <div className="grid grid-cols-1 gap-2">
              {editModes.map(({ icon: Icon, mode, title, description }) => (
                <button
                  key={title}
                  onClick={() => setEditMode(mode)}
                  className={`group relative p-3 rounded-lg border transition-all duration-200 hover:scale-105 flex items-center gap-3 ${
                    editMode === mode
                      ? 'border-green-500/50 bg-green-500/20 text-green-400'
                      : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/90'
                  }`}
                  title={description}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-sm font-medium">{title}</div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'objects' && (
        <div className="space-y-4">
          {/* Object Category Navigation */}
          <div className="flex bg-[#2a2a2a] rounded-lg p-1">
            {objectCategories.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setActiveObjectCategory(id as 'basic' | 'advanced')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeObjectCategory === id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Object Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {objectCategories
              .find(cat => cat.id === activeObjectCategory)
              ?.shapes.map(({ icon: Icon, name, geometry, color }) => (
                <button
                  key={name}
                  onClick={() => handleObjectPlace({ icon: Icon, name, geometry, color })}
                  className="group relative p-3 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105 text-white/90"
                  title={`Add ${name}`}
                >
                  <Icon 
                    className="w-6 h-6 mx-auto mb-2" 
                    style={{ color }} 
                  />
                  <div className="text-xs font-medium">{name}</div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    Click to place {name}
                  </div>
                </button>
              ))}
          </div>

          {/* Placement Instructions */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-xs text-blue-400 font-medium mb-1">
              💡 Placement Mode
            </div>
            <div className="text-xs text-white/60">
              Click an object above, then click in the 3D scene to place it. Right-click or press Escape to cancel.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;