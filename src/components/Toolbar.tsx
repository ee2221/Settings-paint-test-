import React, { useState } from 'react';
import { Box, Cherry as Sphere, Cylinder, Cone, Torus, Move, RotateCw, Scale, MousePointer, Edit, Zap, Shapes, Settings2, Layers3 } from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

type ToolbarTab = 'objects' | 'transform' | 'edit';

const Toolbar: React.FC = () => {
  const { 
    selectedObject, 
    transformMode, 
    editMode, 
    setTransformMode, 
    setEditMode,
    startObjectPlacement,
    isObjectLocked
  } = useSceneStore();

  const [activeTab, setActiveTab] = useState<ToolbarTab>('objects');

  // Check if selected object is locked
  const selectedObj = useSceneStore.getState().objects.find(obj => obj.object === selectedObject);
  const objectLocked = selectedObj ? isObjectLocked(selectedObj.id) : false;

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

  const createTorus = () => {
    startObjectPlacement({
      geometry: () => new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      name: 'Torus',
      color: '#aa8844'
    });
  };

  const createPlane = () => {
    startObjectPlacement({
      geometry: () => new THREE.PlaneGeometry(2, 2, 10, 10),
      name: 'Plane',
      color: '#8844aa'
    });
  };

  const objectTools = [
    {
      icon: Box,
      action: createCube,
      title: 'Add Cube',
      shortcut: '1'
    },
    {
      icon: Sphere,
      action: createSphere,
      title: 'Add Sphere',
      shortcut: '2'
    },
    {
      icon: Cylinder,
      action: createCylinder,
      title: 'Add Cylinder',
      shortcut: '3'
    },
    {
      icon: Cone,
      action: createCone,
      title: 'Add Cone',
      shortcut: '4'
    },
    {
      icon: Torus,
      action: createTorus,
      title: 'Add Torus',
      shortcut: '5'
    },
    {
      icon: Layers3,
      action: createPlane,
      title: 'Add Plane',
      shortcut: '6'
    }
  ] as const;

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
  ] as const;

  const editTools = [
    {
      icon: MousePointer,
      mode: null,
      title: 'Object Mode',
      shortcut: 'Tab'
    },
    {
      icon: Edit,
      mode: 'vertex' as const,
      title: 'Edit Vertices',
      shortcut: 'V',
      disabled: !selectedObject || objectLocked
    },
    {
      icon: Zap,
      mode: 'edge' as const,
      title: 'Edit Edges',
      shortcut: 'E',
      disabled: !selectedObject || objectLocked || (selectedObject instanceof THREE.Mesh && (
        selectedObject.geometry instanceof THREE.CylinderGeometry ||
        selectedObject.geometry instanceof THREE.ConeGeometry ||
        selectedObject.geometry instanceof THREE.SphereGeometry
      ))
    }
  ] as const;

  const tabs = [
    {
      id: 'objects' as const,
      name: 'Objects',
      icon: Shapes,
      description: 'Add 3D objects to scene'
    },
    {
      id: 'transform' as const,
      name: 'Transform',
      icon: Settings2,
      description: 'Move, rotate, and scale objects'
    },
    {
      id: 'edit' as const,
      name: 'Edit',
      icon: Edit,
      description: 'Edit object geometry'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'objects':
        return (
          <div className="flex items-center gap-1">
            {objectTools.map(({ icon: Icon, action, title, shortcut }) => (
              <button
                key={title}
                onClick={action}
                className="p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
                title={`${title} (${shortcut})`}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {title}
                  <span className="text-white/60 ml-1">({shortcut})</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'transform':
        return (
          <div className="flex items-center gap-1">
            {transformTools.map(({ icon: Icon, mode, title, shortcut }) => (
              <button
                key={title}
                onClick={() => setTransformMode(mode)}
                className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                  transformMode === mode
                    ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20'
                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
                }`}
                title={`${title} (${shortcut})`}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {title}
                  <span className="text-white/60 ml-1">({shortcut})</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'edit':
        return (
          <div className="flex items-center gap-1">
            {editTools.map(({ icon: Icon, mode, title, shortcut, disabled }) => (
              <button
                key={title}
                onClick={() => !disabled && setEditMode(mode)}
                disabled={disabled}
                className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                  disabled
                    ? 'text-white/30 cursor-not-allowed bg-white/5'
                    : editMode === mode
                      ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20'
                      : 'text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
                }`}
                title={disabled ? `${title} (Not available)` : `${title} (${shortcut})`}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {title}
                  {!disabled && (
                    <span className="text-white/60 ml-1">({shortcut})</span>
                  )}
                  {disabled && (
                    <span className="text-red-400 ml-1">(Not available)</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute left-4 top-4 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ id, name, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 group relative ${
              activeTab === id
                ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                : 'text-white/70 hover:text-white/90 hover:bg-white/5'
            }`}
            title={description}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{name}</span>
            
            {/* Tab Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {description}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3">
        {renderTabContent()}
      </div>

      {/* Status Indicator */}
      <div className="px-4 py-2 border-t border-white/10 bg-black/20">
        <div className="text-xs text-white/50">
          {activeTab === 'objects' && 'Click to add objects to scene'}
          {activeTab === 'transform' && (
            selectedObject 
              ? transformMode 
                ? `${transformMode.charAt(0).toUpperCase() + transformMode.slice(1)} mode active`
                : 'Select a transform tool'
              : 'Select an object first'
          )}
          {activeTab === 'edit' && (
            selectedObject 
              ? objectLocked
                ? 'Object is locked'
                : editMode 
                  ? `${editMode.charAt(0).toUpperCase() + editMode.slice(1)} edit mode`
                  : 'Select an edit tool'
              : 'Select an object first'
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;