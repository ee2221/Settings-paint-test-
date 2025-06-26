import React, { useState } from 'react';
import { 
  Box, 
  Sphere, 
  Cylinder, 
  Pyramid,
  Cone,
  Torus,
  Move,
  RotateCw,
  Scale,
  MousePointer,
  Vertices,
  Minus,
  TreePine,
  Flower,
  Mountain,
  Type,
  Sun,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { 
    addObject, 
    setTransformMode, 
    transformMode, 
    setEditMode, 
    editMode,
    startObjectPlacement,
    addLight
  } = useSceneStore();
  
  const [text3D, setText3D] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Create 3D letter shapes with proper typography
  const create3DLetter = (letter: string): THREE.Group => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: '#4a90e2' });
    
    // Letter dimensions
    const width = 1;
    const height = 1.4; // Standard height for uppercase
    const depth = 0.2;
    const thickness = 0.15; // Stroke thickness
    
    // Helper function to create extruded geometry from shape
    const createExtrudedGeometry = (shape: THREE.Shape, holes: THREE.Shape[] = []) => {
      // Add holes to the shape
      holes.forEach(hole => shape.holes.push(hole));
      
      const extrudeSettings = {
        depth: depth,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 3
      };
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    };

    switch (letter.toLowerCase()) {
      case 'a': {
        const shape = new THREE.Shape();
        // Outer triangle
        shape.moveTo(0, 0);
        shape.lineTo(width/2, height);
        shape.lineTo(width, 0);
        shape.lineTo(width - thickness, 0);
        shape.lineTo(width/2, height - thickness);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // Create hole for the triangle
        const hole = new THREE.Shape();
        hole.moveTo(width/2 - thickness/2, height * 0.4);
        hole.lineTo(width/2 + thickness/2, height * 0.4);
        hole.lineTo(width - thickness * 2, thickness);
        hole.lineTo(thickness * 2, thickness);
        hole.closePath();
        
        const geometry = createExtrudedGeometry(shape, [hole]);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'b': {
        const shape = new THREE.Shape();
        // Left vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // Top bump
        const topBump = new THREE.Shape();
        topBump.moveTo(thickness, height * 0.5);
        topBump.lineTo(width * 0.7, height * 0.5);
        topBump.bezierCurveTo(width, height * 0.5, width, height, width * 0.7, height);
        topBump.lineTo(thickness, height);
        topBump.closePath();
        
        // Bottom bump
        const bottomBump = new THREE.Shape();
        bottomBump.moveTo(thickness, 0);
        bottomBump.lineTo(width * 0.8, 0);
        bottomBump.bezierCurveTo(width, 0, width, height * 0.5, width * 0.7, height * 0.5);
        bottomBump.lineTo(thickness, height * 0.5);
        bottomBump.closePath();
        
        // Create holes for the bumps
        const topHole = new THREE.Shape();
        topHole.moveTo(thickness * 2, height * 0.75);
        topHole.bezierCurveTo(width * 0.8, height * 0.75, width * 0.8, height * 0.6, thickness * 2, height * 0.6);
        topHole.closePath();
        
        const bottomHole = new THREE.Shape();
        bottomHole.moveTo(thickness * 2, height * 0.4);
        bottomHole.bezierCurveTo(width * 0.8, height * 0.4, width * 0.8, height * 0.1, thickness * 2, height * 0.1);
        bottomHole.closePath();
        
        const geometry1 = createExtrudedGeometry(shape);
        const geometry2 = createExtrudedGeometry(topBump, [topHole]);
        const geometry3 = createExtrudedGeometry(bottomBump, [bottomHole]);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        group.add(new THREE.Mesh(geometry3, material));
        break;
      }
      
      case 'c': {
        const shape = new THREE.Shape();
        // Outer C shape
        shape.moveTo(width, height * 0.3);
        shape.bezierCurveTo(width, 0, 0, 0, 0, height/2);
        shape.bezierCurveTo(0, height, width, height, width, height * 0.7);
        shape.lineTo(width * 0.8, height * 0.7);
        shape.bezierCurveTo(width * 0.8, height * 0.8, thickness, height * 0.8, thickness, height/2);
        shape.bezierCurveTo(thickness, height * 0.2, width * 0.8, height * 0.2, width * 0.8, height * 0.3);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'd': {
        const shape = new THREE.Shape();
        // Left vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // Right curved part
        const curve = new THREE.Shape();
        curve.moveTo(thickness, 0);
        curve.lineTo(width * 0.7, 0);
        curve.bezierCurveTo(width, 0, width, height, width * 0.7, height);
        curve.lineTo(thickness, height);
        curve.closePath();
        
        // Create hole
        const hole = new THREE.Shape();
        hole.moveTo(thickness * 2, thickness);
        hole.lineTo(width * 0.7, thickness);
        hole.bezierCurveTo(width * 0.8, thickness, width * 0.8, height - thickness, width * 0.7, height - thickness);
        hole.lineTo(thickness * 2, height - thickness);
        hole.closePath();
        
        const geometry1 = createExtrudedGeometry(shape);
        const geometry2 = createExtrudedGeometry(curve, [hole]);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        break;
      }
      
      case 'e': {
        // Fixed e with proper hole and disconnected tail
        const shape = new THREE.Shape();
        // Main body (C-shape)
        shape.moveTo(width * 0.9, height * 0.3);
        shape.bezierCurveTo(width * 0.9, 0, 0, 0, 0, height * 0.35);
        shape.bezierCurveTo(0, height * 0.7, width * 0.9, height * 0.7, width * 0.9, height * 0.5);
        shape.lineTo(width * 0.7, height * 0.5);
        shape.bezierCurveTo(width * 0.7, height * 0.6, thickness, height * 0.6, thickness, height * 0.35);
        shape.bezierCurveTo(thickness, height * 0.1, width * 0.7, height * 0.1, width * 0.7, height * 0.3);
        shape.closePath();
        
        // Create hole in the middle
        const hole = new THREE.Shape();
        hole.moveTo(thickness * 2, height * 0.45);
        hole.bezierCurveTo(width * 0.6, height * 0.45, width * 0.6, height * 0.25, thickness * 2, height * 0.25);
        hole.closePath();
        
        // Separate crossbar (not connected to body)
        const crossbar = new THREE.Shape();
        crossbar.moveTo(width * 0.2, height * 0.35);
        crossbar.lineTo(width * 0.8, height * 0.35);
        crossbar.lineTo(width * 0.8, height * 0.45);
        crossbar.lineTo(width * 0.2, height * 0.45);
        crossbar.closePath();
        
        const geometry1 = createExtrudedGeometry(shape, [hole]);
        const geometry2 = createExtrudedGeometry(crossbar);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        break;
      }
      
      case 'f': {
        const shape = new THREE.Shape();
        // Vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(width, height);
        shape.lineTo(width, height - thickness);
        shape.lineTo(thickness, height - thickness);
        shape.lineTo(thickness, height * 0.6);
        shape.lineTo(width * 0.8, height * 0.6);
        shape.lineTo(width * 0.8, height * 0.5);
        shape.lineTo(thickness, height * 0.5);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'g': {
        const shape = new THREE.Shape();
        // C shape with horizontal bar
        shape.moveTo(width, height * 0.3);
        shape.bezierCurveTo(width, 0, 0, 0, 0, height/2);
        shape.bezierCurveTo(0, height, width, height, width, height * 0.7);
        shape.lineTo(width, height * 0.5);
        shape.lineTo(width * 0.6, height * 0.5);
        shape.lineTo(width * 0.6, height * 0.4);
        shape.lineTo(width * 0.8, height * 0.4);
        shape.lineTo(width * 0.8, height * 0.7);
        shape.bezierCurveTo(width * 0.8, height * 0.8, thickness, height * 0.8, thickness, height/2);
        shape.bezierCurveTo(thickness, height * 0.2, width * 0.8, height * 0.2, width * 0.8, height * 0.3);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'h': {
        const shape = new THREE.Shape();
        // Left vertical
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, height * 0.6);
        shape.lineTo(width - thickness, height * 0.6);
        shape.lineTo(width - thickness, height);
        shape.lineTo(width, height);
        shape.lineTo(width, 0);
        shape.lineTo(width - thickness, 0);
        shape.lineTo(width - thickness, height * 0.5);
        shape.lineTo(thickness, height * 0.5);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'i': {
        const shape = new THREE.Shape();
        // Top bar
        shape.moveTo(0, height);
        shape.lineTo(width, height);
        shape.lineTo(width, height - thickness);
        shape.lineTo((width + thickness)/2, height - thickness);
        shape.lineTo((width + thickness)/2, thickness);
        shape.lineTo(width, thickness);
        shape.lineTo(width, 0);
        shape.lineTo(0, 0);
        shape.lineTo(0, thickness);
        shape.lineTo((width - thickness)/2, thickness);
        shape.lineTo((width - thickness)/2, height - thickness);
        shape.lineTo(0, height - thickness);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'j': {
        // Fixed j with proper hook shape
        const shape = new THREE.Shape();
        // Vertical stroke with hook at bottom
        shape.moveTo(width * 0.7, height);
        shape.lineTo(width, height);
        shape.lineTo(width, height * 0.3);
        shape.bezierCurveTo(width, 0, 0, 0, 0, height * 0.2);
        shape.bezierCurveTo(0, height * 0.4, thickness * 2, height * 0.4, thickness * 2, height * 0.2);
        shape.bezierCurveTo(thickness * 2, thickness, width - thickness, thickness, width - thickness, height * 0.3);
        shape.lineTo(width - thickness, height);
        shape.lineTo(width * 0.7, height);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'k': {
        const shape = new THREE.Shape();
        // Left vertical
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, height * 0.6);
        shape.lineTo(width * 0.4, height * 0.6);
        shape.lineTo(width, height);
        shape.lineTo(width, height - thickness * 2);
        shape.lineTo(width * 0.6, height * 0.5);
        shape.lineTo(width, 0);
        shape.lineTo(width - thickness * 2, 0);
        shape.lineTo(width * 0.6, height * 0.4);
        shape.lineTo(width * 0.4, height * 0.5);
        shape.lineTo(thickness, height * 0.5);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'l': {
        const shape = new THREE.Shape();
        // Vertical stroke with bottom bar
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, thickness);
        shape.lineTo(width, thickness);
        shape.lineTo(width, 0);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'm': {
        // Fixed m with proper double arch
        const shape = new THREE.Shape();
        // Left vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height * 0.7);
        shape.lineTo(thickness, height * 0.7);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // First arch
        const arch1 = new THREE.Shape();
        arch1.moveTo(thickness, height * 0.7);
        arch1.bezierCurveTo(thickness, height * 0.7, width * 0.3, height * 0.7, width * 0.3, height * 0.5);
        arch1.lineTo(width * 0.3, 0);
        arch1.lineTo(width * 0.3 + thickness, 0);
        arch1.lineTo(width * 0.3 + thickness, height * 0.5);
        arch1.bezierCurveTo(width * 0.3 + thickness, height * 0.6, thickness * 2, height * 0.6, thickness * 2, height * 0.6);
        arch1.lineTo(thickness * 2, height * 0.7);
        arch1.closePath();
        
        // Second arch
        const arch2 = new THREE.Shape();
        arch2.moveTo(width * 0.3 + thickness, height * 0.7);
        arch2.bezierCurveTo(width * 0.3 + thickness, height * 0.7, width * 0.7, height * 0.7, width * 0.7, height * 0.5);
        arch2.lineTo(width * 0.7, 0);
        arch2.lineTo(width * 0.7 + thickness, 0);
        arch2.lineTo(width * 0.7 + thickness, height * 0.5);
        arch2.bezierCurveTo(width * 0.7 + thickness, height * 0.6, width * 0.3 + thickness * 2, height * 0.6, width * 0.3 + thickness * 2, height * 0.6);
        arch2.lineTo(width * 0.3 + thickness * 2, height * 0.7);
        arch2.closePath();
        
        const geometry1 = createExtrudedGeometry(shape);
        const geometry2 = createExtrudedGeometry(arch1);
        const geometry3 = createExtrudedGeometry(arch2);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        group.add(new THREE.Mesh(geometry3, material));
        break;
      }
      
      case 'n': {
        // Fixed n with proper single arch
        const shape = new THREE.Shape();
        // Left vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height * 0.7);
        shape.lineTo(thickness, height * 0.7);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // Arch connecting to right stroke
        const arch = new THREE.Shape();
        arch.moveTo(thickness, height * 0.7);
        arch.bezierCurveTo(thickness, height * 0.7, width - thickness, height * 0.7, width - thickness, height * 0.5);
        arch.lineTo(width - thickness, 0);
        arch.lineTo(width, 0);
        arch.lineTo(width, height * 0.5);
        arch.bezierCurveTo(width, height * 0.7, thickness * 2, height * 0.6, thickness * 2, height * 0.6);
        arch.lineTo(thickness * 2, height * 0.7);
        arch.closePath();
        
        const geometry1 = createExtrudedGeometry(shape);
        const geometry2 = createExtrudedGeometry(arch);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        break;
      }
      
      case 'o': {
        const shape = new THREE.Shape();
        // Outer circle
        shape.moveTo(width, height/2);
        shape.bezierCurveTo(width, 0, 0, 0, 0, height/2);
        shape.bezierCurveTo(0, height, width, height, width, height/2);
        shape.closePath();
        
        // Inner hole
        const hole = new THREE.Shape();
        hole.moveTo(width * 0.8, height/2);
        hole.bezierCurveTo(width * 0.8, thickness, thickness, thickness, thickness, height/2);
        hole.bezierCurveTo(thickness, height - thickness, width * 0.8, height - thickness, width * 0.8, height/2);
        hole.closePath();
        
        const geometry = createExtrudedGeometry(shape, [hole]);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'p': {
        const shape = new THREE.Shape();
        // Left vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height);
        shape.lineTo(thickness, height);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // Top bump only
        const bump = new THREE.Shape();
        bump.moveTo(thickness, height * 0.5);
        bump.lineTo(width * 0.7, height * 0.5);
        bump.bezierCurveTo(width, height * 0.5, width, height, width * 0.7, height);
        bump.lineTo(thickness, height);
        bump.closePath();
        
        // Create hole for the bump
        const hole = new THREE.Shape();
        hole.moveTo(thickness * 2, height * 0.75);
        hole.bezierCurveTo(width * 0.8, height * 0.75, width * 0.8, height * 0.6, thickness * 2, height * 0.6);
        hole.closePath();
        
        const geometry1 = createExtrudedGeometry(shape);
        const geometry2 = createExtrudedGeometry(bump, [hole]);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        break;
      }
      
      case 'q': {
        const shape = new THREE.Shape();
        // Outer circle
        shape.moveTo(width, height/2);
        shape.bezierCurveTo(width, 0, 0, 0, 0, height/2);
        shape.bezierCurveTo(0, height, width, height, width, height/2);
        shape.closePath();
        
        // Inner hole
        const hole = new THREE.Shape();
        hole.moveTo(width * 0.8, height/2);
        hole.bezierCurveTo(width * 0.8, thickness, thickness, thickness, thickness, height/2);
        hole.bezierCurveTo(thickness, height - thickness, width * 0.8, height - thickness, width * 0.8, height/2);
        hole.closePath();
        
        // Tail
        const tail = new THREE.Shape();
        tail.moveTo(width * 0.7, height * 0.3);
        tail.lineTo(width * 1.2, -height * 0.2);
        tail.lineTo(width * 1.3, -height * 0.1);
        tail.lineTo(width * 0.8, height * 0.4);
        tail.closePath();
        
        const geometry1 = createExtrudedGeometry(shape, [hole]);
        const geometry2 = createExtrudedGeometry(tail);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        break;
      }
      
      case 'r': {
        // Fixed r with curved top that curves downward
        const shape = new THREE.Shape();
        // Left vertical stroke
        shape.moveTo(0, 0);
        shape.lineTo(0, height * 0.7);
        shape.lineTo(thickness, height * 0.7);
        shape.lineTo(thickness, 0);
        shape.closePath();
        
        // Curved top that curves downward (like a hook)
        const curve = new THREE.Shape();
        curve.moveTo(thickness, height * 0.7);
        curve.bezierCurveTo(thickness, height * 0.7, width * 0.6, height * 0.7, width * 0.6, height * 0.5);
        curve.bezierCurveTo(width * 0.6, height * 0.4, width * 0.4, height * 0.4, width * 0.4, height * 0.5);
        curve.lineTo(width * 0.3, height * 0.5);
        curve.bezierCurveTo(width * 0.3, height * 0.3, width * 0.7, height * 0.3, width * 0.7, height * 0.5);
        curve.bezierCurveTo(width * 0.7, height * 0.8, thickness * 2, height * 0.6, thickness * 2, height * 0.6);
        curve.lineTo(thickness * 2, height * 0.7);
        curve.closePath();
        
        const geometry1 = createExtrudedGeometry(shape);
        const geometry2 = createExtrudedGeometry(curve);
        
        group.add(new THREE.Mesh(geometry1, material));
        group.add(new THREE.Mesh(geometry2, material));
        break;
      }
      
      case 's': {
        // Fixed s with proper S-curve
        const shape = new THREE.Shape();
        // S-curve shape
        shape.moveTo(width * 0.8, height * 0.2);
        shape.bezierCurveTo(width * 0.8, 0, 0, 0, 0, height * 0.2);
        shape.bezierCurveTo(0, height * 0.4, width * 0.5, height * 0.4, width * 0.5, height * 0.5);
        shape.bezierCurveTo(width * 0.5, height * 0.6, 0, height * 0.6, 0, height * 0.8);
        shape.bezierCurveTo(0, height, width * 0.8, height, width * 0.8, height * 0.8);
        shape.lineTo(width * 0.6, height * 0.8);
        shape.bezierCurveTo(width * 0.6, height * 0.9, thickness, height * 0.9, thickness, height * 0.8);
        shape.bezierCurveTo(thickness, height * 0.7, width * 0.4, height * 0.7, width * 0.4, height * 0.5);
        shape.bezierCurveTo(width * 0.4, height * 0.3, thickness, height * 0.3, thickness, height * 0.2);
        shape.bezierCurveTo(thickness, height * 0.1, width * 0.6, height * 0.1, width * 0.6, height * 0.2);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 't': {
        const shape = new THREE.Shape();
        // Horizontal top bar
        shape.moveTo(0, height);
        shape.lineTo(width, height);
        shape.lineTo(width, height - thickness);
        shape.lineTo((width + thickness)/2, height - thickness);
        shape.lineTo((width + thickness)/2, 0);
        shape.lineTo((width - thickness)/2, 0);
        shape.lineTo((width - thickness)/2, height - thickness);
        shape.lineTo(0, height - thickness);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'u': {
        const shape = new THREE.Shape();
        // U shape
        shape.moveTo(0, height);
        shape.lineTo(0, height * 0.3);
        shape.bezierCurveTo(0, 0, width, 0, width, height * 0.3);
        shape.lineTo(width, height);
        shape.lineTo(width - thickness, height);
        shape.lineTo(width - thickness, height * 0.3);
        shape.bezierCurveTo(width - thickness, thickness, thickness, thickness, thickness, height * 0.3);
        shape.lineTo(thickness, height);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'v': {
        const shape = new THREE.Shape();
        // V shape
        shape.moveTo(0, height);
        shape.lineTo(width/2, 0);
        shape.lineTo(width, height);
        shape.lineTo(width - thickness, height);
        shape.lineTo(width/2, thickness * 2);
        shape.lineTo(thickness, height);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'w': {
        const shape = new THREE.Shape();
        // W shape (double V)
        shape.moveTo(0, height);
        shape.lineTo(width * 0.25, 0);
        shape.lineTo(width * 0.5, height * 0.6);
        shape.lineTo(width * 0.75, 0);
        shape.lineTo(width, height);
        shape.lineTo(width - thickness, height);
        shape.lineTo(width * 0.75, thickness * 2);
        shape.lineTo(width * 0.5, height * 0.4);
        shape.lineTo(width * 0.25, thickness * 2);
        shape.lineTo(thickness, height);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'x': {
        const shape = new THREE.Shape();
        // X shape (two diagonal strokes)
        shape.moveTo(0, height);
        shape.lineTo(width * 0.4, height/2);
        shape.lineTo(0, 0);
        shape.lineTo(thickness * 2, 0);
        shape.lineTo(width/2, height * 0.4);
        shape.lineTo(width - thickness * 2, 0);
        shape.lineTo(width, 0);
        shape.lineTo(width * 0.6, height/2);
        shape.lineTo(width, height);
        shape.lineTo(width - thickness * 2, height);
        shape.lineTo(width/2, height * 0.6);
        shape.lineTo(thickness * 2, height);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'y': {
        const shape = new THREE.Shape();
        // Y shape
        shape.moveTo(0, height);
        shape.lineTo(width/2, height/2);
        shape.lineTo(width, height);
        shape.lineTo(width - thickness, height);
        shape.lineTo(width/2 + thickness/2, height/2 + thickness);
        shape.lineTo(width/2 + thickness/2, 0);
        shape.lineTo(width/2 - thickness/2, 0);
        shape.lineTo(width/2 - thickness/2, height/2 + thickness);
        shape.lineTo(thickness, height);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      case 'z': {
        const shape = new THREE.Shape();
        // Z shape
        shape.moveTo(0, height);
        shape.lineTo(width, height);
        shape.lineTo(width, height - thickness);
        shape.lineTo(thickness * 2, thickness);
        shape.lineTo(width, thickness);
        shape.lineTo(width, 0);
        shape.lineTo(0, 0);
        shape.lineTo(0, thickness);
        shape.lineTo(width - thickness * 2, height - thickness);
        shape.lineTo(0, height - thickness);
        shape.closePath();
        
        const geometry = createExtrudedGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
      
      // Lowercase letters (scaled down and adjusted)
      case ' ': {
        // Space - empty group
        break;
      }
      
      default: {
        // Fallback - simple block
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        break;
      }
    }
    
    // Adjust for lowercase letters
    if (letter !== letter.toUpperCase() && letter !== ' ') {
      group.scale.set(0.7, 0.7, 1); // Make lowercase smaller
      group.position.y = -height * 0.15; // Adjust baseline
    }
    
    return group;
  };

  const create3DText = (text: string): THREE.Group => {
    const textGroup = new THREE.Group();
    const spacing = 1.2;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        continue; // Skip spaces but maintain spacing
      }
      
      const letterGroup = create3DLetter(char);
      letterGroup.position.x = i * spacing;
      textGroup.add(letterGroup);
    }
    
    // Center the text
    const box = new THREE.Box3().setFromObject(textGroup);
    const center = box.getCenter(new THREE.Vector3());
    textGroup.position.x = -center.x;
    
    return textGroup;
  };

  const handleAdd3DText = () => {
    if (text3D.trim()) {
      const textObject = create3DText(text3D);
      addObject(textObject, `3D Text: "${text3D}"`);
      setText3D('');
      setShowTextInput(false);
    }
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
      icon: Pyramid,
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
    },
    {
      icon: Type,
      name: '3D Text',
      action: () => setShowTextInput(true)
    }
  ] as const;

  const createNatureObject = (type: string): THREE.Group => {
    const group = new THREE.Group();
    const greenMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
    const brownMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const grayMaterial = new THREE.MeshStandardMaterial({ color: '#696969' });

    switch (type) {
      case 'Pine Tree': {
        // Trunk
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.15, 1, 8),
          brownMaterial
        );
        trunk.position.y = 0.5;
        group.add(trunk);

        // Three layers of pine needles
        for (let i = 0; i < 3; i++) {
          const needles = new THREE.Mesh(
            new THREE.ConeGeometry(0.8 - i * 0.2, 1.2 - i * 0.2, 8),
            greenMaterial
          );
          needles.position.y = 1.2 + i * 0.6;
          group.add(needles);
        }
        break;
      }
      case 'Oak Tree': {
        // Trunk
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8),
          brownMaterial
        );
        trunk.position.y = 0.75;
        group.add(trunk);

        // Rounded crown
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 16, 12),
          greenMaterial
        );
        crown.position.y = 2;
        crown.scale.y = 0.8;
        group.add(crown);
        break;
      }
      case 'Flower': {
        // Stem
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6),
          greenMaterial
        );
        stem.position.y = 0.4;
        group.add(stem);

        // Flower petals
        const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });
        for (let i = 0; i < 6; i++) {
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 6),
            petalMaterial
          );
          const angle = (i / 6) * Math.PI * 2;
          petal.position.x = Math.cos(angle) * 0.15;
          petal.position.z = Math.sin(angle) * 0.15;
          petal.position.y = 0.8;
          petal.scale.y = 0.3;
          group.add(petal);
        }

        // Center
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 6),
          new THREE.MeshStandardMaterial({ color: '#FFD700' })
        );
        center.position.y = 0.8;
        group.add(center);
        break;
      }
      case 'Boulder': {
        const boulder = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 12, 8),
          grayMaterial
        );
        boulder.position.y = 0.6;
        boulder.scale.y = 0.7;
        boulder.scale.x = 1.2;
        group.add(boulder);
        break;
      }
      case 'Small Rock': {
        const rock = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 6),
          grayMaterial
        );
        rock.position.y = 0.2;
        rock.scale.y = 0.6;
        rock.scale.x = 1.1;
        group.add(rock);
        break;
      }
      case 'Grass Patch': {
        for (let i = 0; i < 20; i++) {
          const blade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.005, 0.3, 4),
            greenMaterial
          );
          blade.position.x = (Math.random() - 0.5) * 1.5;
          blade.position.z = (Math.random() - 0.5) * 1.5;
          blade.position.y = 0.15;
          blade.rotation.z = (Math.random() - 0.5) * 0.3;
          group.add(blade);
        }
        break;
      }
    }

    return group;
  };

  const natureTools = [
    {
      icon: TreePine,
      name: 'Pine Tree',
      action: () => startObjectPlacement({
        geometry: () => createNatureObject('Pine Tree'),
        name: 'Pine Tree'
      })
    },
    {
      icon: TreePine,
      name: 'Oak Tree',
      action: () => startObjectPlacement({
        geometry: () => createNatureObject('Oak Tree'),
        name: 'Oak Tree'
      })
    },
    {
      icon: Flower,
      name: 'Flower',
      action: () => startObjectPlacement({
        geometry: () => createNatureObject('Flower'),
        name: 'Flower'
      })
    },
    {
      icon: Mountain,
      name: 'Boulder',
      action: () => startObjectPlacement({
        geometry: () => createNatureObject('Boulder'),
        name: 'Boulder'
      })
    },
    {
      icon: Mountain,
      name: 'Small Rock',
      action: () => startObjectPlacement({
        geometry: () => createNatureObject('Small Rock'),
        name: 'Small Rock'
      })
    },
    {
      icon: TreePine,
      name: 'Grass Patch',
      action: () => startObjectPlacement({
        geometry: () => createNatureObject('Grass Patch'),
        name: 'Grass Patch'
      })
    }
  ] as const;

  const transformTools = [
    {
      icon: MousePointer,
      mode: null,
      name: 'Select',
      active: transformMode === null
    },
    {
      icon: Move,
      mode: 'translate' as const,
      name: 'Move',
      active: transformMode === 'translate'
    },
    {
      icon: RotateCw,
      mode: 'rotate' as const,
      name: 'Rotate',
      active: transformMode === 'rotate'
    },
    {
      icon: Scale,
      mode: 'scale' as const,
      name: 'Scale',
      active: transformMode === 'scale'
    }
  ] as const;

  const editTools = [
    {
      icon: Vertices,
      mode: 'vertex' as const,
      name: 'Edit Vertices',
      active: editMode === 'vertex'
    },
    {
      icon: Minus,
      mode: 'edge' as const,
      name: 'Edit Edges',
      active: editMode === 'edge'
    }
  ] as const;

  const lightTools = [
    {
      icon: Sun,
      name: 'Directional Light',
      action: () => addLight('directional')
    },
    {
      icon: Lightbulb,
      name: 'Point Light',
      action: () => addLight('point')
    },
    {
      icon: Zap,
      name: 'Spot Light',
      action: () => addLight('spot')
    }
  ] as const;

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-4 border border-white/5 z-10">
      <div className="space-y-6">
        {/* 3D Objects */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">3D Objects</h3>
          <div className="grid grid-cols-2 gap-2">
            {primitiveTools.map(({ icon: Icon, name, action }) => (
              <button
                key={name}
                onClick={action}
                className="p-3 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all duration-200 flex flex-col items-center gap-2 group hover:scale-105"
                title={name}
              >
                <Icon className="w-5 h-5 text-white/90 group-hover:text-white" />
                <span className="text-xs text-white/70 group-hover:text-white/90">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nature Objects */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Nature</h3>
          <div className="grid grid-cols-2 gap-2">
            {natureTools.map(({ icon: Icon, name, action }) => (
              <button
                key={name}
                onClick={action}
                className="p-3 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all duration-200 flex flex-col items-center gap-2 group hover:scale-105"
                title={name}
              >
                <Icon className="w-5 h-5 text-white/90 group-hover:text-white" />
                <span className="text-xs text-white/70 group-hover:text-white/90">{name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transform Tools */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Transform</h3>
          <div className="grid grid-cols-2 gap-2">
            {transformTools.map(({ icon: Icon, mode, name, active }) => (
              <button
                key={name}
                onClick={() => setTransformMode(mode)}
                className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 group hover:scale-105 ${
                  active
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white/90 hover:text-white'
                }`}
                title={name}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Edit Tools */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Edit</h3>
          <div className="grid grid-cols-2 gap-2">
            {editTools.map(({ icon: Icon, mode, name, active }) => (
              <button
                key={name}
                onClick={() => setEditMode(active ? null : mode)}
                className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 group hover:scale-105 ${
                  active
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white/90 hover:text-white'
                }`}
                title={name}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{name.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lighting Tools */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Lighting</h3>
          <div className="grid grid-cols-1 gap-2">
            {lightTools.map(({ icon: Icon, name, action }) => (
              <button
                key={name}
                onClick={action}
                className="p-3 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all duration-200 flex items-center gap-3 group hover:scale-105"
                title={name}
              >
                <Icon className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-xs text-white/70 group-hover:text-white/90">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Create 3D Text</h3>
            <input
              type="text"
              value={text3D}
              onChange={(e) => setText3D(e.target.value)}
              placeholder="Enter text to convert to 3D..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2 text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd3DText();
                } else if (e.key === 'Escape') {
                  setShowTextInput(false);
                  setText3D('');
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd3DText}
                disabled={!text3D.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create 3D Text
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setText3D('');
                }}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white/90 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;