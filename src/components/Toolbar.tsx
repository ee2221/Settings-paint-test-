import React, { useState } from 'react';
import { Box, Circle, Triangle, Cylinder, Cone, Cherry as Sphere, Plus, Move, RotateCw, Scale, Edit, MousePointer, ChevronDown, Lightbulb, Sun, Zap, TreePine, Flower, Mountain, Heart, Star, Dot, Minus, Type } from 'lucide-react';
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
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('Hello');

  // Custom Circle Icon Component for Sphere
  const CircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );

  // Custom Donut Icon Component for Torus
  const DonutIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );

  // Function to create 3D text geometry
  const create3DText = (text: string) => {
    // Create text shape using canvas and path
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return new THREE.BoxGeometry(1, 1, 1); // Fallback

    // Set up canvas for text measurement
    const fontSize = 100;
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    // Create text shape using THREE.js TextGeometry alternative
    // Since we don't have font loading, we'll create a simple extruded text using shapes
    const shapes: THREE.Shape[] = [];
    
    // For simplicity, create letter-like shapes for common characters
    const createLetterShape = (char: string, offsetX: number) => {
      const shape = new THREE.Shape();
      const letterWidth = fontSize * 0.6;
      const letterHeight = fontSize;
      
      switch (char.toUpperCase()) {
        case 'A':
          // Create A shape
          shape.moveTo(offsetX, 0);
          shape.lineTo(offsetX + letterWidth / 2, letterHeight);
          shape.lineTo(offsetX + letterWidth, 0);
          shape.lineTo(offsetX + letterWidth * 0.8, 0);
          shape.lineTo(offsetX + letterWidth * 0.65, letterHeight * 0.3);
          shape.lineTo(offsetX + letterWidth * 0.35, letterHeight * 0.3);
          shape.lineTo(offsetX + letterWidth * 0.2, 0);
          shape.lineTo(offsetX, 0);
          break;
        case 'B':
          // Create B shape
          shape.moveTo(offsetX, 0);
          shape.lineTo(offsetX, letterHeight);
          shape.lineTo(offsetX + letterWidth * 0.7, letterHeight);
          shape.bezierCurveTo(
            offsetX + letterWidth * 0.9, letterHeight,
            offsetX + letterWidth * 0.9, letterHeight * 0.75,
            offsetX + letterWidth * 0.7, letterHeight * 0.6
          );
          shape.lineTo(offsetX + letterWidth * 0.8, letterHeight * 0.5);
          shape.bezierCurveTo(
            offsetX + letterWidth, letterHeight * 0.4,
            offsetX + letterWidth, letterHeight * 0.1,
            offsetX + letterWidth * 0.7, 0
          );
          shape.lineTo(offsetX, 0);
          break;
        case 'C':
          // Create C shape
          shape.moveTo(offsetX + letterWidth, letterHeight * 0.8);
          shape.bezierCurveTo(
            offsetX + letterWidth * 0.8, letterHeight,
            offsetX + letterWidth * 0.2, letterHeight,
            offsetX, letterHeight * 0.5
          );
          shape.bezierCurveTo(
            offsetX, letterHeight * 0.2,
            offsetX + letterWidth * 0.2, 0,
            offsetX + letterWidth * 0.8, 0
          );
          shape.lineTo(offsetX + letterWidth, letterHeight * 0.2);
          break;
        default:
          // Create a simple rectangular block for unknown characters
          shape.moveTo(offsetX, 0);
          shape.lineTo(offsetX + letterWidth, 0);
          shape.lineTo(offsetX + letterWidth, letterHeight);
          shape.lineTo(offsetX, letterHeight);
          shape.lineTo(offsetX, 0);
      }
      return shape;
    };

    // Create shapes for each character
    let currentOffset = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        currentOffset += fontSize * 0.3; // Space width
        continue;
      }
      
      const letterShape = createLetterShape(char, currentOffset);
      shapes.push(letterShape);
      currentOffset += fontSize * 0.7; // Letter spacing
    }

    // If no valid shapes, create a simple block
    if (shapes.length === 0) {
      const fallbackShape = new THREE.Shape();
      fallbackShape.moveTo(0, 0);
      fallbackShape.lineTo(textWidth / 10, 0);
      fallbackShape.lineTo(textWidth / 10, textHeight / 10);
      fallbackShape.lineTo(0, textHeight / 10);
      fallbackShape.lineTo(0, 0);
      shapes.push(fallbackShape);
    }

    // Extrude settings
    const extrudeSettings = {
      depth: fontSize * 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: fontSize * 0.02,
      bevelThickness: fontSize * 0.02
    };

    // Create geometry from shapes
    let geometry: THREE.BufferGeometry;
    
    // Initialize geometries array to track all created geometries for cleanup
    const geometries: THREE.BufferGeometry[] = [];
    
    if (shapes.length === 1) {
      geometry = new THREE.ExtrudeGeometry(shapes[0], extrudeSettings);
      geometries.push(geometry);
    } else {
      // Create individual letter geometries
      shapes.forEach(shape => {
        const letterGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometries.push(letterGeometry);
      });
      
      // Merge all letter geometries
      geometry = new THREE.BufferGeometry();
      let totalVertices = 0;
      let totalIndices = 0;
      
      geometries.forEach(geom => {
        totalVertices += geom.attributes.position.count;
        if (geom.index) {
          totalIndices += geom.index.count;
        }
      });
      
      const positions = new Float32Array(totalVertices * 3);
      const normals = new Float32Array(totalVertices * 3);
      const indices = new Uint32Array(totalIndices);
      
      let vertexOffset = 0;
      let indexOffset = 0;
      let vertexCount = 0;
      
      geometries.forEach(geom => {
        const posAttr = geom.attributes.position;
        const normAttr = geom.attributes.normal;
        
        positions.set(posAttr.array, vertexOffset * 3);
        normals.set(normAttr.array, vertexOffset * 3);
        
        if (geom.index) {
          const geomIndices = geom.index.array;
          for (let i = 0; i < geomIndices.length; i++) {
            indices[indexOffset + i] = geomIndices[i] + vertexCount;
          }
          indexOffset += geomIndices.length;
        }
        
        vertexOffset += posAttr.count;
        vertexCount += posAttr.count;
      });
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    // Scale and center the text
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Scale to reasonable size (max dimension = 2 units)
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDimension;
    
    geometry.scale(scale, scale, scale);
    geometry.translate(-center.x * scale, -center.y * scale, -center.z * scale);
    
    // Clean up individual geometries (except the final merged one)
    if (shapes.length > 1) {
      geometries.forEach((geom) => {
        if (geom !== geometry) {
          geom.dispose();
        }
      });
    }

    return geometry;
  };

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
      icon: CircleIcon,
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
      icon: DonutIcon,
      geometry: () => new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      color: '#8844aa'
    },
    {
      name: 'Heart',
      icon: Heart,
      geometry: () => {
        // Create a heart shape using a custom geometry
        const heartShape = new THREE.Shape();
        
        const x = 0, y = 0;
        heartShape.moveTo(x + 5, y + 5);
        heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
        heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.7, x + 5, y + 15);
        heartShape.bezierCurveTo(x + 12, y + 7.7, x + 14, y + 5.5, x + 14, y + 3.5);
        heartShape.bezierCurveTo(x + 14, y + 3.5, x + 14, y, x + 10, y);
        heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

        const extrudeSettings = {
          depth: 2,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 2,
          bevelSize: 0.5,
          bevelThickness: 0.5
        };

        const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        
        // Scale and center the heart
        geometry.scale(0.05, 0.05, 0.05);
        geometry.center();
        
        return geometry;
      },
      color: '#ff6b9d'
    },
    {
      name: 'Star',
      icon: Star,
      geometry: () => {
        // Create a star shape
        const starShape = new THREE.Shape();
        const outerRadius = 10;
        const innerRadius = 4;
        const spikes = 5;
        
        let rot = Math.PI / 2 * 3;
        let x = 0;
        let y = outerRadius;
        const step = Math.PI / spikes;

        starShape.moveTo(0, outerRadius);
        
        for (let i = 0; i < spikes; i++) {
          x = Math.cos(rot) * outerRadius;
          y = Math.sin(rot) * outerRadius;
          starShape.lineTo(x, y);
          rot += step;

          x = Math.cos(rot) * innerRadius;
          y = Math.sin(rot) * innerRadius;
          starShape.lineTo(x, y);
          rot += step;
        }
        
        starShape.lineTo(0, outerRadius);

        const extrudeSettings = {
          depth: 2,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 2,
          bevelSize: 0.3,
          bevelThickness: 0.3
        };

        const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
        
        // Scale and center the star
        geometry.scale(0.05, 0.05, 0.05);
        geometry.center();
        
        return geometry;
      },
      color: '#ffd700'
    },
    {
      name: '3D Text',
      icon: Type,
      geometry: () => create3DText(textInput),
      color: '#00bcd4',
      isText: true
    }
  ];

  // Nature objects - trees, flowers, and rocks (removed Pebble and Sunflower)
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
    if ('isText' in shape && shape.isText) {
      // For 3D text, show input dialog first
      setShowTextInput(true);
    } else {
      startObjectPlacement({
        geometry: shape.geometry,
        name: shape.name,
        color: shape.color
      });
      setShowObjectMenu(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const textShape = basicShapes.find(s => s.name === '3D Text');
      if (textShape) {
        startObjectPlacement({
          geometry: () => create3DText(textInput.trim()),
          name: `3D Text: "${textInput.trim()}"`,
          color: textShape.color
        });
      }
    }
    setShowTextInput(false);
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
      icon: Dot,
      mode: 'vertex' as const,
      title: 'Edit Vertices',
      shortcut: 'V'
    },
    {
      icon: Minus,
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
    <>
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

      {/* 3D Text Input Modal - Centered on Screen */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Type className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white/95">Create 3D Text</h3>
                <p className="text-sm text-white/60 mt-0.5">Enter text to extrude into 3D geometry</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Text Content
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && textInput.trim()) {
                      handleTextSubmit();
                    } else if (e.key === 'Escape') {
                      setShowTextInput(false);
                    }
                  }}
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-xl px-4 py-3 text-white/95 placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="Enter your text..."
                  autoFocus
                  maxLength={20}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/50">
                    {textInput.length}/20 characters
                  </span>
                  {textInput.length > 15 && (
                    <span className="text-xs text-amber-400">
                      Keep text short for better performance
                    </span>
                  )}
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  💡 Tips for Best Results
                </h4>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• Simple letters and numbers work best</li>
                  <li>• Avoid special characters and symbols</li>
                  <li>• Shorter text renders faster and looks cleaner</li>
                  <li>• Text will be automatically scaled and centered</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setShowTextInput(false)}
                className="flex-1 px-4 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white/80 hover:text-white rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg disabled:shadow-none"
              >
                Create 3D Text
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;