import React, { useState } from 'react';
import { Box, Cherry as Sphere, Cylinder, Cone, Torus, Heart, Star, Type, Trees, Mountain, Flower, Sun, Moon, Cloud, Waves, Zap, Move, RotateCcw, Scale, MousePointer2, Grid3X3, Minus, Plus, X } from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

const Toolbar: React.FC = () => {
  const { 
    addObject, 
    setTransformMode, 
    setEditMode, 
    transformMode, 
    editMode,
    startObjectPlacement
  } = useSceneStore();
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Create heart shape
  const createHeartGeometry = () => {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
    heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.7, x, y + 10);
    heartShape.bezierCurveTo(x + 4, y + 7.7, x + 6, y + 5.5, x + 6, y + 3.5);
    heartShape.bezierCurveTo(x + 6, y + 3.5, x + 6, y, x, y);
    heartShape.bezierCurveTo(x + 4, y, x + 5, y + 5, x + 5, y + 5);

    const extrudeSettings = {
      depth: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    return new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  };

  // Create star shape
  const createStarGeometry = () => {
    const starShape = new THREE.Shape();
    const outerRadius = 2;
    const innerRadius = 1;
    const spikes = 5;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };

    return new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  };

  // Create letter geometry function
  const createLetterGeometry = (letter: string) => {
    const createLetterShape = (char: string) => {
      const shape = new THREE.Shape();
      const size = 1;
      
      switch (char.toLowerCase()) {
        case 'a':
          if (char === 'A') {
            // Uppercase A - triangle with crossbar
            shape.moveTo(0, 0);
            shape.lineTo(size/2, size);
            shape.lineTo(size, 0);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size*0.7, size*0.3);
            shape.lineTo(size*0.3, size*0.3);
            shape.lineTo(size*0.2, 0);
            shape.closePath();
            
            // Create hole for the triangle
            const hole = new THREE.Path();
            hole.moveTo(size*0.35, size*0.45);
            hole.lineTo(size*0.5, size*0.75);
            hole.lineTo(size*0.65, size*0.45);
            hole.closePath();
            shape.holes.push(hole);
          } else {
            // Lowercase a - circle with stem
            shape.moveTo(size*0.7, 0);
            shape.lineTo(size*0.7, size*0.7);
            shape.lineTo(size, size*0.7);
            shape.lineTo(size, 0);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size*0.8, size*0.1);
            shape.quadraticCurveTo(size*0.8, size*0.5, size*0.5, size*0.5);
            shape.quadraticCurveTo(size*0.2, size*0.5, size*0.2, size*0.35);
            shape.quadraticCurveTo(size*0.2, size*0.1, size*0.5, size*0.1);
            shape.quadraticCurveTo(size*0.7, size*0.1, size*0.7, size*0.2);
            shape.closePath();
          }
          break;

        case 'b':
          if (char === 'B') {
            // Uppercase B - two bumps
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.6, size);
            shape.quadraticCurveTo(size*0.9, size, size*0.9, size*0.75);
            shape.quadraticCurveTo(size*0.9, size*0.5, size*0.6, size*0.5);
            shape.quadraticCurveTo(size*0.85, size*0.5, size*0.85, size*0.25);
            shape.quadraticCurveTo(size*0.85, 0, size*0.55, 0);
            shape.closePath();
            
            // Create holes for B
            const hole1 = new THREE.Path();
            hole1.moveTo(size*0.15, size*0.6);
            hole1.lineTo(size*0.15, size*0.85);
            hole1.quadraticCurveTo(size*0.15, size*0.9, size*0.5, size*0.9);
            hole1.quadraticCurveTo(size*0.75, size*0.9, size*0.75, size*0.75);
            hole1.quadraticCurveTo(size*0.75, size*0.6, size*0.5, size*0.6);
            hole1.closePath();
            shape.holes.push(hole1);
            
            const hole2 = new THREE.Path();
            hole2.moveTo(size*0.15, size*0.15);
            hole2.lineTo(size*0.15, size*0.4);
            hole2.lineTo(size*0.5, size*0.4);
            hole2.quadraticCurveTo(size*0.7, size*0.4, size*0.7, size*0.25);
            hole2.quadraticCurveTo(size*0.7, size*0.15, size*0.5, size*0.15);
            hole2.closePath();
            shape.holes.push(hole2);
          } else {
            // Lowercase b - ascender with bump
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.6);
            shape.quadraticCurveTo(size*0.3, size*0.7, size*0.5, size*0.7);
            shape.quadraticCurveTo(size*0.8, size*0.7, size*0.8, size*0.35);
            shape.quadraticCurveTo(size*0.8, 0, size*0.5, 0);
            shape.quadraticCurveTo(size*0.3, 0, size*0.15, size*0.1);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          }
          break;

        case 'c':
          if (char === 'C') {
            // Uppercase C - open circle
            shape.moveTo(size*0.8, size*0.2);
            shape.quadraticCurveTo(size*0.6, 0, size*0.4, 0);
            shape.quadraticCurveTo(0, 0, 0, size*0.5);
            shape.quadraticCurveTo(0, size, size*0.4, size);
            shape.quadraticCurveTo(size*0.6, size, size*0.8, size*0.8);
            shape.lineTo(size*0.9, size*0.9);
            shape.quadraticCurveTo(size*0.6, size*1.1, size*0.4, size*1.1);
            shape.quadraticCurveTo(-size*0.1, size*1.1, -size*0.1, size*0.5);
            shape.quadraticCurveTo(-size*0.1, -size*0.1, size*0.4, -size*0.1);
            shape.quadraticCurveTo(size*0.6, -size*0.1, size*0.9, size*0.1);
            shape.closePath();
          } else {
            // Lowercase c - smaller open circle
            shape.moveTo(size*0.7, size*0.15);
            shape.quadraticCurveTo(size*0.5, 0, size*0.35, 0);
            shape.quadraticCurveTo(size*0.1, 0, size*0.1, size*0.35);
            shape.quadraticCurveTo(size*0.1, size*0.7, size*0.35, size*0.7);
            shape.quadraticCurveTo(size*0.5, size*0.7, size*0.7, size*0.55);
            shape.lineTo(size*0.8, size*0.6);
            shape.quadraticCurveTo(size*0.5, size*0.8, size*0.35, size*0.8);
            shape.quadraticCurveTo(0, size*0.8, 0, size*0.35);
            shape.quadraticCurveTo(0, -size*0.1, size*0.35, -size*0.1);
            shape.quadraticCurveTo(size*0.5, -size*0.1, size*0.8, size*0.05);
            shape.closePath();
          }
          break;

        case 'd':
          if (char === 'D') {
            // Uppercase D - rounded rectangle
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.6, size);
            shape.quadraticCurveTo(size, size, size, size*0.5);
            shape.quadraticCurveTo(size, 0, size*0.6, 0);
            shape.closePath();
            
            // Create hole for D
            const hole = new THREE.Path();
            hole.moveTo(size*0.15, size*0.15);
            hole.lineTo(size*0.15, size*0.85);
            hole.lineTo(size*0.6, size*0.85);
            hole.quadraticCurveTo(size*0.85, size*0.85, size*0.85, size*0.5);
            hole.quadraticCurveTo(size*0.85, size*0.15, size*0.6, size*0.15);
            hole.closePath();
            shape.holes.push(hole);
          } else {
            // Lowercase d - ascender with circle
            shape.moveTo(size*0.7, 0);
            shape.lineTo(size*0.7, size);
            shape.lineTo(size*0.85, size);
            shape.lineTo(size*0.85, 0);
            shape.lineTo(size*0.7, 0);
            shape.lineTo(size*0.7, size*0.1);
            shape.quadraticCurveTo(size*0.5, 0, size*0.35, 0);
            shape.quadraticCurveTo(size*0.1, 0, size*0.1, size*0.35);
            shape.quadraticCurveTo(size*0.1, size*0.7, size*0.35, size*0.7);
            shape.quadraticCurveTo(size*0.5, size*0.7, size*0.7, size*0.6);
            shape.closePath();
          }
          break;

        case 'e':
          if (char === 'E') {
            // Uppercase E - three horizontal lines
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.8, size);
            shape.lineTo(size*0.8, size*0.85);
            shape.lineTo(size*0.15, size*0.85);
            shape.lineTo(size*0.15, size*0.6);
            shape.lineTo(size*0.7, size*0.6);
            shape.lineTo(size*0.7, size*0.45);
            shape.lineTo(size*0.15, size*0.45);
            shape.lineTo(size*0.15, size*0.15);
            shape.lineTo(size*0.8, size*0.15);
            shape.lineTo(size*0.8, 0);
            shape.closePath();
          } else {
            // Lowercase e - circle with horizontal line
            shape.moveTo(size*0.1, size*0.35);
            shape.quadraticCurveTo(size*0.1, 0, size*0.35, 0);
            shape.quadraticCurveTo(size*0.6, 0, size*0.8, size*0.2);
            shape.quadraticCurveTo(size*0.9, size*0.35, size*0.8, size*0.5);
            shape.lineTo(size*0.2, size*0.5);
            shape.quadraticCurveTo(size*0.2, size*0.7, size*0.35, size*0.7);
            shape.quadraticCurveTo(size*0.5, size*0.7, size*0.7, size*0.6);
            shape.lineTo(size*0.8, size*0.7);
            shape.quadraticCurveTo(size*0.6, size*0.8, size*0.35, size*0.8);
            shape.quadraticCurveTo(0, size*0.8, 0, size*0.35);
            shape.quadraticCurveTo(0, -size*0.1, size*0.35, -size*0.1);
            shape.quadraticCurveTo(size*0.7, -size*0.1, size*0.9, size*0.2);
            shape.quadraticCurveTo(size, size*0.4, size*0.8, size*0.4);
            shape.lineTo(size*0.25, size*0.4);
            shape.quadraticCurveTo(size*0.25, size*0.25, size*0.35, size*0.25);
            shape.quadraticCurveTo(size*0.45, size*0.25, size*0.5, size*0.3);
            shape.lineTo(size*0.7, size*0.25);
            shape.quadraticCurveTo(size*0.6, size*0.1, size*0.35, size*0.1);
            shape.quadraticCurveTo(size*0.2, size*0.1, size*0.1, size*0.35);
            shape.closePath();
          }
          break;

        case 'f':
          if (char === 'F') {
            // Uppercase F - E without bottom line
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.8, size);
            shape.lineTo(size*0.8, size*0.85);
            shape.lineTo(size*0.15, size*0.85);
            shape.lineTo(size*0.15, size*0.6);
            shape.lineTo(size*0.7, size*0.6);
            shape.lineTo(size*0.7, size*0.45);
            shape.lineTo(size*0.15, size*0.45);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          } else {
            // Lowercase f - ascender with crossbar
            shape.moveTo(size*0.3, 0);
            shape.lineTo(size*0.3, size*0.5);
            shape.lineTo(size*0.1, size*0.5);
            shape.lineTo(size*0.1, size*0.6);
            shape.lineTo(size*0.3, size*0.6);
            shape.lineTo(size*0.3, size*0.8);
            shape.quadraticCurveTo(size*0.3, size, size*0.5, size);
            shape.quadraticCurveTo(size*0.7, size, size*0.7, size*0.9);
            shape.lineTo(size*0.6, size*0.85);
            shape.quadraticCurveTo(size*0.45, size*0.9, size*0.45, size*0.8);
            shape.lineTo(size*0.45, size*0.6);
            shape.lineTo(size*0.6, size*0.6);
            shape.lineTo(size*0.6, size*0.5);
            shape.lineTo(size*0.45, size*0.5);
            shape.lineTo(size*0.45, 0);
            shape.closePath();
          }
          break;

        case 'g':
          if (char === 'G') {
            // Uppercase G - C with horizontal bar
            shape.moveTo(size*0.8, size*0.2);
            shape.quadraticCurveTo(size*0.6, 0, size*0.4, 0);
            shape.quadraticCurveTo(0, 0, 0, size*0.5);
            shape.quadraticCurveTo(0, size, size*0.4, size);
            shape.quadraticCurveTo(size*0.6, size, size*0.8, size*0.8);
            shape.lineTo(size*0.8, size*0.5);
            shape.lineTo(size*0.5, size*0.5);
            shape.lineTo(size*0.5, size*0.4);
            shape.lineTo(size*0.9, size*0.4);
            shape.lineTo(size*0.9, size*0.9);
            shape.quadraticCurveTo(size*0.6, size*1.1, size*0.4, size*1.1);
            shape.quadraticCurveTo(-size*0.1, size*1.1, -size*0.1, size*0.5);
            shape.quadraticCurveTo(-size*0.1, -size*0.1, size*0.4, -size*0.1);
            shape.quadraticCurveTo(size*0.6, -size*0.1, size*0.9, size*0.1);
            shape.closePath();
          } else {
            // Lowercase g - circle with descender
            shape.moveTo(size*0.1, size*0.35);
            shape.quadraticCurveTo(size*0.1, 0, size*0.35, 0);
            shape.quadraticCurveTo(size*0.6, 0, size*0.8, size*0.2);
            shape.lineTo(size*0.8, size*0.7);
            shape.lineTo(size*0.65, size*0.7);
            shape.lineTo(size*0.65, size*0.6);
            shape.quadraticCurveTo(size*0.5, size*0.7, size*0.35, size*0.7);
            shape.quadraticCurveTo(0, size*0.7, 0, size*0.35);
            shape.quadraticCurveTo(0, -size*0.1, size*0.35, -size*0.1);
            shape.quadraticCurveTo(size*0.5, -size*0.1, size*0.65, 0);
            shape.lineTo(size*0.65, -size*0.2);
            shape.quadraticCurveTo(size*0.65, -size*0.4, size*0.4, -size*0.4);
            shape.lineTo(size*0.2, -size*0.4);
            shape.lineTo(size*0.2, -size*0.3);
            shape.lineTo(size*0.4, -size*0.3);
            shape.quadraticCurveTo(size*0.8, -size*0.3, size*0.8, -size*0.1);
            shape.lineTo(size*0.8, size*0.1);
            shape.quadraticCurveTo(size*0.6, -size*0.1, size*0.35, -size*0.1);
            shape.quadraticCurveTo(size*0.25, -size*0.1, size*0.1, size*0.35);
            shape.closePath();
          }
          break;

        case 'h':
          if (char === 'H') {
            // Uppercase H - two verticals with crossbar
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.6);
            shape.lineTo(size*0.85, size*0.6);
            shape.lineTo(size*0.85, size);
            shape.lineTo(size, size);
            shape.lineTo(size, 0);
            shape.lineTo(size*0.85, 0);
            shape.lineTo(size*0.85, size*0.45);
            shape.lineTo(size*0.15, size*0.45);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          } else {
            // Lowercase h - ascender with arch
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.5);
            shape.quadraticCurveTo(size*0.3, size*0.7, size*0.5, size*0.7);
            shape.quadraticCurveTo(size*0.7, size*0.7, size*0.85, size*0.6);
            shape.lineTo(size*0.85, 0);
            shape.lineTo(size, 0);
            shape.lineTo(size, size*0.6);
            shape.quadraticCurveTo(size, size*0.8, size*0.5, size*0.8);
            shape.quadraticCurveTo(size*0.2, size*0.8, size*0.15, size*0.6);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          }
          break;

        case 'i':
          if (char === 'I') {
            // Uppercase I - vertical with serifs
            shape.moveTo(size*0.2, 0);
            shape.lineTo(size*0.2, size*0.1);
            shape.lineTo(size*0.4, size*0.1);
            shape.lineTo(size*0.4, size*0.9);
            shape.lineTo(size*0.2, size*0.9);
            shape.lineTo(size*0.2, size);
            shape.lineTo(size*0.8, size);
            shape.lineTo(size*0.8, size*0.9);
            shape.lineTo(size*0.6, size*0.9);
            shape.lineTo(size*0.6, size*0.1);
            shape.lineTo(size*0.8, size*0.1);
            shape.lineTo(size*0.8, 0);
            shape.closePath();
          } else {
            // Lowercase i - dot and stem
            shape.moveTo(size*0.3, 0);
            shape.lineTo(size*0.3, size*0.7);
            shape.lineTo(size*0.7, size*0.7);
            shape.lineTo(size*0.7, 0);
            shape.closePath();
            
            // Add dot
            const dot = new THREE.Shape();
            dot.moveTo(size*0.3, size*0.85);
            dot.quadraticCurveTo(size*0.3, size*0.95, size*0.5, size*0.95);
            dot.quadraticCurveTo(size*0.7, size*0.95, size*0.7, size*0.85);
            dot.quadraticCurveTo(size*0.7, size*0.75, size*0.5, size*0.75);
            dot.quadraticCurveTo(size*0.3, size*0.75, size*0.3, size*0.85);
            dot.closePath();
            
            // Combine shapes
            const combinedShape = new THREE.Shape();
            combinedShape.moveTo(size*0.3, 0);
            combinedShape.lineTo(size*0.3, size*0.7);
            combinedShape.lineTo(size*0.7, size*0.7);
            combinedShape.lineTo(size*0.7, 0);
            combinedShape.closePath();
            
            combinedShape.moveTo(size*0.3, size*0.85);
            combinedShape.quadraticCurveTo(size*0.3, size*0.95, size*0.5, size*0.95);
            combinedShape.quadraticCurveTo(size*0.7, size*0.95, size*0.7, size*0.85);
            combinedShape.quadraticCurveTo(size*0.7, size*0.75, size*0.5, size*0.75);
            combinedShape.quadraticCurveTo(size*0.3, size*0.75, size*0.3, size*0.85);
            combinedShape.closePath();
            
            return combinedShape;
          }
          break;

        case 'j':
          if (char === 'J') {
            // Uppercase J - hook shape
            shape.moveTo(size*0.2, size*0.3);
            shape.quadraticCurveTo(size*0.2, 0, size*0.4, 0);
            shape.quadraticCurveTo(size*0.6, 0, size*0.6, size*0.2);
            shape.lineTo(size*0.6, size);
            shape.lineTo(size*0.8, size);
            shape.lineTo(size*0.8, size*0.9);
            shape.lineTo(size*0.4, size*0.9);
            shape.lineTo(size*0.4, size*0.2);
            shape.quadraticCurveTo(size*0.4, size*0.1, size*0.4, size*0.1);
            shape.quadraticCurveTo(size*0.35, size*0.1, size*0.35, size*0.3);
            shape.lineTo(size*0.1, size*0.3);
            shape.quadraticCurveTo(size*0.1, -size*0.1, size*0.4, -size*0.1);
            shape.quadraticCurveTo(size*0.7, -size*0.1, size*0.7, size*0.2);
            shape.lineTo(size*0.7, size);
            shape.lineTo(size*0.9, size);
            shape.lineTo(size*0.9, size*0.2);
            shape.quadraticCurveTo(size*0.9, -size*0.2, size*0.4, -size*0.2);
            shape.quadraticCurveTo(0, -size*0.2, 0, size*0.3);
            shape.closePath();
          } else {
            // Lowercase j - descender with dot
            shape.moveTo(size*0.3, -size*0.3);
            shape.quadraticCurveTo(size*0.1, -size*0.3, size*0.1, -size*0.1);
            shape.lineTo(size*0.2, -size*0.05);
            shape.quadraticCurveTo(size*0.25, -size*0.2, size*0.3, -size*0.2);
            shape.quadraticCurveTo(size*0.4, -size*0.2, size*0.4, -size*0.1);
            shape.lineTo(size*0.4, size*0.7);
            shape.lineTo(size*0.6, size*0.7);
            shape.lineTo(size*0.6, -size*0.1);
            shape.quadraticCurveTo(size*0.6, -size*0.4, size*0.3, -size*0.4);
            shape.quadraticCurveTo(0, -size*0.4, 0, -size*0.1);
            shape.lineTo(size*0.1, 0);
            shape.quadraticCurveTo(size*0.2, -size*0.3, size*0.3, -size*0.3);
            shape.closePath();
            
            // Add dot
            const combinedShape = new THREE.Shape();
            combinedShape.moveTo(size*0.3, -size*0.3);
            combinedShape.quadraticCurveTo(size*0.1, -size*0.3, size*0.1, -size*0.1);
            combinedShape.lineTo(size*0.2, -size*0.05);
            combinedShape.quadraticCurveTo(size*0.25, -size*0.2, size*0.3, -size*0.2);
            combinedShape.quadraticCurveTo(size*0.4, -size*0.2, size*0.4, -size*0.1);
            combinedShape.lineTo(size*0.4, size*0.7);
            combinedShape.lineTo(size*0.6, size*0.7);
            combinedShape.lineTo(size*0.6, -size*0.1);
            combinedShape.quadraticCurveTo(size*0.6, -size*0.4, size*0.3, -size*0.4);
            combinedShape.quadraticCurveTo(0, -size*0.4, 0, -size*0.1);
            combinedShape.lineTo(size*0.1, 0);
            combinedShape.quadraticCurveTo(size*0.2, -size*0.3, size*0.3, -size*0.3);
            combinedShape.closePath();
            
            combinedShape.moveTo(size*0.3, size*0.85);
            combinedShape.quadraticCurveTo(size*0.3, size*0.95, size*0.5, size*0.95);
            combinedShape.quadraticCurveTo(size*0.7, size*0.95, size*0.7, size*0.85);
            combinedShape.quadraticCurveTo(size*0.7, size*0.75, size*0.5, size*0.75);
            combinedShape.quadraticCurveTo(size*0.3, size*0.75, size*0.3, size*0.85);
            combinedShape.closePath();
            
            return combinedShape;
          }
          break;

        case 'k':
          if (char === 'K') {
            // Uppercase K - vertical with diagonals
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.6);
            shape.lineTo(size*0.4, size*0.6);
            shape.lineTo(size*0.7, size);
            shape.lineTo(size*0.9, size);
            shape.lineTo(size*0.5, size*0.5);
            shape.lineTo(size*0.9, 0);
            shape.lineTo(size*0.7, 0);
            shape.lineTo(size*0.4, size*0.4);
            shape.lineTo(size*0.15, size*0.4);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          } else {
            // Lowercase k - ascender with diagonals
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.5);
            shape.lineTo(size*0.35, size*0.5);
            shape.lineTo(size*0.6, size*0.7);
            shape.lineTo(size*0.8, size*0.7);
            shape.lineTo(size*0.45, size*0.4);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.35, size*0.3);
            shape.lineTo(size*0.15, size*0.3);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          }
          break;

        case 'l':
          if (char === 'L') {
            // Uppercase L - vertical with bottom line
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.15);
            shape.lineTo(size*0.8, size*0.15);
            shape.lineTo(size*0.8, 0);
            shape.closePath();
          } else {
            // Lowercase l - simple ascender
            shape.moveTo(size*0.3, 0);
            shape.lineTo(size*0.3, size);
            shape.lineTo(size*0.7, size);
            shape.lineTo(size*0.7, 0);
            shape.closePath();
          }
          break;

        case 'm':
          if (char === 'M') {
            // Uppercase M - double peaks
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.3);
            shape.lineTo(size*0.4, size*0.8);
            shape.lineTo(size*0.5, size*0.8);
            shape.lineTo(size*0.6, size*0.8);
            shape.lineTo(size*0.85, size*0.3);
            shape.lineTo(size*0.85, size);
            shape.lineTo(size, size);
            shape.lineTo(size, 0);
            shape.lineTo(size*0.85, 0);
            shape.lineTo(size*0.85, size*0.15);
            shape.lineTo(size*0.7, size*0.5);
            shape.lineTo(size*0.5, size*0.1);
            shape.lineTo(size*0.3, size*0.5);
            shape.lineTo(size*0.15, size*0.15);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          } else {
            // Lowercase m - triple stroke
            shape.moveTo(0, 0);
            shape.lineTo(0, size*0.7);
            shape.lineTo(size*0.12, size*0.7);
            shape.lineTo(size*0.12, size*0.6);
            shape.quadraticCurveTo(size*0.2, size*0.7, size*0.3, size*0.7);
            shape.quadraticCurveTo(size*0.4, size*0.7, size*0.45, size*0.6);
            shape.quadraticCurveTo(size*0.55, size*0.7, size*0.65, size*0.7);
            shape.quadraticCurveTo(size*0.8, size*0.7, size*0.88, size*0.6);
            shape.lineTo(size*0.88, 0);
            shape.lineTo(size, 0);
            shape.lineTo(size, size*0.6);
            shape.quadraticCurveTo(size, size*0.8, size*0.65, size*0.8);
            shape.quadraticCurveTo(size*0.5, size*0.8, size*0.45, size*0.65);
            shape.quadraticCurveTo(size*0.4, size*0.8, size*0.3, size*0.8);
            shape.quadraticCurveTo(size*0.15, size*0.8, size*0.12, size*0.65);
            shape.lineTo(size*0.12, 0);
            shape.closePath();
          }
          break;

        case 'n':
          if (char === 'N') {
            // Uppercase N - diagonal connector
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.3);
            shape.lineTo(size*0.7, size*0.9);
            shape.lineTo(size*0.85, size*0.9);
            shape.lineTo(size*0.85, 0);
            shape.lineTo(size, 0);
            shape.lineTo(size, size);
            shape.lineTo(size*0.85, size);
            shape.lineTo(size*0.85, size*0.7);
            shape.lineTo(size*0.3, size*0.1);
            shape.lineTo(size*0.15, size*0.1);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          } else {
            // Lowercase n - simple arch
            shape.moveTo(0, 0);
            shape.lineTo(0, size*0.7);
            shape.lineTo(size*0.15, size*0.7);
            shape.lineTo(size*0.15, size*0.6);
            shape.quadraticCurveTo(size*0.3, size*0.8, size*0.5, size*0.8);
            shape.quadraticCurveTo(size*0.7, size*0.8, size*0.85, size*0.65);
            shape.lineTo(size*0.85, 0);
            shape.lineTo(size, 0);
            shape.lineTo(size, size*0.65);
            shape.quadraticCurveTo(size, size*0.7, size*0.5, size*0.7);
            shape.quadraticCurveTo(size*0.3, size*0.7, size*0.15, size*0.55);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          }
          break;

        case 'o':
          if (char === 'O') {
            // Uppercase O - circle
            shape.moveTo(size*0.5, 0);
            shape.quadraticCurveTo(0, 0, 0, size*0.5);
            shape.quadraticCurveTo(0, size, size*0.5, size);
            shape.quadraticCurveTo(size, size, size, size*0.5);
            shape.quadraticCurveTo(size, 0, size*0.5, 0);
            shape.closePath();
            
            // Create hole for O
            const hole = new THREE.Path();
            hole.moveTo(size*0.5, size*0.15);
            hole.quadraticCurveTo(size*0.15, size*0.15, size*0.15, size*0.5);
            hole.quadraticCurveTo(size*0.15, size*0.85, size*0.5, size*0.85);
            hole.quadraticCurveTo(size*0.85, size*0.85, size*0.85, size*0.5);
            hole.quadraticCurveTo(size*0.85, size*0.15, size*0.5, size*0.15);
            hole.closePath();
            shape.holes.push(hole);
          } else {
            // Lowercase o - smaller circle
            shape.moveTo(size*0.35, 0);
            shape.quadraticCurveTo(size*0.1, 0, size*0.1, size*0.35);
            shape.quadraticCurveTo(size*0.1, size*0.7, size*0.35, size*0.7);
            shape.quadraticCurveTo(size*0.6, size*0.7, size*0.6, size*0.35);
            shape.quadraticCurveTo(size*0.6, 0, size*0.35, 0);
            shape.closePath();
            
            // Create hole for o
            const hole = new THREE.Path();
            hole.moveTo(size*0.35, size*0.15);
            hole.quadraticCurveTo(size*0.25, size*0.15, size*0.25, size*0.35);
            hole.quadraticCurveTo(size*0.25, size*0.55, size*0.35, size*0.55);
            hole.quadraticCurveTo(size*0.45, size*0.55, size*0.45, size*0.35);
            hole.quadraticCurveTo(size*0.45, size*0.15, size*0.35, size*0.15);
            hole.closePath();
            shape.holes.push(hole);
          }
          break;

        case 'p':
          if (char === 'P') {
            // Uppercase P - top bump only
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.6, size);
            shape.quadraticCurveTo(size*0.9, size, size*0.9, size*0.75);
            shape.quadraticCurveTo(size*0.9, size*0.5, size*0.6, size*0.5);
            shape.lineTo(size*0.15, size*0.5);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
            
            // Create hole for P
            const hole = new THREE.Path();
            hole.moveTo(size*0.15, size*0.6);
            hole.lineTo(size*0.15, size*0.85);
            hole.lineTo(size*0.6, size*0.85);
            hole.quadraticCurveTo(size*0.75, size*0.85, size*0.75, size*0.75);
            hole.quadraticCurveTo(size*0.75, size*0.6, size*0.6, size*0.6);
            hole.closePath();
            shape.holes.push(hole);
          } else {
            // Lowercase p - descender with bump
            shape.moveTo(0, -size*0.3);
            shape.lineTo(0, size*0.7);
            shape.lineTo(size*0.15, size*0.7);
            shape.lineTo(size*0.15, size*0.6);
            shape.quadraticCurveTo(size*0.3, size*0.7, size*0.5, size*0.7);
            shape.quadraticCurveTo(size*0.8, size*0.7, size*0.8, size*0.35);
            shape.quadraticCurveTo(size*0.8, 0, size*0.5, 0);
            shape.quadraticCurveTo(size*0.3, 0, size*0.15, size*0.1);
            shape.lineTo(size*0.15, -size*0.3);
            shape.closePath();
          }
          break;

        case 'q':
          if (char === 'Q') {
            // Uppercase Q - O with tail
            shape.moveTo(size*0.5, 0);
            shape.quadraticCurveTo(0, 0, 0, size*0.5);
            shape.quadraticCurveTo(0, size, size*0.5, size);
            shape.quadraticCurveTo(size, size, size, size*0.5);
            shape.quadraticCurveTo(size, 0, size*0.5, 0);
            shape.closePath();
            
            // Add tail
            shape.moveTo(size*0.6, size*0.2);
            shape.lineTo(size*0.9, -size*0.1);
            shape.lineTo(size*1.1, size*0.1);
            shape.lineTo(size*0.8, size*0.4);
            shape.closePath();
            
            // Create hole for Q
            const hole = new THREE.Path();
            hole.moveTo(size*0.5, size*0.15);
            hole.quadraticCurveTo(size*0.15, size*0.15, size*0.15, size*0.5);
            hole.quadraticCurveTo(size*0.15, size*0.85, size*0.5, size*0.85);
            hole.quadraticCurveTo(size*0.85, size*0.85, size*0.85, size*0.5);
            hole.quadraticCurveTo(size*0.85, size*0.15, size*0.5, size*0.15);
            hole.closePath();
            shape.holes.push(hole);
          } else {
            // Lowercase q - descender version
            shape.moveTo(size*0.7, -size*0.3);
            shape.lineTo(size*0.7, size*0.7);
            shape.lineTo(size*0.55, size*0.7);
            shape.lineTo(size*0.55, size*0.6);
            shape.quadraticCurveTo(size*0.4, size*0.7, size*0.25, size*0.7);
            shape.quadraticCurveTo(0, size*0.7, 0, size*0.35);
            shape.quadraticCurveTo(0, 0, size*0.25, 0);
            shape.quadraticCurveTo(size*0.4, 0, size*0.55, size*0.1);
            shape.lineTo(size*0.55, -size*0.3);
            shape.closePath();
          }
          break;

        case 'r':
          if (char === 'R') {
            // Uppercase R - P with leg
            shape.moveTo(0, 0);
            shape.lineTo(0, size);
            shape.lineTo(size*0.6, size);
            shape.quadraticCurveTo(size*0.9, size, size*0.9, size*0.75);
            shape.quadraticCurveTo(size*0.9, size*0.5, size*0.6, size*0.5);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.45, size*0.4);
            shape.lineTo(size*0.15, size*0.4);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
            
            // Create hole for R
            const hole = new THREE.Path();
            hole.moveTo(size*0.15, size*0.55);
            hole.lineTo(size*0.15, size*0.85);
            hole.lineTo(size*0.6, size*0.85);
            hole.quadraticCurveTo(size*0.75, size*0.85, size*0.75, size*0.7);
            hole.quadraticCurveTo(size*0.75, size*0.55, size*0.6, size*0.55);
            hole.closePath();
            shape.holes.push(hole);
          } else {
            // Lowercase r - simple hook
            shape.moveTo(0, 0);
            shape.lineTo(0, size*0.7);
            shape.lineTo(size*0.15, size*0.7);
            shape.lineTo(size*0.15, size*0.55);
            shape.quadraticCurveTo(size*0.25, size*0.7, size*0.4, size*0.7);
            shape.quadraticCurveTo(size*0.6, size*0.7, size*0.7, size*0.6);
            shape.lineTo(size*0.8, size*0.7);
            shape.quadraticCurveTo(size*0.6, size*0.8, size*0.4, size*0.8);
            shape.quadraticCurveTo(size*0.2, size*0.8, size*0.15, size*0.65);
            shape.lineTo(size*0.15, 0);
            shape.closePath();
          }
          break;

        case 's':
          if (char === 'S') {
            // Uppercase S - snake curve
            shape.moveTo(size*0.8, size*0.2);
            shape.quadraticCurveTo(size*0.6, 0, size*0.4, 0);
            shape.quadraticCurveTo(size*0.1, 0, size*0.1, size*0.2);
            shape.quadraticCurveTo(size*0.1, size*0.4, size*0.3, size*0.45);
            shape.lineTo(size*0.7, size*0.55);
            shape.quadraticCurveTo(size*0.9, size*0.6, size*0.9, size*0.8);
            shape.quadraticCurveTo(size*0.9, size, size*0.6, size);
            shape.quadraticCurveTo(size*0.4, size, size*0.2, size*0.8);
            shape.lineTo(size*0.3, size*0.7);
            shape.quadraticCurveTo(size*0.4, size*0.85, size*0.6, size*0.85);
            shape.quadraticCurveTo(size*0.75, size*0.85, size*0.75, size*0.8);
            shape.quadraticCurveTo(size*0.75, size*0.7, size*0.6, size*0.65);
            shape.lineTo(size*0.4, size*0.55);
            shape.quadraticCurveTo(size*0.25, size*0.5, size*0.25, size*0.2);
            shape.quadraticCurveTo(size*0.25, -size*0.15, size*0.4, -size*0.15);
            shape.quadraticCurveTo(size*0.6, -size*0.15, size*0.7, size*0.05);
            shape.lineTo(size*0.6, size*0.15);
            shape.quadraticCurveTo(size*0.5, size*0.1, size*0.4, size*0.1);
            shape.quadraticCurveTo(size*0.3, size*0.1, size*0.3, size*0.2);
            shape.quadraticCurveTo(size*0.3, size*0.3, size*0.4, size*0.35);
            shape.lineTo(size*0.6, size*0.45);
            shape.quadraticCurveTo(size*0.8, size*0.5, size*0.8, size*0.2);
            shape.closePath();
          } else {
            // Lowercase s - smaller S-curve
            shape.moveTo(size*0.7, size*0.15);
            shape.quadraticCurveTo(size*0.5, 0, size*0.35, 0);
            shape.quadraticCurveTo(size*0.1, 0, size*0.1, size*0.15);
            shape.quadraticCurveTo(size*0.1, size*0.3, size*0.25, size*0.35);
            shape.lineTo(size*0.45, size*0.4);
            shape.quadraticCurveTo(size*0.6, size*0.45, size*0.6, size*0.55);
            shape.quadraticCurveTo(size*0.6, size*0.7, size*0.35, size*0.7);
            shape.quadraticCurveTo(size*0.2, size*0.7, size*0.1, size*0.6);
            shape.lineTo(size*0.15, size*0.5);
            shape.quadraticCurveTo(size*0.25, size*0.6, size*0.35, size*0.6);
            shape.quadraticCurveTo(size*0.45, size*0.6, size*0.45, size*0.55);
            shape.quadraticCurveTo(size*0.45, size*0.45, size*0.35, size*0.4);
            shape.lineTo(size*0.25, size*0.35);
            shape.quadraticCurveTo(size*0.05, size*0.3, size*0.05, size*0.15);
            shape.quadraticCurveTo(size*0.05, -size*0.1, size*0.35, -size*0.1);
            shape.quadraticCurveTo(size*0.55, -size*0.1, size*0.75, size*0.05);
            shape.lineTo(size*0.7, size*0.15);
            shape.closePath();
          }
          break;

        case 't':
          if (char === 'T') {
            // Uppercase T - cross-top
            shape.moveTo(0, size*0.85);
            shape.lineTo(0, size);
            shape.lineTo(size, size);
            shape.lineTo(size, size*0.85);
            shape.lineTo(size*0.6, size*0.85);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.4, 0);
            shape.lineTo(size*0.4, size*0.85);
            shape.closePath();
          } else {
            // Lowercase t - simple cross
            shape.moveTo(size*0.3, 0);
            shape.lineTo(size*0.3, size*0.5);
            shape.lineTo(size*0.1, size*0.5);
            shape.lineTo(size*0.1, size*0.6);
            shape.lineTo(size*0.3, size*0.6);
            shape.lineTo(size*0.3, size*0.8);
            shape.quadraticCurveTo(size*0.3, size*0.9, size*0.4, size*0.9);
            shape.quadraticCurveTo(size*0.5, size*0.9, size*0.6, size*0.85);
            shape.lineTo(size*0.65, size*0.95);
            shape.quadraticCurveTo(size*0.5, size, size*0.4, size);
            shape.quadraticCurveTo(size*0.2, size, size*0.2, size*0.8);
            shape.lineTo(size*0.2, size*0.6);
            shape.lineTo(size*0.7, size*0.6);
            shape.lineTo(size*0.7, size*0.5);
            shape.lineTo(size*0.2, size*0.5);
            shape.lineTo(size*0.2, 0);
            shape.closePath();
          }
          break;

        case 'u':
          if (char === 'U') {
            // Uppercase U - curved bottom
            shape.moveTo(0, size*0.3);
            shape.lineTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.15, size*0.3);
            shape.quadraticCurveTo(size*0.15, size*0.1, size*0.5, size*0.1);
            shape.quadraticCurveTo(size*0.85, size*0.1, size*0.85, size*0.3);
            shape.lineTo(size*0.85, size);
            shape.lineTo(size, size);
            shape.lineTo(size, size*0.3);
            shape.quadraticCurveTo(size, 0, size*0.5, 0);
            shape.quadraticCurveTo(0, 0, 0, size*0.3);
            shape.closePath();
          } else {
            // Lowercase u - arch shape
            shape.moveTo(0, size*0.3);
            shape.lineTo(0, size*0.7);
            shape.lineTo(size*0.15, size*0.7);
            shape.lineTo(size*0.15, size*0.3);
            shape.quadraticCurveTo(size*0.15, size*0.1, size*0.35, size*0.1);
            shape.quadraticCurveTo(size*0.55, size*0.1, size*0.7, size*0.2);
            shape.lineTo(size*0.7, size*0.7);
            shape.lineTo(size*0.85, size*0.7);
            shape.lineTo(size*0.85, size*0.2);
            shape.quadraticCurveTo(size*0.85, 0, size*0.35, 0);
            shape.quadraticCurveTo(0, 0, 0, size*0.3);
            shape.closePath();
          }
          break;

        case 'v':
          if (char === 'V') {
            // Uppercase V - pointed bottom
            shape.moveTo(0, size);
            shape.lineTo(size*0.15, size);
            shape.lineTo(size*0.5, size*0.2);
            shape.lineTo(size*0.85, size);
            shape.lineTo(size, size);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.4, 0);
            shape.closePath();
          } else {
            // Lowercase v - smaller V
            shape.moveTo(size*0.1, size*0.7);
            shape.lineTo(size*0.25, size*0.7);
            shape.lineTo(size*0.5, size*0.1);
            shape.lineTo(size*0.75, size*0.7);
            shape.lineTo(size*0.9, size*0.7);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.4, 0);
            shape.closePath();
          }
          break;

        case 'w':
          if (char === 'W') {
            // Uppercase W - double V
            shape.moveTo(0, size);
            shape.lineTo(size*0.1, size);
            shape.lineTo(size*0.25, size*0.2);
            shape.lineTo(size*0.4, size*0.7);
            shape.lineTo(size*0.5, size*0.7);
            shape.lineTo(size*0.6, size*0.7);
            shape.lineTo(size*0.75, size*0.2);
            shape.lineTo(size*0.9, size);
            shape.lineTo(size, size);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size*0.65, 0);
            shape.lineTo(size*0.5, size*0.5);
            shape.lineTo(size*0.35, 0);
            shape.lineTo(size*0.2, 0);
            shape.closePath();
          } else {
            // Lowercase w - triple stroke
            shape.moveTo(size*0.05, size*0.7);
            shape.lineTo(size*0.15, size*0.7);
            shape.lineTo(size*0.25, size*0.1);
            shape.lineTo(size*0.35, size*0.5);
            shape.lineTo(size*0.45, size*0.5);
            shape.lineTo(size*0.5, size*0.1);
            shape.lineTo(size*0.55, size*0.5);
            shape.lineTo(size*0.65, size*0.5);
            shape.lineTo(size*0.75, size*0.1);
            shape.lineTo(size*0.85, size*0.7);
            shape.lineTo(size*0.95, size*0.7);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size*0.7, 0);
            shape.lineTo(size*0.6, size*0.4);
            shape.lineTo(size*0.5, 0);
            shape.lineTo(size*0.4, 0);
            shape.lineTo(size*0.3, size*0.4);
            shape.lineTo(size*0.2, 0);
            shape.lineTo(size*0.1, 0);
            shape.closePath();
          }
          break;

        case 'x':
          if (char === 'X') {
            // Uppercase X - crossed diagonals
            shape.moveTo(0, 0);
            shape.lineTo(size*0.2, 0);
            shape.lineTo(size*0.5, size*0.3);
            shape.lineTo(size*0.8, 0);
            shape.lineTo(size, 0);
            shape.lineTo(size*0.6, size*0.5);
            shape.lineTo(size, size);
            shape.lineTo(size*0.8, size);
            shape.lineTo(size*0.5, size*0.7);
            shape.lineTo(size*0.2, size);
            shape.lineTo(0, size);
            shape.lineTo(size*0.4, size*0.5);
            shape.closePath();
          } else {
            // Lowercase x - smaller cross
            shape.moveTo(size*0.1, 0);
            shape.lineTo(size*0.25, 0);
            shape.lineTo(size*0.5, size*0.25);
            shape.lineTo(size*0.75, 0);
            shape.lineTo(size*0.9, 0);
            shape.lineTo(size*0.6, size*0.35);
            shape.lineTo(size*0.9, size*0.7);
            shape.lineTo(size*0.75, size*0.7);
            shape.lineTo(size*0.5, size*0.45);
            shape.lineTo(size*0.25, size*0.7);
            shape.lineTo(size*0.1, size*0.7);
            shape.lineTo(size*0.4, size*0.35);
            shape.closePath();
          }
          break;

        case 'y':
          if (char === 'Y') {
            // Uppercase Y - forked top
            shape.moveTo(0, size);
            shape.lineTo(size*0.2, size);
            shape.lineTo(size*0.5, size*0.6);
            shape.lineTo(size*0.8, size);
            shape.lineTo(size, size);
            shape.lineTo(size*0.6, size*0.4);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.4, 0);
            shape.lineTo(size*0.4, size*0.4);
            shape.closePath();
          } else {
            // Lowercase y - descender fork
            shape.moveTo(size*0.1, size*0.7);
            shape.lineTo(size*0.25, size*0.7);
            shape.lineTo(size*0.5, size*0.2);
            shape.lineTo(size*0.75, size*0.7);
            shape.lineTo(size*0.9, size*0.7);
            shape.lineTo(size*0.6, 0);
            shape.lineTo(size*0.5, -size*0.2);
            shape.quadraticCurveTo(size*0.4, -size*0.3, size*0.3, -size*0.3);
            shape.lineTo(size*0.2, -size*0.3);
            shape.lineTo(size*0.2, -size*0.2);
            shape.lineTo(size*0.3, -size*0.2);
            shape.quadraticCurveTo(size*0.35, -size*0.2, size*0.4, -size*0.1);
            shape.lineTo(size*0.4, 0);
            shape.closePath();
          }
          break;

        case 'z':
          if (char === 'Z') {
            // Uppercase Z - diagonal stripe
            shape.moveTo(0, 0);
            shape.lineTo(0, size*0.15);
            shape.lineTo(size*0.7, size*0.85);
            shape.lineTo(0, size*0.85);
            shape.lineTo(0, size);
            shape.lineTo(size, size);
            shape.lineTo(size, size*0.85);
            shape.lineTo(size*0.3, size*0.15);
            shape.lineTo(size, size*0.15);
            shape.lineTo(size, 0);
            shape.closePath();
          } else {
            // Lowercase z - smaller stripe
            shape.moveTo(size*0.1, 0);
            shape.lineTo(size*0.1, size*0.1);
            shape.lineTo(size*0.6, size*0.6);
            shape.lineTo(size*0.1, size*0.6);
            shape.lineTo(size*0.1, size*0.7);
            shape.lineTo(size*0.9, size*0.7);
            shape.lineTo(size*0.9, size*0.6);
            shape.lineTo(size*0.4, size*0.1);
            shape.lineTo(size*0.9, size*0.1);
            shape.lineTo(size*0.9, 0);
            shape.closePath();
          }
          break;

        case ' ':
          // Space character - return empty shape
          return new THREE.Shape();

        default:
          // Fallback for unsupported characters - simple rectangle
          shape.moveTo(0, 0);
          shape.lineTo(size*0.8, 0);
          shape.lineTo(size*0.8, size);
          shape.lineTo(0, size);
          shape.closePath();
          break;
      }
      
      return shape;
    };

    const letterShape = createLetterShape(letter);
    
    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };

    return new THREE.ExtrudeGeometry(letterShape, extrudeSettings);
  };

  // Create 3D text from input string
  const create3DText = (text: string) => {
    const group = new THREE.Group();
    let xOffset = 0;
    const letterSpacing = 1.2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === ' ') {
        xOffset += letterSpacing * 0.5; // Space width
        continue;
      }

      const letterGeometry = createLetterGeometry(char);
      const letterMaterial = new THREE.MeshStandardMaterial({ color: '#4f46e5' });
      const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
      
      // Position letter
      letterMesh.position.x = xOffset;
      
      // Adjust height for lowercase letters
      if (char !== char.toUpperCase() && char.match(/[a-z]/)) {
        letterMesh.position.y = -0.3; // Lower baseline for lowercase
        letterMesh.scale.setScalar(0.7); // Smaller size for lowercase
      }
      
      group.add(letterMesh);
      xOffset += letterSpacing;
    }

    // Center the text group
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.x = -center.x;

    return group;
  };

  // Create tree geometry
  const createTreeGeometry = () => {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    group.add(trunk);
    
    // Leaves (cone)
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3.5;
    group.add(leaves);
    
    return group;
  };

  // Create rock geometry
  const createRockGeometry = () => {
    const geometry = new THREE.DodecahedronGeometry(1);
    // Add some randomness to vertices for more natural look
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setX(i, positions.getX(i) + (Math.random() - 0.5) * 0.3);
      positions.setY(i, positions.getY(i) + (Math.random() - 0.5) * 0.3);
      positions.setZ(i, positions.getZ(i) + (Math.random() - 0.5) * 0.3);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const basicShapes = [
    {
      name: 'Cube',
      icon: Box,
      geometry: () => new THREE.BoxGeometry(1, 1, 1),
      color: '#44aa88'
    },
    {
      name: 'Sphere',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
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
      name: 'Torus',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      ),
      geometry: () => new THREE.TorusGeometry(0.7, 0.2, 16, 100),
      color: '#aa8844'
    },
    {
      name: 'Heart',
      icon: Heart,
      geometry: createHeartGeometry,
      color: '#ff6b6b'
    },
    {
      name: 'Star',
      icon: Star,
      geometry: createStarGeometry,
      color: '#ffd93d'
    }
  ];

  const natureObjects = [
    {
      name: 'Pine Tree',
      icon: Trees,
      geometry: createTreeGeometry,
      color: '#228B22'
    },
    {
      name: 'Oak Tree',
      icon: Trees,
      geometry: () => {
        const group = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.25;
        group.add(trunk);
        
        // Crown (sphere)
        const crownGeometry = new THREE.SphereGeometry(2, 16, 8);
        const crownMaterial = new THREE.MeshStandardMaterial({ color: '#32CD32' });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 3.5;
        group.add(crown);
        
        return group;
      },
      color: '#32CD32'
    },
    {
      name: 'Boulder',
      icon: Mountain,
      geometry: createRockGeometry,
      color: '#696969'
    },
    {
      name: 'Small Rock',
      icon: Mountain,
      geometry: () => {
        const geometry = createRockGeometry();
        geometry.scale(0.5, 0.3, 0.5);
        return geometry;
      },
      color: '#808080'
    },
    {
      name: 'Flower',
      icon: Flower,
      geometry: () => {
        const group = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        group.add(stem);
        
        // Petals
        for (let i = 0; i < 6; i++) {
          const petalGeometry = new THREE.SphereGeometry(0.1, 8, 4);
          const petalMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });
          const petal = new THREE.Mesh(petalGeometry, petalMaterial);
          const angle = (i / 6) * Math.PI * 2;
          petal.position.x = Math.cos(angle) * 0.15;
          petal.position.z = Math.sin(angle) * 0.15;
          petal.position.y = 0.8;
          petal.scale.set(1, 0.5, 0.3);
          group.add(petal);
        }
        
        // Center
        const centerGeometry = new THREE.SphereGeometry(0.05, 8, 4);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.8;
        group.add(center);
        
        return group;
      },
      color: '#FF69B4'
    },
    {
      name: 'Grass Patch',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M2 22h20"/>
          <path d="M3 22V12a9 9 0 0 1 18 0v10"/>
        </svg>
      ),
      geometry: () => {
        const group = new THREE.Group();
        
        // Create multiple grass blades
        for (let i = 0; i < 20; i++) {
          const bladeGeometry = new THREE.CylinderGeometry(0.01, 0.02, 0.5, 4);
          const bladeMaterial = new THREE.MeshStandardMaterial({ color: '#90EE90' });
          const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
          
          blade.position.x = (Math.random() - 0.5) * 1;
          blade.position.z = (Math.random() - 0.5) * 1;
          blade.position.y = 0.25;
          blade.rotation.z = (Math.random() - 0.5) * 0.3;
          
          group.add(blade);
        }
        
        return group;
      },
      color: '#90EE90'
    }
  ];

  const celestialObjects = [
    {
      name: 'Sun',
      icon: Sun,
      geometry: () => {
        const group = new THREE.Group();
        
        // Main sphere
        const sunGeometry = new THREE.SphereGeometry(1, 32, 16);
        const sunMaterial = new THREE.MeshStandardMaterial({ 
          color: '#FFD700',
          emissive: '#FFA500',
          emissiveIntensity: 0.3
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        group.add(sun);
        
        // Rays
        for (let i = 0; i < 8; i++) {
          const rayGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 4);
          const rayMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700' });
          const ray = new THREE.Mesh(rayGeometry, rayMaterial);
          
          const angle = (i / 8) * Math.PI * 2;
          ray.position.x = Math.cos(angle) * 1.3;
          ray.position.z = Math.sin(angle) * 1.3;
          ray.rotation.z = angle + Math.PI / 2;
          
          group.add(ray);
        }
        
        return group;
      },
      color: '#FFD700'
    },
    {
      name: 'Moon',
      icon: Moon,
      geometry: () => {
        const geometry = new THREE.SphereGeometry(0.8, 32, 16);
        // Add some craters
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          if (Math.random() < 0.1) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const length = Math.sqrt(x*x + y*y + z*z);
            positions.setXYZ(i, x * 0.95, y * 0.95, z * 0.95);
          }
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#C0C0C0'
    },
    {
      name: 'Cloud',
      icon: Cloud,
      geometry: () => {
        const group = new THREE.Group();
        
        // Create cloud from multiple spheres
        const cloudPositions = [
          { x: 0, y: 0, z: 0, scale: 1 },
          { x: 0.7, y: 0.2, z: 0, scale: 0.8 },
          { x: -0.7, y: 0.1, z: 0, scale: 0.9 },
          { x: 0.3, y: 0.5, z: 0, scale: 0.6 },
          { x: -0.3, y: 0.4, z: 0, scale: 0.7 }
        ];
        
        cloudPositions.forEach(pos => {
          const sphereGeometry = new THREE.SphereGeometry(0.5 * pos.scale, 16, 8);
          const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#F0F8FF' });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.set(pos.x, pos.y, pos.z);
          group.add(sphere);
        });
        
        return group;
      },
      color: '#F0F8FF'
    },
    {
      name: 'Lightning',
      icon: Zap,
      geometry: () => {
        const shape = new THREE.Shape();
        
        // Create lightning bolt shape
        shape.moveTo(0, 1);
        shape.lineTo(0.3, 0.5);
        shape.lineTo(0.1, 0.5);
        shape.lineTo(0.4, -0.5);
        shape.lineTo(0.2, -0.5);
        shape.lineTo(0.5, -1);
        shape.lineTo(0.2, -0.3);
        shape.lineTo(0.3, -0.3);
        shape.lineTo(-0.1, 0.3);
        shape.lineTo(0.1, 0.3);
        shape.closePath();
        
        const extrudeSettings = {
          depth: 0.1,
          bevelEnabled: false
        };
        
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
      },
      color: '#FFD700'
    },
    {
      name: 'Water Wave',
      icon: Waves,
      geometry: () => {
        const geometry = new THREE.PlaneGeometry(3, 1, 32, 8);
        const positions = geometry.attributes.position;
        
        // Create wave pattern
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const wave = Math.sin(x * 2) * 0.1;
          positions.setZ(i, wave);
        }
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        return geometry;
      },
      color: '#4169E1'
    }
  ];

  const categories = [
    { name: 'Basic Shapes', items: basicShapes },
    { name: '3D Text', items: [], isText: true },
    { name: 'Nature', items: natureObjects },
    { name: 'Celestial', items: celestialObjects }
  ];

  const transformTools = [
    {
      name: 'Select',
      icon: MousePointer2,
      mode: null,
      active: transformMode === null
    },
    {
      name: 'Move',
      icon: Move,
      mode: 'translate' as const,
      active: transformMode === 'translate'
    },
    {
      name: 'Rotate',
      icon: RotateCcw,
      mode: 'rotate' as const,
      active: transformMode === 'rotate'
    },
    {
      name: 'Scale',
      icon: Scale,
      mode: 'scale' as const,
      active: transformMode === 'scale'
    }
  ];

  const editTools = [
    {
      name: 'Edit Vertices',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <circle cx="6" cy="6" r="2"/>
          <circle cx="18" cy="6" r="2"/>
          <circle cx="18" cy="18" r="2"/>
          <circle cx="6" cy="18" r="2"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      mode: 'vertex' as const,
      active: editMode === 'vertex'
    },
    {
      name: 'Edit Edges',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M6 6L18 6"/>
          <path d="M18 6L18 18"/>
          <path d="M18 18L6 18"/>
          <path d="M6 18L6 6"/>
          <path d="M6 6L18 18"/>
          <path d="M18 6L6 18"/>
        </svg>
      ),
      mode: 'edge' as const,
      active: editMode === 'edge'
    }
  ];

  const handleObjectClick = (item: any) => {
    startObjectPlacement({
      geometry: item.geometry,
      name: item.name,
      color: item.color
    });
    setActiveCategory(null);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      startObjectPlacement({
        geometry: () => create3DText(textInput.trim()),
        name: `Text: ${textInput.trim()}`,
        color: '#4f46e5'
      });
      setTextInput('');
      setShowTextInput(false);
      setActiveCategory(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setShowTextInput(false);
      setTextInput('');
      setActiveCategory(null);
    }
  };

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/20 p-3 border border-white/5 z-10">
      <div className="flex flex-col gap-2">
        {/* Transform Tools */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
            Transform
          </div>
          {transformTools.map(({ name, icon: Icon, mode, active }) => (
            <button
              key={name}
              onClick={() => setTransformMode(mode)}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                active
                  ? 'bg-blue-500/20 text-blue-400 scale-105'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
              title={name}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                {name}
              </div>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/10 my-1" />

        {/* Edit Tools */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
            Edit
          </div>
          {editTools.map(({ name, icon: Icon, mode, active }) => (
            <button
              key={name}
              onClick={() => setEditMode(active ? null : mode)}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                active
                  ? 'bg-green-500/20 text-green-400 scale-105'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
              title={name}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                {name}
              </div>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/10 my-1" />

        {/* 3D Objects */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-white/50 uppercase tracking-wider px-2 py-1">
            3D Objects
          </div>
          {categories.map((category) => (
            <div key={category.name} className="relative">
              <button
                onClick={() => {
                  if (category.isText) {
                    setShowTextInput(!showTextInput);
                    setActiveCategory(showTextInput ? null : category.name);
                  } else {
                    setActiveCategory(activeCategory === category.name ? null : category.name);
                  }
                }}
                className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center group relative ${
                  activeCategory === category.name
                    ? 'bg-purple-500/20 text-purple-400 scale-105'
                    : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
                }`}
                title={category.name}
              >
                {category.isText ? (
                  <Type className="w-5 h-5" />
                ) : category.name === 'Basic Shapes' ? (
                  <Grid3X3 className="w-5 h-5" />
                ) : category.name === 'Nature' ? (
                  <Trees className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                  {category.name}
                </div>
              </button>

              {/* Text Input Modal */}
              {category.isText && showTextInput && (
                <div className="absolute left-full ml-2 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg p-4 min-w-64 z-30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/90">Create 3D Text</h3>
                    <button
                      onClick={() => {
                        setShowTextInput(false);
                        setActiveCategory(null);
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-2">
                        Enter text to convert to 3D:
                      </label>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your text here..."
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50"
                        autoFocus
                      />
                    </div>
                    
                    <div className="text-xs text-white/60">
                      <p className="mb-1">✨ Features:</p>
                      <ul className="space-y-0.5 text-white/50">
                        <li>• Complete A-Z alphabet support</li>
                        <li>• Uppercase and lowercase letters</li>
                        <li>• Authentic letter shapes</li>
                        <li>• Professional 3D extrusion</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleTextSubmit}
                        disabled={!textInput.trim()}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                      >
                        Create 3D Text
                      </button>
                      <button
                        onClick={() => {
                          setShowTextInput(false);
                          setTextInput('');
                          setActiveCategory(null);
                        }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Items */}
              {activeCategory === category.name && !category.isText && (
                <div className="absolute left-full ml-2 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg p-2 min-w-48 z-30">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h3 className="text-sm font-medium text-white/90">{category.name}</h3>
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {category.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleObjectClick(item)}
                        className="p-3 rounded-lg hover:bg-white/5 transition-colors flex flex-col items-center gap-2 group"
                        title={item.name}
                      >
                        <div className="text-white/70 group-hover:text-white transition-colors">
                          {typeof item.icon === 'function' ? (
                            <item.icon />
                          ) : (
                            <item.icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors text-center">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;