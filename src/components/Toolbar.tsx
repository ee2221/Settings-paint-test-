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
  const [textInput, setTextInput] = useState('HELLO');
  const [showTextInput, setShowTextInput] = useState(false);

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

  // Function to create accurate letter shapes
  const createLetterShape = (char: string): THREE.Shape => {
    const shape = new THREE.Shape();
    const width = 1;
    const height = 1.4;
    
    switch (char.toUpperCase()) {
      case 'A':
        // Create letter A
        shape.moveTo(0.1, 0);
        shape.lineTo(0.4, 0);
        shape.lineTo(0.45, 0.3);
        shape.lineTo(0.55, 0.3);
        shape.lineTo(0.6, 0);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.6, height);
        shape.lineTo(0.4, height);
        shape.lineTo(0.1, 0);
        
        // Create the hole (crossbar area)
        const holeA = new THREE.Path();
        holeA.moveTo(0.35, 0.4);
        holeA.lineTo(0.65, 0.4);
        holeA.lineTo(0.6, 0.6);
        holeA.lineTo(0.4, 0.6);
        holeA.lineTo(0.35, 0.4);
        shape.holes.push(holeA);
        break;

      case 'B':
        // Create letter B
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.6, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.15, 0.9, height - 0.25);
        shape.bezierCurveTo(0.9, height - 0.35, 0.8, height - 0.45, 0.7, height - 0.5);
        shape.bezierCurveTo(0.85, height - 0.55, 0.95, height - 0.7, 0.95, height - 0.85);
        shape.bezierCurveTo(0.95, height - 1.0, 0.8, 0, 0.6, 0);
        shape.lineTo(0.1, 0);
        
        // Top hole
        const holeBTop = new THREE.Path();
        holeBTop.moveTo(0.3, height - 0.15);
        holeBTop.lineTo(0.6, height - 0.15);
        holeBTop.bezierCurveTo(0.7, height - 0.15, 0.7, height - 0.25, 0.7, height - 0.3);
        holeBTop.bezierCurveTo(0.7, height - 0.35, 0.7, height - 0.45, 0.6, height - 0.45);
        holeBTop.lineTo(0.3, height - 0.45);
        holeBTop.lineTo(0.3, height - 0.15);
        shape.holes.push(holeBTop);
        
        // Bottom hole
        const holeBBottom = new THREE.Path();
        holeBBottom.moveTo(0.3, height - 0.55);
        holeBBottom.lineTo(0.6, height - 0.55);
        holeBBottom.bezierCurveTo(0.75, height - 0.55, 0.75, height - 0.7, 0.75, height - 0.8);
        holeBBottom.bezierCurveTo(0.75, height - 0.9, 0.75, height - 1.0, 0.6, height - 1.0);
        holeBBottom.lineTo(0.3, height - 1.0);
        holeBBottom.lineTo(0.3, height - 0.55);
        shape.holes.push(holeBBottom);
        break;

      case 'C':
        // Create letter C
        shape.moveTo(0.9, 0.3);
        shape.bezierCurveTo(0.9, 0.1, 0.8, 0, 0.6, 0);
        shape.bezierCurveTo(0.3, 0, 0.1, 0.2, 0.1, 0.7);
        shape.bezierCurveTo(0.1, 1.2, 0.3, height, 0.6, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.1, 0.9, height - 0.3);
        shape.lineTo(0.7, height - 0.3);
        shape.bezierCurveTo(0.7, height - 0.15, 0.65, height - 0.1, 0.6, height - 0.1);
        shape.bezierCurveTo(0.4, height - 0.1, 0.3, height - 0.3, 0.3, 0.7);
        shape.bezierCurveTo(0.3, 0.3, 0.4, 0.1, 0.6, 0.1);
        shape.bezierCurveTo(0.65, 0.1, 0.7, 0.15, 0.7, 0.3);
        shape.lineTo(0.9, 0.3);
        break;

      case 'D':
        // Create letter D
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.5, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.3, 0.9, 0.7);
        shape.bezierCurveTo(0.9, 0.3, 0.8, 0, 0.5, 0);
        shape.lineTo(0.1, 0);
        
        // Hole
        const holeD = new THREE.Path();
        holeD.moveTo(0.3, 0.15);
        holeD.lineTo(0.5, 0.15);
        holeD.bezierCurveTo(0.65, 0.15, 0.7, 0.35, 0.7, 0.7);
        holeD.bezierCurveTo(0.7, 1.05, 0.65, height - 0.15, 0.5, height - 0.15);
        holeD.lineTo(0.3, height - 0.15);
        holeD.lineTo(0.3, 0.15);
        shape.holes.push(holeD);
        break;

      case 'E':
        // Create letter E
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.8, height);
        shape.lineTo(0.8, height - 0.2);
        shape.lineTo(0.3, height - 0.2);
        shape.lineTo(0.3, 0.8);
        shape.lineTo(0.7, 0.8);
        shape.lineTo(0.7, 0.6);
        shape.lineTo(0.3, 0.6);
        shape.lineTo(0.3, 0.2);
        shape.lineTo(0.8, 0.2);
        shape.lineTo(0.8, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'F':
        // Create letter F
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.8, height);
        shape.lineTo(0.8, height - 0.2);
        shape.lineTo(0.3, height - 0.2);
        shape.lineTo(0.3, 0.8);
        shape.lineTo(0.7, 0.8);
        shape.lineTo(0.7, 0.6);
        shape.lineTo(0.3, 0.6);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'G':
        // Create letter G
        shape.moveTo(0.9, 0.3);
        shape.bezierCurveTo(0.9, 0.1, 0.8, 0, 0.6, 0);
        shape.bezierCurveTo(0.3, 0, 0.1, 0.2, 0.1, 0.7);
        shape.bezierCurveTo(0.1, 1.2, 0.3, height, 0.6, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.1, 0.9, height - 0.3);
        shape.lineTo(0.9, 0.6);
        shape.lineTo(0.6, 0.6);
        shape.lineTo(0.6, 0.8);
        shape.lineTo(0.7, 0.8);
        shape.lineTo(0.7, height - 0.3);
        shape.bezierCurveTo(0.7, height - 0.15, 0.65, height - 0.1, 0.6, height - 0.1);
        shape.bezierCurveTo(0.4, height - 0.1, 0.3, height - 0.3, 0.3, 0.7);
        shape.bezierCurveTo(0.3, 0.3, 0.4, 0.1, 0.6, 0.1);
        shape.bezierCurveTo(0.65, 0.1, 0.7, 0.15, 0.7, 0.3);
        shape.lineTo(0.9, 0.3);
        break;

      case 'H':
        // Create letter H
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.3, 0.8);
        shape.lineTo(0.7, 0.8);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.7, 0);
        shape.lineTo(0.7, 0.6);
        shape.lineTo(0.3, 0.6);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'I':
        // Create letter I
        shape.moveTo(0.2, 0);
        shape.lineTo(0.2, 0.2);
        shape.lineTo(0.4, 0.2);
        shape.lineTo(0.4, height - 0.2);
        shape.lineTo(0.2, height - 0.2);
        shape.lineTo(0.2, height);
        shape.lineTo(0.8, height);
        shape.lineTo(0.8, height - 0.2);
        shape.lineTo(0.6, height - 0.2);
        shape.lineTo(0.6, 0.2);
        shape.lineTo(0.8, 0.2);
        shape.lineTo(0.8, 0);
        shape.lineTo(0.2, 0);
        break;

      case 'J':
        // Create letter J
        shape.moveTo(0.1, 0.4);
        shape.bezierCurveTo(0.1, 0.1, 0.2, 0, 0.4, 0);
        shape.bezierCurveTo(0.6, 0, 0.7, 0.1, 0.7, 0.4);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, 0.4);
        shape.bezierCurveTo(0.9, 0.05, 0.75, -0.1, 0.4, -0.1);
        shape.bezierCurveTo(0.05, -0.1, -0.1, 0.05, -0.1, 0.4);
        shape.lineTo(0.1, 0.4);
        
        // Hole
        const holeJ = new THREE.Path();
        holeJ.moveTo(0.1, 0.4);
        holeJ.bezierCurveTo(0.1, 0.2, 0.25, 0.1, 0.4, 0.1);
        holeJ.bezierCurveTo(0.55, 0.1, 0.7, 0.2, 0.7, 0.4);
        holeJ.lineTo(0.7, height - 0.1);
        holeJ.lineTo(0.5, height - 0.1);
        holeJ.lineTo(0.5, 0.4);
        holeJ.bezierCurveTo(0.5, 0.3, 0.45, 0.25, 0.4, 0.25);
        holeJ.bezierCurveTo(0.35, 0.25, 0.3, 0.3, 0.3, 0.4);
        holeJ.lineTo(0.1, 0.4);
        shape.holes.push(holeJ);
        break;

      case 'K':
        // Create letter K
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.3, 0.8);
        shape.lineTo(0.5, 0.8);
        shape.lineTo(0.8, height);
        shape.lineTo(1.0, height);
        shape.lineTo(0.6, 0.7);
        shape.lineTo(1.0, 0);
        shape.lineTo(0.8, 0);
        shape.lineTo(0.5, 0.6);
        shape.lineTo(0.3, 0.6);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'L':
        // Create letter L
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.3, 0.2);
        shape.lineTo(0.8, 0.2);
        shape.lineTo(0.8, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'M':
        // Create letter M
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.3, 0.4);
        shape.lineTo(0.5, 0.8);
        shape.lineTo(0.7, 0.4);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.7, 0);
        shape.lineTo(0.7, 0.6);
        shape.lineTo(0.6, 0.4);
        shape.lineTo(0.4, 0.4);
        shape.lineTo(0.3, 0.6);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'N':
        // Create letter N
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.3, 0.4);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.7, 0);
        shape.lineTo(0.7, 1.0);
        shape.lineTo(0.3, 0.4);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        break;

      case 'O':
        // Create letter O
        shape.moveTo(0.5, 0);
        shape.bezierCurveTo(0.8, 0, 1.0, 0.2, 1.0, 0.7);
        shape.bezierCurveTo(1.0, 1.2, 0.8, height, 0.5, height);
        shape.bezierCurveTo(0.2, height, 0, 1.2, 0, 0.7);
        shape.bezierCurveTo(0, 0.2, 0.2, 0, 0.5, 0);
        
        // Create hole
        const holeO = new THREE.Path();
        holeO.moveTo(0.5, 0.15);
        holeO.bezierCurveTo(0.7, 0.15, 0.8, 0.3, 0.8, 0.7);
        holeO.bezierCurveTo(0.8, 1.1, 0.7, height - 0.15, 0.5, height - 0.15);
        holeO.bezierCurveTo(0.3, height - 0.15, 0.2, 1.1, 0.2, 0.7);
        holeO.bezierCurveTo(0.2, 0.3, 0.3, 0.15, 0.5, 0.15);
        shape.holes.push(holeO);
        break;

      case 'P':
        // Create letter P
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.6, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.2, 0.9, height - 0.4);
        shape.bezierCurveTo(0.9, height - 0.6, 0.8, height - 0.8, 0.6, height - 0.8);
        shape.lineTo(0.3, height - 0.8);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        
        // Hole
        const holeP = new THREE.Path();
        holeP.moveTo(0.3, height - 0.2);
        holeP.lineTo(0.6, height - 0.2);
        holeP.bezierCurveTo(0.7, height - 0.2, 0.7, height - 0.4, 0.7, height - 0.5);
        holeP.bezierCurveTo(0.7, height - 0.6, 0.7, height - 0.8, 0.6, height - 0.8);
        holeP.lineTo(0.3, height - 0.8);
        holeP.lineTo(0.3, height - 0.2);
        shape.holes.push(holeP);
        break;

      case 'Q':
        // Create letter Q (like O but with tail)
        shape.moveTo(0.5, 0);
        shape.bezierCurveTo(0.8, 0, 1.0, 0.2, 1.0, 0.7);
        shape.bezierCurveTo(1.0, 1.2, 0.8, height, 0.5, height);
        shape.bezierCurveTo(0.2, height, 0, 1.2, 0, 0.7);
        shape.bezierCurveTo(0, 0.2, 0.2, 0, 0.5, 0);
        
        // Add tail
        shape.lineTo(0.7, -0.2);
        shape.lineTo(0.9, -0.1);
        shape.lineTo(0.7, 0.1);
        shape.lineTo(0.6, 0.05);
        shape.lineTo(0.5, 0);
        
        // Create hole
        const holeQ = new THREE.Path();
        holeQ.moveTo(0.5, 0.15);
        holeQ.bezierCurveTo(0.7, 0.15, 0.8, 0.3, 0.8, 0.7);
        holeQ.bezierCurveTo(0.8, 1.1, 0.7, height - 0.15, 0.5, height - 0.15);
        holeQ.bezierCurveTo(0.3, height - 0.15, 0.2, 1.1, 0.2, 0.7);
        holeQ.bezierCurveTo(0.2, 0.3, 0.3, 0.15, 0.5, 0.15);
        shape.holes.push(holeQ);
        break;

      case 'R':
        // Create letter R
        shape.moveTo(0.1, 0);
        shape.lineTo(0.1, height);
        shape.lineTo(0.6, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.2, 0.9, height - 0.4);
        shape.bezierCurveTo(0.9, height - 0.6, 0.8, height - 0.8, 0.6, height - 0.8);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.7, 0);
        shape.lineTo(0.5, height - 0.8);
        shape.lineTo(0.3, height - 0.8);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        
        // Hole
        const holeR = new THREE.Path();
        holeR.moveTo(0.3, height - 0.2);
        holeR.lineTo(0.6, height - 0.2);
        holeR.bezierCurveTo(0.7, height - 0.2, 0.7, height - 0.4, 0.7, height - 0.5);
        holeR.bezierCurveTo(0.7, height - 0.6, 0.7, height - 0.8, 0.6, height - 0.8);
        holeR.lineTo(0.3, height - 0.8);
        holeR.lineTo(0.3, height - 0.2);
        shape.holes.push(holeR);
        break;

      case 'S':
        // Create letter S
        shape.moveTo(0.9, 0.3);
        shape.bezierCurveTo(0.9, 0.1, 0.8, 0, 0.6, 0);
        shape.bezierCurveTo(0.3, 0, 0.1, 0.1, 0.1, 0.3);
        shape.bezierCurveTo(0.1, 0.5, 0.3, 0.6, 0.6, 0.7);
        shape.bezierCurveTo(0.7, 0.75, 0.8, 0.8, 0.8, 0.9);
        shape.bezierCurveTo(0.8, 1.1, 0.7, height, 0.4, height);
        shape.bezierCurveTo(0.2, height, 0.1, height - 0.1, 0.1, height - 0.3);
        shape.lineTo(0.3, height - 0.3);
        shape.bezierCurveTo(0.3, height - 0.15, 0.35, height - 0.1, 0.4, height - 0.1);
        shape.bezierCurveTo(0.55, height - 0.1, 0.6, height - 0.2, 0.6, height - 0.3);
        shape.bezierCurveTo(0.6, height - 0.4, 0.55, height - 0.45, 0.4, height - 0.5);
        shape.bezierCurveTo(0.2, height - 0.6, 0.1, height - 0.7, 0.1, height - 0.9);
        shape.bezierCurveTo(0.1, height - 1.1, 0.2, height - 1.2, 0.6, height - 1.2);
        shape.bezierCurveTo(0.8, height - 1.2, 0.9, height - 1.1, 0.9, height - 0.9);
        shape.lineTo(0.7, height - 0.9);
        shape.bezierCurveTo(0.7, height - 1.05, 0.65, height - 1.1, 0.6, height - 1.1);
        shape.bezierCurveTo(0.45, height - 1.1, 0.4, height - 1.0, 0.4, height - 0.9);
        shape.bezierCurveTo(0.4, height - 0.8, 0.45, height - 0.75, 0.6, height - 0.7);
        shape.bezierCurveTo(0.8, height - 0.6, 0.9, height - 0.5, 0.9, height - 0.3);
        shape.lineTo(0.9, 0.3);
        break;

      case 'T':
        // Create letter T
        shape.moveTo(0.1, height - 0.2);
        shape.lineTo(0.1, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, height - 0.2);
        shape.lineTo(0.6, height - 0.2);
        shape.lineTo(0.6, 0);
        shape.lineTo(0.4, 0);
        shape.lineTo(0.4, height - 0.2);
        shape.lineTo(0.1, height - 0.2);
        break;

      case 'U':
        // Create letter U
        shape.moveTo(0.1, height);
        shape.lineTo(0.1, 0.4);
        shape.bezierCurveTo(0.1, 0.1, 0.2, 0, 0.5, 0);
        shape.bezierCurveTo(0.8, 0, 0.9, 0.1, 0.9, 0.4);
        shape.lineTo(0.9, height);
        shape.lineTo(0.7, height);
        shape.lineTo(0.7, 0.4);
        shape.bezierCurveTo(0.7, 0.2, 0.65, 0.15, 0.5, 0.15);
        shape.bezierCurveTo(0.35, 0.15, 0.3, 0.2, 0.3, 0.4);
        shape.lineTo(0.3, height);
        shape.lineTo(0.1, height);
        break;

      case 'V':
        // Create letter V
        shape.moveTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.5, 0.2);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.6, 0);
        shape.lineTo(0.4, 0);
        shape.lineTo(0.1, height);
        break;

      case 'W':
        // Create letter W
        shape.moveTo(0.1, height);
        shape.lineTo(0.2, height);
        shape.lineTo(0.3, 0.2);
        shape.lineTo(0.4, 0.8);
        shape.lineTo(0.5, 0.6);
        shape.lineTo(0.6, 0.8);
        shape.lineTo(0.7, 0.2);
        shape.lineTo(0.8, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.75, 0);
        shape.lineTo(0.65, 0);
        shape.lineTo(0.5, 0.4);
        shape.lineTo(0.35, 0);
        shape.lineTo(0.25, 0);
        shape.lineTo(0.1, height);
        break;

      case 'X':
        // Create letter X
        shape.moveTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.5, 0.8);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.6, 0.7);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.7, 0);
        shape.lineTo(0.5, 0.6);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.1, 0);
        shape.lineTo(0.4, 0.7);
        shape.lineTo(0.1, height);
        break;

      case 'Y':
        // Create letter Y
        shape.moveTo(0.1, height);
        shape.lineTo(0.3, height);
        shape.lineTo(0.5, 0.8);
        shape.lineTo(0.7, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.6, 0.6);
        shape.lineTo(0.6, 0);
        shape.lineTo(0.4, 0);
        shape.lineTo(0.4, 0.6);
        shape.lineTo(0.1, height);
        break;

      case 'Z':
        // Create letter Z
        shape.moveTo(0.1, height - 0.2);
        shape.lineTo(0.1, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, height - 0.2);
        shape.lineTo(0.3, 0.2);
        shape.lineTo(0.9, 0.2);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.1, 0);
        shape.lineTo(0.1, 0.2);
        shape.lineTo(0.7, height - 0.2);
        shape.lineTo(0.1, height - 0.2);
        break;

      case '0':
        // Create number 0 (similar to O)
        shape.moveTo(0.5, 0);
        shape.bezierCurveTo(0.8, 0, 1.0, 0.2, 1.0, 0.7);
        shape.bezierCurveTo(1.0, 1.2, 0.8, height, 0.5, height);
        shape.bezierCurveTo(0.2, height, 0, 1.2, 0, 0.7);
        shape.bezierCurveTo(0, 0.2, 0.2, 0, 0.5, 0);
        
        const hole0 = new THREE.Path();
        hole0.moveTo(0.5, 0.15);
        hole0.bezierCurveTo(0.7, 0.15, 0.8, 0.3, 0.8, 0.7);
        hole0.bezierCurveTo(0.8, 1.1, 0.7, height - 0.15, 0.5, height - 0.15);
        hole0.bezierCurveTo(0.3, height - 0.15, 0.2, 1.1, 0.2, 0.7);
        hole0.bezierCurveTo(0.2, 0.3, 0.3, 0.15, 0.5, 0.15);
        shape.holes.push(hole0);
        break;

      case '1':
        // Create number 1
        shape.moveTo(0.3, 0);
        shape.lineTo(0.3, height - 0.3);
        shape.lineTo(0.2, height - 0.4);
        shape.lineTo(0.2, height);
        shape.lineTo(0.7, height);
        shape.lineTo(0.7, 0);
        shape.lineTo(0.3, 0);
        break;

      case '2':
        // Create number 2
        shape.moveTo(0.1, height - 0.3);
        shape.bezierCurveTo(0.1, height - 0.1, 0.2, height, 0.5, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.1, 0.9, height - 0.3);
        shape.bezierCurveTo(0.9, height - 0.5, 0.8, height - 0.6, 0.6, height - 0.7);
        shape.lineTo(0.3, 0.2);
        shape.lineTo(0.9, 0.2);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.1, 0);
        shape.lineTo(0.1, 0.2);
        shape.lineTo(0.5, height - 0.5);
        shape.bezierCurveTo(0.7, height - 0.4, 0.7, height - 0.3, 0.7, height - 0.3);
        shape.bezierCurveTo(0.7, height - 0.2, 0.65, height - 0.15, 0.5, height - 0.15);
        shape.bezierCurveTo(0.35, height - 0.15, 0.3, height - 0.2, 0.3, height - 0.3);
        shape.lineTo(0.1, height - 0.3);
        break;

      case '3':
        // Create number 3
        shape.moveTo(0.1, height - 0.3);
        shape.bezierCurveTo(0.1, height - 0.1, 0.2, height, 0.5, height);
        shape.bezierCurveTo(0.8, height, 0.9, height - 0.1, 0.9, height - 0.3);
        shape.bezierCurveTo(0.9, height - 0.45, 0.85, height - 0.55, 0.7, height - 0.6);
        shape.bezierCurveTo(0.85, height - 0.65, 0.9, height - 0.75, 0.9, height - 0.9);
        shape.bezierCurveTo(0.9, height - 1.1, 0.8, height - 1.2, 0.5, height - 1.2);
        shape.bezierCurveTo(0.2, height - 1.2, 0.1, height - 1.1, 0.1, height - 0.9);
        shape.lineTo(0.3, height - 0.9);
        shape.bezierCurveTo(0.3, height - 1.0, 0.35, height - 1.05, 0.5, height - 1.05);
        shape.bezierCurveTo(0.65, height - 1.05, 0.7, height - 1.0, 0.7, height - 0.9);
        shape.bezierCurveTo(0.7, height - 0.8, 0.65, height - 0.75, 0.5, height - 0.75);
        shape.lineTo(0.4, height - 0.75);
        shape.lineTo(0.4, height - 0.55);
        shape.lineTo(0.5, height - 0.55);
        shape.bezierCurveTo(0.65, height - 0.55, 0.7, height - 0.5, 0.7, height - 0.4);
        shape.bezierCurveTo(0.7, height - 0.3, 0.65, height - 0.25, 0.5, height - 0.25);
        shape.bezierCurveTo(0.35, height - 0.25, 0.3, height - 0.3, 0.3, height - 0.4);
        shape.lineTo(0.1, height - 0.3);
        break;

      case '4':
        // Create number 4
        shape.moveTo(0.6, 0);
        shape.lineTo(0.6, 0.5);
        shape.lineTo(0.1, 0.5);
        shape.lineTo(0.1, 0.7);
        shape.lineTo(0.5, height);
        shape.lineTo(0.7, height);
        shape.lineTo(0.7, 0.7);
        shape.lineTo(0.9, 0.7);
        shape.lineTo(0.9, 0.5);
        shape.lineTo(0.8, 0.5);
        shape.lineTo(0.8, 0);
        shape.lineTo(0.6, 0);
        
        const hole4 = new THREE.Path();
        hole4.moveTo(0.3, 0.7);
        hole4.lineTo(0.6, 0.7);
        hole4.lineTo(0.6, height - 0.2);
        hole4.lineTo(0.5, height - 0.2);
        hole4.lineTo(0.3, 0.7);
        shape.holes.push(hole4);
        break;

      case '5':
        // Create number 5
        shape.moveTo(0.1, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, height - 0.2);
        shape.lineTo(0.3, height - 0.2);
        shape.lineTo(0.3, height - 0.5);
        shape.lineTo(0.6, height - 0.5);
        shape.bezierCurveTo(0.8, height - 0.5, 0.9, height - 0.6, 0.9, height - 0.8);
        shape.bezierCurveTo(0.9, height - 1.0, 0.8, height - 1.1, 0.5, height - 1.1);
        shape.bezierCurveTo(0.2, height - 1.1, 0.1, height - 1.0, 0.1, height - 0.8);
        shape.lineTo(0.3, height - 0.8);
        shape.bezierCurveTo(0.3, height - 0.9, 0.35, height - 0.95, 0.5, height - 0.95);
        shape.bezierCurveTo(0.65, height - 0.95, 0.7, height - 0.9, 0.7, height - 0.8);
        shape.bezierCurveTo(0.7, height - 0.7, 0.65, height - 0.65, 0.6, height - 0.65);
        shape.lineTo(0.1, height - 0.65);
        shape.lineTo(0.1, height);
        break;

      case '6':
        // Create number 6
        shape.moveTo(0.5, height);
        shape.bezierCurveTo(0.2, height, 0.1, height - 0.2, 0.1, height - 0.7);
        shape.bezierCurveTo(0.1, height - 1.2, 0.2, height - 1.4, 0.5, height - 1.4);
        shape.bezierCurveTo(0.7, height - 1.4, 0.8, height - 1.3, 0.8, height - 1.1);
        shape.lineTo(0.6, height - 1.1);
        shape.bezierCurveTo(0.6, height - 1.2, 0.55, height - 1.25, 0.5, height - 1.25);
        shape.bezierCurveTo(0.35, height - 1.25, 0.3, height - 1.1, 0.3, height - 0.7);
        shape.bezierCurveTo(0.3, height - 0.6, 0.35, height - 0.55, 0.5, height - 0.55);
        shape.bezierCurveTo(0.7, height - 0.55, 0.8, height - 0.4, 0.8, height - 0.25);
        shape.bezierCurveTo(0.8, height - 0.1, 0.7, 0, 0.5, 0);
        shape.bezierCurveTo(0.3, 0, 0.2, height - 0.1, 0.2, height - 0.25);
        shape.bezierCurveTo(0.2, height - 0.4, 0.3, height - 0.55, 0.5, height - 0.55);
        
        const hole6 = new THREE.Path();
        hole6.moveTo(0.5, height - 0.4);
        hole6.bezierCurveTo(0.6, height - 0.4, 0.6, height - 0.3, 0.6, height - 0.25);
        hole6.bezierCurveTo(0.6, height - 0.2, 0.6, height - 0.15, 0.5, height - 0.15);
        hole6.bezierCurveTo(0.4, height - 0.15, 0.4, height - 0.2, 0.4, height - 0.25);
        hole6.bezierCurveTo(0.4, height - 0.3, 0.4, height - 0.4, 0.5, height - 0.4);
        shape.holes.push(hole6);
        break;

      case '7':
        // Create number 7
        shape.moveTo(0.1, height - 0.2);
        shape.lineTo(0.1, height);
        shape.lineTo(0.9, height);
        shape.lineTo(0.9, height - 0.2);
        shape.lineTo(0.4, 0);
        shape.lineTo(0.2, 0);
        shape.lineTo(0.7, height - 0.2);
        shape.lineTo(0.1, height - 0.2);
        break;

      case '8':
        // Create number 8
        shape.moveTo(0.5, 0);
        shape.bezierCurveTo(0.8, 0, 0.9, 0.1, 0.9, 0.3);
        shape.bezierCurveTo(0.9, 0.45, 0.85, 0.55, 0.7, 0.6);
        shape.bezierCurveTo(0.85, 0.65, 0.9, 0.75, 0.9, 0.9);
        shape.bezierCurveTo(0.9, 1.1, 0.8, height, 0.5, height);
        shape.bezierCurveTo(0.2, height, 0.1, 1.1, 0.1, 0.9);
        shape.bezierCurveTo(0.1, 0.75, 0.15, 0.65, 0.3, 0.6);
        shape.bezierCurveTo(0.15, 0.55, 0.1, 0.45, 0.1, 0.3);
        shape.bezierCurveTo(0.1, 0.1, 0.2, 0, 0.5, 0);
        
        // Top hole
        const hole8Top = new THREE.Path();
        hole8Top.moveTo(0.5, height - 0.15);
        hole8Top.bezierCurveTo(0.65, height - 0.15, 0.7, height - 0.25, 0.7, height - 0.35);
        hole8Top.bezierCurveTo(0.7, height - 0.45, 0.65, height - 0.55, 0.5, height - 0.55);
        hole8Top.bezierCurveTo(0.35, height - 0.55, 0.3, height - 0.45, 0.3, height - 0.35);
        hole8Top.bezierCurveTo(0.3, height - 0.25, 0.35, height - 0.15, 0.5, height - 0.15);
        shape.holes.push(hole8Top);
        
        // Bottom hole
        const hole8Bottom = new THREE.Path();
        hole8Bottom.moveTo(0.5, height - 0.75);
        hole8Bottom.bezierCurveTo(0.65, height - 0.75, 0.7, height - 0.85, 0.7, height - 0.95);
        hole8Bottom.bezierCurveTo(0.7, height - 1.05, 0.65, height - 1.15, 0.5, height - 1.15);
        hole8Bottom.bezierCurveTo(0.35, height - 1.15, 0.3, height - 1.05, 0.3, height - 0.95);
        hole8Bottom.bezierCurveTo(0.3, height - 0.85, 0.35, height - 0.75, 0.5, height - 0.75);
        shape.holes.push(hole8Bottom);
        break;

      case '9':
        // Create number 9
        shape.moveTo(0.5, 0);
        shape.bezierCurveTo(0.8, 0, 0.9, 0.2, 0.9, 0.7);
        shape.bezierCurveTo(0.9, 1.2, 0.8, height, 0.5, height);
        shape.bezierCurveTo(0.3, height, 0.2, 1.1, 0.2, 0.9);
        shape.lineTo(0.4, 0.9);
        shape.bezierCurveTo(0.4, 1.0, 0.45, 1.05, 0.5, 1.05);
        shape.bezierCurveTo(0.65, 1.05, 0.7, 0.9, 0.7, 0.7);
        shape.bezierCurveTo(0.7, 0.6, 0.65, 0.55, 0.5, 0.55);
        shape.bezierCurveTo(0.3, 0.55, 0.2, 0.4, 0.2, 0.25);
        shape.bezierCurveTo(0.2, 0.1, 0.3, 0, 0.5, 0);
        
        const hole9 = new THREE.Path();
        hole9.moveTo(0.5, 0.4);
        hole9.bezierCurveTo(0.4, 0.4, 0.4, 0.3, 0.4, 0.25);
        hole9.bezierCurveTo(0.4, 0.2, 0.4, 0.15, 0.5, 0.15);
        hole9.bezierCurveTo(0.6, 0.15, 0.6, 0.2, 0.6, 0.25);
        hole9.bezierCurveTo(0.6, 0.3, 0.6, 0.4, 0.5, 0.4);
        shape.holes.push(hole9);
        break;

      case ' ':
        // Space character - create a very thin invisible shape
        shape.moveTo(0, 0);
        shape.lineTo(0.3, 0);
        shape.lineTo(0.3, 0.01);
        shape.lineTo(0, 0.01);
        shape.lineTo(0, 0);
        break;

      default:
        // Default rectangular block for unsupported characters
        shape.moveTo(0.1, 0);
        shape.lineTo(0.9, 0);
        shape.lineTo(0.9, height);
        shape.lineTo(0.1, height);
        shape.lineTo(0.1, 0);
        break;
    }
    
    return shape;
  };

  // Function to create 3D text geometry
  const create3DText = (text: string) => {
    const group = new THREE.Group();
    const chars = text.split('');
    let xOffset = 0;
    const charSpacing = 1.2;
    const extrudeDepth = 0.3;
    
    chars.forEach((char, index) => {
      if (char === ' ') {
        xOffset += charSpacing * 0.5;
        return;
      }
      
      const charShape = createLetterShape(char);
      
      const extrudeSettings = {
        depth: extrudeDepth,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 2,
        bevelSize: 0.05,
        bevelThickness: 0.05
      };
      
      const charGeometry = new THREE.ExtrudeGeometry(charShape, extrudeSettings);
      const charMaterial = new THREE.MeshStandardMaterial({ 
        color: '#4a90e2',
        metalness: 0.1,
        roughness: 0.3
      });
      const charMesh = new THREE.Mesh(charGeometry, charMaterial);
      
      charMesh.position.x = xOffset;
      charMesh.position.y = -0.7; // Center vertically
      
      group.add(charMesh);
      xOffset += charSpacing;
    });
    
    // Center the entire text group
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.x = -center.x;
    
    return group;
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
    startObjectPlacement({
      geometry: shape.geometry,
      name: shape.name,
      color: shape.color
    });
    setShowObjectMenu(false);
  };

  const handleTextCreate = () => {
    if (!textInput.trim()) return;
    
    startObjectPlacement({
      geometry: () => create3DText(textInput.trim()),
      name: `3D Text: ${textInput.trim()}`,
      color: '#4a90e2'
    });
    setShowObjectMenu(false);
    setShowTextInput(false);
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
    { id: 'nature', name: 'Nature', icon: TreePine },
    { id: 'text', name: 'Text', icon: Type }
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

                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-3"
                        style={{ backgroundColor: '#4a90e2' + '20', color: '#4a90e2' }}
                      >
                        <Type className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-medium text-white/90 mb-2">Create 3D Text</h4>
                      <p className="text-xs text-white/60 mb-4">
                        Enter text to convert into extruded 3D letters
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-2">
                          Text Content
                        </label>
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleTextCreate();
                            }
                          }}
                          placeholder="Enter your text..."
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/50 focus:outline-none focus:border-blue-500/50 focus:bg-[#0a0a0a]"
                          maxLength={15}
                        />
                        <div className="text-xs text-white/50 mt-1">
                          {textInput.length}/15 characters
                        </div>
                      </div>

                      <button
                        onClick={handleTextCreate}
                        disabled={!textInput.trim()}
                        className={`w-full p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                          textInput.trim()
                            ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        Create 3D Text
                      </button>
                    </div>

                    <div className="text-xs text-white/50 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="font-medium text-blue-400 mb-1">💡 Features:</div>
                      <ul className="space-y-1">
                        <li>• All letters A-Z and numbers 0-9</li>
                        <li>• Proper letter shapes with holes</li>
                        <li>• Automatic spacing and centering</li>
                        <li>• Beveled edges for 3D effect</li>
                      </ul>
                    </div>
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