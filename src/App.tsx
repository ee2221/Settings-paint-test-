import React from 'react';
import Scene from './components/Scene';
import Toolbar from './components/Toolbar';
import ActionsToolbar from './components/ActionsToolbar';
import LayersPanel from './components/LayersPanel';
import ObjectProperties from './components/ObjectProperties';
import EditControls from './components/EditControls';
import CameraPerspectivePanel from './components/CameraPerspectivePanel';
import LightingPanel from './components/LightingPanel';
import SettingsPanel, { HideInterfaceButton } from './components/SettingsPanel';
import SaveButton from './components/SaveButton';
import { useSceneStore } from './store/sceneStore';

function App() {
  const { sceneSettings } = useSceneStore();

  return (
    <div className="w-full h-screen relative">
      <Scene />
      
      {/* Hide Interface Button - Always visible at top left */}
      <HideInterfaceButton />
      
      {/* Save Button - Always visible at top right */}
      <SaveButton />
      
      {/* Conditionally render UI panels based on hideAllMenus setting */}
      {!sceneSettings.hideAllMenus && (
        <>
          <ActionsToolbar />
          <Toolbar />
          <LayersPanel />
          <ObjectProperties />
          <EditControls />
          <CameraPerspectivePanel />
          <LightingPanel />
        </>
      )}
      
      {/* Settings panel is always visible */}
      <SettingsPanel />
    </div>
  );
}

export default App;