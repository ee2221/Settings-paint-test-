import React, { useState } from 'react';
import { 
  Box, 
  Sphere, 
  Cylinder, 
  Pyramid,
  Torus,
  Cone,
  Lightbulb,
  Trees,
  Mountain,
  Flower,
  Type,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { startObjectPlacement } = useSceneStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['primitives']);
  const [textInput, setTextInput] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Create 3D text geometry for letters and symbols
  const create3DText = (character: string) => {
    const loader = new THREE.FontLoader();
    
    // Create a simple extruded text geometry
    const createTextGeometry = () => {
      // For now, we'll create a simple box-based representation
      // In a real implementation, you'd load a font and use TextGeometry
      const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.2);
      
      // Create a material with the character as a texture
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 128, 128);
        
        // Draw character
        context.fillStyle = '#000000';
        context.font = 'bold 80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(character, 64, 64);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        color: '#44aa88'
      });
      
      return { geometry, material };
    };

    return () => {
      const { geometry, material } = createTextGeometry();
      return new THREE.Mesh(geometry, material);
    };
  };

  // Enhanced character mapping including symbols
  const getCharacterGeometry = (char: string) => {
    const upperChar = char.toUpperCase();
    
    // Special handling for symbols
    const symbolGeometries: { [key: string]: () => THREE.BufferGeometry | THREE.Group } = {
      // Numbers
      '0': () => {
        const geometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16);
        return geometry;
      },
      '1': () => {
        const geometry = new THREE.BoxGeometry(0.2, 1.2, 0.2);
        return geometry;
      },
      '2': () => {
        const group = new THREE.Group();
        // Create a curved shape for number 2
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.3, 0.4, 0),
          new THREE.Vector3(0, 0.6, 0),
          new THREE.Vector3(0.3, 0.4, 0),
          new THREE.Vector3(0.3, 0, 0),
          new THREE.Vector3(-0.3, -0.4, 0),
          new THREE.Vector3(0.3, -0.6, 0)
        ]);
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        const mesh = new THREE.Mesh(tubeGeometry, material);
        group.add(mesh);
        return group;
      },
      '3': () => {
        const group = new THREE.Group();
        // Two half-torus shapes for number 3
        const topTorus = new THREE.TorusGeometry(0.25, 0.1, 8, 16, Math.PI);
        const bottomTorus = new THREE.TorusGeometry(0.25, 0.1, 8, 16, Math.PI);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const topMesh = new THREE.Mesh(topTorus, material);
        topMesh.position.y = 0.3;
        topMesh.rotation.z = -Math.PI / 2;
        
        const bottomMesh = new THREE.Mesh(bottomTorus, material);
        bottomMesh.position.y = -0.3;
        bottomMesh.rotation.z = -Math.PI / 2;
        
        group.add(topMesh, bottomMesh);
        return group;
      },
      '4': () => {
        const group = new THREE.Group();
        // Vertical line and horizontal line for number 4
        const vertical = new THREE.BoxGeometry(0.1, 1.2, 0.1);
        const horizontal = new THREE.BoxGeometry(0.6, 0.1, 0.1);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const verticalMesh1 = new THREE.Mesh(vertical, material);
        verticalMesh1.position.x = -0.2;
        
        const verticalMesh2 = new THREE.Mesh(vertical, material);
        verticalMesh2.position.x = 0.2;
        
        const horizontalMesh = new THREE.Mesh(horizontal, material);
        horizontalMesh.position.y = 0.1;
        
        group.add(verticalMesh1, verticalMesh2, horizontalMesh);
        return group;
      },
      '5': () => {
        const group = new THREE.Group();
        // Create shape for number 5
        const topHorizontal = new THREE.BoxGeometry(0.5, 0.1, 0.1);
        const vertical = new THREE.BoxGeometry(0.1, 0.6, 0.1);
        const middleHorizontal = new THREE.BoxGeometry(0.4, 0.1, 0.1);
        const bottomCurve = new THREE.TorusGeometry(0.2, 0.1, 8, 16, Math.PI);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const topMesh = new THREE.Mesh(topHorizontal, material);
        topMesh.position.set(0, 0.55, 0);
        
        const verticalMesh = new THREE.Mesh(vertical, material);
        verticalMesh.position.set(-0.2, 0.15, 0);
        
        const middleMesh = new THREE.Mesh(middleHorizontal, material);
        middleMesh.position.set(0.05, 0.1, 0);
        
        const bottomMesh = new THREE.Mesh(bottomCurve, material);
        bottomMesh.position.set(0.1, -0.3, 0);
        bottomMesh.rotation.z = -Math.PI / 2;
        
        group.add(topMesh, verticalMesh, middleMesh, bottomMesh);
        return group;
      },
      '6': () => {
        const group = new THREE.Group();
        const mainTorus = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const topCurve = new THREE.TorusGeometry(0.3, 0.1, 8, 16, Math.PI);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const mainMesh = new THREE.Mesh(mainTorus, material);
        mainMesh.position.y = -0.2;
        
        const topMesh = new THREE.Mesh(topCurve, material);
        topMesh.position.y = 0.2;
        topMesh.rotation.z = Math.PI / 2;
        
        group.add(mainMesh, topMesh);
        return group;
      },
      '7': () => {
        const group = new THREE.Group();
        const horizontal = new THREE.BoxGeometry(0.6, 0.1, 0.1);
        const diagonal = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const horizontalMesh = new THREE.Mesh(horizontal, material);
        horizontalMesh.position.y = 0.55;
        
        const diagonalMesh = new THREE.Mesh(diagonal, material);
        diagonalMesh.position.set(0.1, 0, 0);
        diagonalMesh.rotation.z = -Math.PI / 6;
        
        group.add(horizontalMesh, diagonalMesh);
        return group;
      },
      '8': () => {
        const group = new THREE.Group();
        const topTorus = new THREE.TorusGeometry(0.2, 0.1, 8, 16);
        const bottomTorus = new THREE.TorusGeometry(0.25, 0.1, 8, 16);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const topMesh = new THREE.Mesh(topTorus, material);
        topMesh.position.y = 0.3;
        
        const bottomMesh = new THREE.Mesh(bottomTorus, material);
        bottomMesh.position.y = -0.3;
        
        group.add(topMesh, bottomMesh);
        return group;
      },
      '9': () => {
        const group = new THREE.Group();
        const mainTorus = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const bottomCurve = new THREE.TorusGeometry(0.3, 0.1, 8, 16, Math.PI);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const mainMesh = new THREE.Mesh(mainTorus, material);
        mainMesh.position.y = 0.2;
        
        const bottomMesh = new THREE.Mesh(bottomCurve, material);
        bottomMesh.position.y = -0.2;
        bottomMesh.rotation.z = -Math.PI / 2;
        
        group.add(mainMesh, bottomMesh);
        return group;
      },
      
      // Common symbols
      '!': () => {
        const group = new THREE.Group();
        const line = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const dot = new THREE.SphereGeometry(0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const lineMesh = new THREE.Mesh(line, material);
        lineMesh.position.y = 0.2;
        
        const dotMesh = new THREE.Mesh(dot, material);
        dotMesh.position.y = -0.5;
        
        group.add(lineMesh, dotMesh);
        return group;
      },
      '?': () => {
        const group = new THREE.Group();
        const curve = new THREE.TorusGeometry(0.2, 0.08, 8, 16, Math.PI);
        const line = new THREE.BoxGeometry(0.08, 0.3, 0.08);
        const dot = new THREE.SphereGeometry(0.06);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const curveMesh = new THREE.Mesh(curve, material);
        curveMesh.position.y = 0.3;
        curveMesh.rotation.z = -Math.PI / 2;
        
        const lineMesh = new THREE.Mesh(line, material);
        lineMesh.position.y = -0.1;
        
        const dotMesh = new THREE.Mesh(dot, material);
        dotMesh.position.y = -0.4;
        
        group.add(curveMesh, lineMesh, dotMesh);
        return group;
      },
      '@': () => {
        const group = new THREE.Group();
        const outerTorus = new THREE.TorusGeometry(0.4, 0.08, 8, 16);
        const innerTorus = new THREE.TorusGeometry(0.15, 0.06, 8, 16);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const outerMesh = new THREE.Mesh(outerTorus, material);
        const innerMesh = new THREE.Mesh(innerTorus, material);
        
        group.add(outerMesh, innerMesh);
        return group;
      },
      '#': () => {
        const group = new THREE.Group();
        const horizontal1 = new THREE.BoxGeometry(0.6, 0.08, 0.08);
        const horizontal2 = new THREE.BoxGeometry(0.6, 0.08, 0.08);
        const vertical1 = new THREE.BoxGeometry(0.08, 0.6, 0.08);
        const vertical2 = new THREE.BoxGeometry(0.08, 0.6, 0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const h1 = new THREE.Mesh(horizontal1, material);
        h1.position.y = 0.15;
        
        const h2 = new THREE.Mesh(horizontal2, material);
        h2.position.y = -0.15;
        
        const v1 = new THREE.Mesh(vertical1, material);
        v1.position.x = -0.15;
        
        const v2 = new THREE.Mesh(vertical2, material);
        v2.position.x = 0.15;
        
        group.add(h1, h2, v1, v2);
        return group;
      },
      '$': () => {
        const group = new THREE.Group();
        const curve1 = new THREE.TorusGeometry(0.2, 0.08, 8, 16, Math.PI);
        const curve2 = new THREE.TorusGeometry(0.2, 0.08, 8, 16, Math.PI);
        const line = new THREE.BoxGeometry(0.08, 0.8, 0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const c1 = new THREE.Mesh(curve1, material);
        c1.position.y = 0.2;
        c1.rotation.z = Math.PI / 2;
        
        const c2 = new THREE.Mesh(curve2, material);
        c2.position.y = -0.2;
        c2.rotation.z = -Math.PI / 2;
        
        const lineMesh = new THREE.Mesh(line, material);
        
        group.add(c1, c2, lineMesh);
        return group;
      },
      '%': () => {
        const group = new THREE.Group();
        const circle1 = new THREE.TorusGeometry(0.1, 0.05, 8, 16);
        const circle2 = new THREE.TorusGeometry(0.1, 0.05, 8, 16);
        const line = new THREE.BoxGeometry(0.05, 0.8, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const c1 = new THREE.Mesh(circle1, material);
        c1.position.set(-0.2, 0.3, 0);
        
        const c2 = new THREE.Mesh(circle2, material);
        c2.position.set(0.2, -0.3, 0);
        
        const lineMesh = new THREE.Mesh(line, material);
        lineMesh.rotation.z = Math.PI / 4;
        
        group.add(c1, c2, lineMesh);
        return group;
      },
      '&': () => {
        const group = new THREE.Group();
        const mainCurve = new THREE.TorusGeometry(0.25, 0.08, 8, 16, Math.PI * 1.5);
        const tail = new THREE.BoxGeometry(0.08, 0.3, 0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const curveMesh = new THREE.Mesh(mainCurve, material);
        curveMesh.rotation.z = Math.PI / 4;
        
        const tailMesh = new THREE.Mesh(tail, material);
        tailMesh.position.set(0.2, -0.2, 0);
        tailMesh.rotation.z = -Math.PI / 4;
        
        group.add(curveMesh, tailMesh);
        return group;
      },
      '*': () => {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        for (let i = 0; i < 6; i++) {
          const line = new THREE.BoxGeometry(0.05, 0.4, 0.05);
          const mesh = new THREE.Mesh(line, material);
          mesh.rotation.z = (i * Math.PI) / 3;
          group.add(mesh);
        }
        
        return group;
      },
      '+': () => {
        const group = new THREE.Group();
        const horizontal = new THREE.BoxGeometry(0.4, 0.08, 0.08);
        const vertical = new THREE.BoxGeometry(0.08, 0.4, 0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const h = new THREE.Mesh(horizontal, material);
        const v = new THREE.Mesh(vertical, material);
        
        group.add(h, v);
        return group;
      },
      '-': () => {
        const geometry = new THREE.BoxGeometry(0.4, 0.08, 0.08);
        return geometry;
      },
      '=': () => {
        const group = new THREE.Group();
        const line1 = new THREE.BoxGeometry(0.4, 0.06, 0.06);
        const line2 = new THREE.BoxGeometry(0.4, 0.06, 0.06);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const l1 = new THREE.Mesh(line1, material);
        l1.position.y = 0.1;
        
        const l2 = new THREE.Mesh(line2, material);
        l2.position.y = -0.1;
        
        group.add(l1, l2);
        return group;
      },
      '(': () => {
        const geometry = new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI);
        return geometry;
      },
      ')': () => {
        const geometry = new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI);
        const mesh = new THREE.Mesh(geometry);
        mesh.rotation.z = Math.PI;
        return mesh.geometry;
      },
      '[': () => {
        const group = new THREE.Group();
        const vertical = new THREE.BoxGeometry(0.08, 0.6, 0.08);
        const top = new THREE.BoxGeometry(0.2, 0.08, 0.08);
        const bottom = new THREE.BoxGeometry(0.2, 0.08, 0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const v = new THREE.Mesh(vertical, material);
        v.position.x = -0.06;
        
        const t = new THREE.Mesh(top, material);
        t.position.set(0.04, 0.26, 0);
        
        const b = new THREE.Mesh(bottom, material);
        b.position.set(0.04, -0.26, 0);
        
        group.add(v, t, b);
        return group;
      },
      ']': () => {
        const group = new THREE.Group();
        const vertical = new THREE.BoxGeometry(0.08, 0.6, 0.08);
        const top = new THREE.BoxGeometry(0.2, 0.08, 0.08);
        const bottom = new THREE.BoxGeometry(0.2, 0.08, 0.08);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const v = new THREE.Mesh(vertical, material);
        v.position.x = 0.06;
        
        const t = new THREE.Mesh(top, material);
        t.position.set(-0.04, 0.26, 0);
        
        const b = new THREE.Mesh(bottom, material);
        b.position.set(-0.04, -0.26, 0);
        
        group.add(v, t, b);
        return group;
      },
      '{': () => {
        const group = new THREE.Group();
        const curve1 = new THREE.TorusGeometry(0.1, 0.05, 8, 16, Math.PI / 2);
        const curve2 = new THREE.TorusGeometry(0.1, 0.05, 8, 16, Math.PI / 2);
        const curve3 = new THREE.TorusGeometry(0.1, 0.05, 8, 16, Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const c1 = new THREE.Mesh(curve1, material);
        c1.position.set(0, 0.2, 0);
        c1.rotation.z = Math.PI;
        
        const c2 = new THREE.Mesh(curve2, material);
        c2.position.set(-0.1, 0, 0);
        c2.rotation.z = Math.PI / 2;
        
        const c3 = new THREE.Mesh(curve3, material);
        c3.position.set(0, -0.2, 0);
        
        group.add(c1, c2, c3);
        return group;
      },
      '}': () => {
        const group = new THREE.Group();
        const curve1 = new THREE.TorusGeometry(0.1, 0.05, 8, 16, Math.PI / 2);
        const curve2 = new THREE.TorusGeometry(0.1, 0.05, 8, 16, Math.PI / 2);
        const curve3 = new THREE.TorusGeometry(0.1, 0.05, 8, 16, Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const c1 = new THREE.Mesh(curve1, material);
        c1.position.set(0, 0.2, 0);
        c1.rotation.z = -Math.PI / 2;
        
        const c2 = new THREE.Mesh(curve2, material);
        c2.position.set(0.1, 0, 0);
        c2.rotation.z = -Math.PI / 2;
        
        const c3 = new THREE.Mesh(curve3, material);
        c3.position.set(0, -0.2, 0);
        c3.rotation.z = Math.PI;
        
        group.add(c1, c2, c3);
        return group;
      },
      '<': () => {
        const group = new THREE.Group();
        const line1 = new THREE.BoxGeometry(0.05, 0.3, 0.05);
        const line2 = new THREE.BoxGeometry(0.05, 0.3, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const l1 = new THREE.Mesh(line1, material);
        l1.position.y = 0.1;
        l1.rotation.z = Math.PI / 4;
        
        const l2 = new THREE.Mesh(line2, material);
        l2.position.y = -0.1;
        l2.rotation.z = -Math.PI / 4;
        
        group.add(l1, l2);
        return group;
      },
      '>': () => {
        const group = new THREE.Group();
        const line1 = new THREE.BoxGeometry(0.05, 0.3, 0.05);
        const line2 = new THREE.BoxGeometry(0.05, 0.3, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const l1 = new THREE.Mesh(line1, material);
        l1.position.y = 0.1;
        l1.rotation.z = -Math.PI / 4;
        
        const l2 = new THREE.Mesh(line2, material);
        l2.position.y = -0.1;
        l2.rotation.z = Math.PI / 4;
        
        group.add(l1, l2);
        return group;
      },
      ',': () => {
        const group = new THREE.Group();
        const dot = new THREE.SphereGeometry(0.06);
        const tail = new THREE.BoxGeometry(0.04, 0.15, 0.04);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const dotMesh = new THREE.Mesh(dot, material);
        dotMesh.position.y = -0.4;
        
        const tailMesh = new THREE.Mesh(tail, material);
        tailMesh.position.set(-0.05, -0.5, 0);
        tailMesh.rotation.z = Math.PI / 6;
        
        group.add(dotMesh, tailMesh);
        return group;
      },
      '.': () => {
        const geometry = new THREE.SphereGeometry(0.08);
        return geometry;
      },
      ';': () => {
        const group = new THREE.Group();
        const dot = new THREE.SphereGeometry(0.06);
        const comma = new THREE.SphereGeometry(0.06);
        const tail = new THREE.BoxGeometry(0.04, 0.12, 0.04);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const dotMesh = new THREE.Mesh(dot, material);
        dotMesh.position.y = 0.2;
        
        const commaMesh = new THREE.Mesh(comma, material);
        commaMesh.position.y = -0.2;
        
        const tailMesh = new THREE.Mesh(tail, material);
        tailMesh.position.set(-0.04, -0.3, 0);
        tailMesh.rotation.z = Math.PI / 6;
        
        group.add(dotMesh, commaMesh, tailMesh);
        return group;
      },
      ':': () => {
        const group = new THREE.Group();
        const dot1 = new THREE.SphereGeometry(0.06);
        const dot2 = new THREE.SphereGeometry(0.06);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const d1 = new THREE.Mesh(dot1, material);
        d1.position.y = 0.15;
        
        const d2 = new THREE.Mesh(dot2, material);
        d2.position.y = -0.15;
        
        group.add(d1, d2);
        return group;
      },
      '"': () => {
        const group = new THREE.Group();
        const line1 = new THREE.BoxGeometry(0.05, 0.2, 0.05);
        const line2 = new THREE.BoxGeometry(0.05, 0.2, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const l1 = new THREE.Mesh(line1, material);
        l1.position.set(-0.08, 0.4, 0);
        
        const l2 = new THREE.Mesh(line2, material);
        l2.position.set(0.08, 0.4, 0);
        
        group.add(l1, l2);
        return group;
      },
      "'": () => {
        const geometry = new THREE.BoxGeometry(0.05, 0.2, 0.05);
        return geometry;
      },
      '/': () => {
        const geometry = new THREE.BoxGeometry(0.05, 0.8, 0.05);
        const mesh = new THREE.Mesh(geometry);
        mesh.rotation.z = Math.PI / 4;
        return mesh.geometry;
      },
      '\\': () => {
        const geometry = new THREE.BoxGeometry(0.05, 0.8, 0.05);
        const mesh = new THREE.Mesh(geometry);
        mesh.rotation.z = -Math.PI / 4;
        return mesh.geometry;
      },
      '|': () => {
        const geometry = new THREE.BoxGeometry(0.05, 0.8, 0.05);
        return geometry;
      },
      '~': () => {
        const group = new THREE.Group();
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.3, 0, 0),
          new THREE.Vector3(-0.1, 0.1, 0),
          new THREE.Vector3(0.1, -0.1, 0),
          new THREE.Vector3(0.3, 0, 0)
        ]);
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        const mesh = new THREE.Mesh(tubeGeometry, material);
        group.add(mesh);
        return group;
      },
      '`': () => {
        const geometry = new THREE.BoxGeometry(0.05, 0.15, 0.05);
        const mesh = new THREE.Mesh(geometry);
        mesh.rotation.z = -Math.PI / 6;
        mesh.position.y = 0.4;
        return mesh.geometry;
      },
      '^': () => {
        const group = new THREE.Group();
        const line1 = new THREE.BoxGeometry(0.05, 0.2, 0.05);
        const line2 = new THREE.BoxGeometry(0.05, 0.2, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: '#44aa88' });
        
        const l1 = new THREE.Mesh(line1, material);
        l1.position.set(-0.05, 0.4, 0);
        l1.rotation.z = Math.PI / 4;
        
        const l2 = new THREE.Mesh(line2, material);
        l2.position.set(0.05, 0.4, 0);
        l2.rotation.z = -Math.PI / 4;
        
        group.add(l1, l2);
        return group;
      },
      '_': () => {
        const geometry = new THREE.BoxGeometry(0.4, 0.05, 0.05);
        const mesh = new THREE.Mesh(geometry);
        mesh.position.y = -0.5;
        return mesh.geometry;
      },
      ' ': () => {
        // Space character - return empty geometry
        const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        return geometry;
      }
    };

    // Check if it's a symbol first
    if (symbolGeometries[char]) {
      return symbolGeometries[char];
    }

    // For letters, use the text creation function
    return create3DText(char);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;

    // Create 3D objects for each character
    textInput.split('').forEach((char, index) => {
      if (char === ' ') return; // Skip spaces
      
      const geometryFunc = getCharacterGeometry(char);
      
      startObjectPlacement({
        geometry: geometryFunc,
        name: `Text: ${char}`,
        color: '#44aa88'
      });
    });

    setTextInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    }
  };

  const primitiveTools = [
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
      icon: Pyramid,
      geometry: () => new THREE.ConeGeometry(0.5, 1, 32),
      color: '#88aa44'
    },
    {
      name: 'Torus',
      icon: Torus,
      geometry: () => new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      color: '#aa8844'
    }
  ];

  const createNatureObject = (type: string) => {
    const group = new THREE.Group();
    
    switch (type) {
      case 'Pine Tree':
        // Create a simple pine tree with trunk and cone-shaped foliage
        const trunk = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const trunkMesh = new THREE.Mesh(trunk, trunkMaterial);
        trunkMesh.position.y = 0.5;
        
        // Create multiple layers of foliage
        for (let i = 0; i < 3; i++) {
          const foliage = new THREE.ConeGeometry(0.8 - i * 0.2, 0.8, 8);
          const foliageMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
          const foliageMesh = new THREE.Mesh(foliage, foliageMaterial);
          foliageMesh.position.y = 1.2 + i * 0.4;
          group.add(foliageMesh);
        }
        
        group.add(trunkMesh);
        break;
        
      case 'Oak Tree':
        // Create an oak tree with trunk and spherical foliage
        const oakTrunk = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
        const oakTrunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const oakTrunkMesh = new THREE.Mesh(oakTrunk, oakTrunkMaterial);
        oakTrunkMesh.position.y = 0.75;
        
        const oakFoliage = new THREE.SphereGeometry(1.2, 16, 12);
        const oakFoliageMaterial = new THREE.MeshStandardMaterial({ color: '#32CD32' });
        const oakFoliageMesh = new THREE.Mesh(oakFoliage, oakFoliageMaterial);
        oakFoliageMesh.position.y = 2;
        
        group.add(oakTrunkMesh, oakFoliageMesh);
        break;
        
      case 'Flower':
        // Create a simple flower with stem and petals
        const stem = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
        const stemMesh = new THREE.Mesh(stem, stemMaterial);
        stemMesh.position.y = 0.4;
        
        const center = new THREE.SphereGeometry(0.08, 8, 6);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
        const centerMesh = new THREE.Mesh(center, centerMaterial);
        centerMesh.position.y = 0.8;
        
        // Create petals around the center
        for (let i = 0; i < 6; i++) {
          const petal = new THREE.SphereGeometry(0.12, 8, 6);
          const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });
          const petalMesh = new THREE.Mesh(petal, petalMaterial);
          const angle = (i / 6) * Math.PI * 2;
          petalMesh.position.set(
            Math.cos(angle) * 0.15,
            0.8,
            Math.sin(angle) * 0.15
          );
          petalMesh.scale.set(0.8, 0.5, 0.8);
          group.add(petalMesh);
        }
        
        group.add(stemMesh, centerMesh);
        break;
        
      case 'Boulder':
        // Create an irregular boulder shape
        const boulder = new THREE.SphereGeometry(0.8, 8, 6);
        const boulderMaterial = new THREE.MeshStandardMaterial({ color: '#696969' });
        const boulderMesh = new THREE.Mesh(boulder, boulderMaterial);
        boulderMesh.scale.set(1.2, 0.8, 1.1);
        boulderMesh.position.y = 0.4;
        group.add(boulderMesh);
        break;
        
      case 'Small Rock':
        // Create a small rock
        const rock = new THREE.SphereGeometry(0.3, 6, 4);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: '#A0A0A0' });
        const rockMesh = new THREE.Mesh(rock, rockMaterial);
        rockMesh.scale.set(1.3, 0.6, 0.9);
        rockMesh.position.y = 0.15;
        group.add(rockMesh);
        break;
        
      case 'Grass Patch':
        // Create multiple grass blades
        for (let i = 0; i < 12; i++) {
          const blade = new THREE.CylinderGeometry(0.01, 0.02, 0.3, 4);
          const bladeMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
          const bladeMesh = new THREE.Mesh(blade, bladeMaterial);
          
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 0.3;
          bladeMesh.position.set(
            Math.cos(angle) * radius,
            0.15,
            Math.sin(angle) * radius
          );
          bladeMesh.rotation.z = (Math.random() - 0.5) * 0.3;
          
          group.add(bladeMesh);
        }
        break;
    }
    
    return group;
  };

  const natureTools = [
    {
      name: 'Pine Tree',
      icon: Trees,
      geometry: () => createNatureObject('Pine Tree'),
      color: '#228B22'
    },
    {
      name: 'Oak Tree',
      icon: Trees,
      geometry: () => createNatureObject('Oak Tree'),
      color: '#32CD32'
    },
    {
      name: 'Flower',
      icon: Flower,
      geometry: () => createNatureObject('Flower'),
      color: '#FF69B4'
    },
    {
      name: 'Boulder',
      icon: Mountain,
      geometry: () => createNatureObject('Boulder'),
      color: '#696969'
    },
    {
      name: 'Small Rock',
      icon: Mountain,
      geometry: () => createNatureObject('Small Rock'),
      color: '#A0A0A0'
    },
    {
      name: 'Grass Patch',
      icon: Trees,
      geometry: () => createNatureObject('Grass Patch'),
      color: '#228B22'
    }
  ];

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-4 w-64 border border-white/5 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Tools</h2>
      
      {/* Text Input Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('text')}
          className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors text-white/90 mb-2"
        >
          <div className="flex items-center gap-2">
            {expandedSections.includes('text') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Type className="w-4 h-4" />
            <span className="text-sm font-medium">3D Text & Symbols</span>
          </div>
        </button>

        {expandedSections.includes('text') && (
          <div className="space-y-3 ml-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Type text or symbols
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter text..."
                  className="flex-1 bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  className={`px-3 py-2 rounded transition-colors ${
                    textInput.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-xs text-white/50 space-y-1">
              <div>• Letters: A-Z, a-z</div>
              <div>• Numbers: 0-9</div>
              <div>• Symbols: ! @ # $ % ^ & * + - = ? ( ) [ ] { } &lt; &gt;</div>
              <div>• Punctuation: . , ; : " ' / \ | ~ ` _ and more</div>
            </div>
          </div>
        )}
      </div>

      {/* Primitives Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('primitives')}
          className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors text-white/90 mb-2"
        >
          <div className="flex items-center gap-2">
            {expandedSections.includes('primitives') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Box className="w-4 h-4" />
            <span className="text-sm font-medium">Primitives</span>
          </div>
        </button>

        {expandedSections.includes('primitives') && (
          <div className="grid grid-cols-2 gap-2 ml-4">
            {primitiveTools.map(({ name, icon: Icon, geometry, color }) => (
              <button
                key={name}
                onClick={() => startObjectPlacement({ geometry, name, color })}
                className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors flex flex-col items-center gap-2 border border-white/10"
                title={`Add ${name}`}
              >
                <Icon className="w-6 h-6 text-white/70" />
                <span className="text-xs text-white/90">{name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nature Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('nature')}
          className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors text-white/90 mb-2"
        >
          <div className="flex items-center gap-2">
            {expandedSections.includes('nature') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Trees className="w-4 h-4" />
            <span className="text-sm font-medium">Nature</span>
          </div>
        </button>

        {expandedSections.includes('nature') && (
          <div className="grid grid-cols-2 gap-2 ml-4">
            {natureTools.map(({ name, icon: Icon, geometry, color }) => (
              <button
                key={name}
                onClick={() => startObjectPlacement({ geometry, name, color })}
                className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors flex flex-col items-center gap-2 border border-white/10"
                title={`Add ${name}`}
              >
                <Icon className="w-6 h-6 text-white/70" />
                <span className="text-xs text-white/90 text-center">{name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="text-xs text-blue-400 font-medium mb-1">
          💡 How to use
        </div>
        <div className="text-xs text-white/60 space-y-1">
          <div>1. Type any text or symbols</div>
          <div>2. Press Enter or click + to create</div>
          <div>3. Click in the scene to place each character</div>
          <div>4. Right-click to cancel placement</div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;