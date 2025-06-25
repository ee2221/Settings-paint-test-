import React, { useState } from 'react';
import { 
  Box, 
  Sphere, 
  Cylinder, 
  Cone,
  Move3D,
  RotateCcw,
  Scale,
  MousePointer,
  Edit3,
  Scissors,
  Zap,
  Spline,
  Plus
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { 
    addObject, 
    setTransformMode, 
    setEditMode, 
    transformMode, 
    editMode,
    selectedObject,
    startObjectPlacement,
    placementMode,
    pendingObject
  } = useSceneStore();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Primitive creation functions
  const createCube = () => {
    startObjectPlacement({
      geometry: () => new THREE.BoxGeometry(1, 1, 1),
      name: 'Cube',
      color: '#44aa88'
    });
  };

  const createSphere = () => {
    startObjectPlacement({
      geometry: () => new THREE.SphereGeometry(0.5, 32, 16),
      name: 'Sphere',
      color: '#aa4488'
    });
  };

  const createCylinder = () => {
    startObjectPlacement({
      geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      name: 'Cylinder',
      color: '#4488aa'
    });
  };

  const createCone = () => {
    startObjectPlacement({
      geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
      name: 'Cone',
      color: '#88aa44'
    });
  };

  const createPlane = () => {
    startObjectPlacement({
      geometry: () => new THREE.PlaneGeometry(2, 2, 10, 10),
      name: 'Plane',
      color: '#aa8844'
    });
  };

  const createTorus = () => {
    startObjectPlacement({
      geometry: () => new THREE.TorusGeometry(0.7, 0.2, 16, 100),
      name: 'Torus',
      color: '#8844aa'
    });
  };

  const createIcosahedron = () => {
    startObjectPlacement({
      geometry: () => new THREE.IcosahedronGeometry(0.8, 0),
      name: 'Icosahedron',
      color: '#44aa44'
    });
  };

  const createTetrahedron = () => {
    startObjectPlacement({
      geometry: () => new THREE.TetrahedronGeometry(0.8, 0),
      name: 'Tetrahedron',
      color: '#aa4444'
    });
  };

  const createOctahedron = () => {
    startObjectPlacement({
      geometry: () => new THREE.OctahedronGeometry(0.8, 0),
      name: 'Octahedron',
      color: '#4444aa'
    });
  };

  const createDodecahedron = () => {
    startObjectPlacement({
      geometry: () => new THREE.DodecahedronGeometry(0.8, 0),
      name: 'Dodecahedron',
      color: '#aa8844'
    });
  };

  // Tool categories
  const toolCategories = [
    {
      id: 'primitives',
      name: 'Primitives',
      icon: Box,
      tools: [
        { icon: Box, name: 'Cube', action: createCube, shortcut: '1' },
        { icon: Sphere, name: 'Sphere', action: createSphere, shortcut: '2' },
        { icon: Cylinder, name: 'Cylinder', action: createCylinder, shortcut: '3' },
        { icon: Cone, name: 'Cone', action: createCone, shortcut: '4' },
        { icon: Plus, name: 'Plane', action: createPlane, shortcut: '5' },
        { icon: Plus, name: 'Torus', action: createTorus, shortcut: '6' },
        { icon: Plus, name: 'Icosahedron', action: createIcosahedron, shortcut: '7' },
        { icon: Plus, name: 'Tetrahedron', action: createTetrahedron, shortcut: '8' },
        { icon: Plus, name: 'Octahedron', action: createOctahedron, shortcut: '9' },
        { icon: Plus, name: 'Dodecahedron', action: createDodecahedron, shortcut: '0' }
      ]
    },
    {
      id: 'transform',
      name: 'Transform',
      icon: Move3D,
      tools: [
        { 
          icon: MousePointer, 
          name: 'Select', 
          action: () => setTransformMode(null), 
          shortcut: 'Q',
          isActive: transformMode === null
        },
        { 
          icon: Move3D, 
          name: 'Move', 
          action: () => setTransformMode('translate'), 
          shortcut: 'G',
          isActive: transformMode === 'translate'
        },
        { 
          icon: RotateCcw, 
          name: 'Rotate', 
          action: () => setTransformMode('rotate'), 
          shortcut: 'R',
          isActive: transformMode === 'rotate'
        },
        { 
          icon: Scale, 
          name: 'Scale', 
          action: () => setTransformMode('scale'), 
          shortcut: 'S',
          isActive: transformMode === 'scale'
        }
      ]
    },
    {
      id: 'edit',
      name: 'Edit',
      icon: Edit3,
      tools: [
        { 
          icon: MousePointer, 
          name: 'Object Mode', 
          action: () => setEditMode(null), 
          shortcut: 'Tab',
          isActive: editMode === null
        },
        { 
          icon: Edit3, 
          name: 'Edit Vertices', 
          action: () => setEditMode('vertex'), 
          shortcut: 'V',
          isActive: editMode === 'vertex',
          disabled: !selectedObject
        },
        { 
          icon: Scissors, 
          name: 'Edit Edges', 
          action: () => setEditMode('edge'), 
          shortcut: 'E',
          isActive: editMode === 'edge',
          disabled: !selectedObject || (selectedObject instanceof THREE.Mesh && 
            (selectedObject.geometry instanceof THREE.CylinderGeometry ||
             selectedObject.geometry instanceof THREE.ConeGeometry ||
             selectedObject.geometry instanceof THREE.SphereGeometry))
        }
      ]
    }
  ] as const;

  const toggleCategory = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleToolClick = (tool: any) => {
    tool.action();
    // Keep the category open after using a tool
    // Don't close the category automatically
  };

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 z-10">
      <div className="flex flex-col">
        {/* Main category buttons */}
        <div className="p-3 space-y-2">
          {toolCategories.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggleCategory(id)}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                activeCategory === id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
              title={`${name} Tools`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                {name}
              </div>
            </button>
          ))}
        </div>

        {/* Expanded tool panel */}
        {activeCategory && (
          <div className="border-t border-white/10 bg-[#2a2a2a] rounded-b-xl">
            <div className="p-3">
              <div className="text-xs font-medium text-white/70 mb-3 uppercase tracking-wider">
                {toolCategories.find(cat => cat.id === activeCategory)?.name}
              </div>
              
              <div className="space-y-1">
                {toolCategories
                  .find(cat => cat.id === activeCategory)
                  ?.tools.map(({ icon: Icon, name, action, shortcut, isActive, disabled }) => (
                    <button
                      key={name}
                      onClick={() => !disabled && handleToolClick({ action })}
                      disabled={disabled}
                      className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                        disabled
                          ? 'text-white/30 cursor-not-allowed bg-white/5'
                          : isActive
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : placementMode && pendingObject?.name === name
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                      title={disabled ? `${name} (Not available)` : `${name} (${shortcut})`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 text-left">{name}</span>
                      <span className="text-xs text-white/50 font-mono">{shortcut}</span>
                      
                      {/* Active indicator */}
                      {(isActive || (placementMode && pendingObject?.name === name)) && (
                        <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;