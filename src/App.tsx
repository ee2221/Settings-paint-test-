import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
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
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import ClassroomDashboard from './components/ClassroomDashboard';
import { useSceneStore } from './store/sceneStore';
import { loadProjectData } from './services/firestoreService';

function App() {
  const { sceneSettings } = useSceneStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'app'>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Show auth modal if no user is signed in
      if (!user) {
        setShowAuthModal(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check URL parameters to determine which view to show
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const projectId = urlParams.get('project');
    
    if (view === 'app' || projectId || window.location.pathname === '/app') {
      setCurrentView('app');
      setCurrentProjectId(projectId);
      
      // Load project data if projectId is provided and user is authenticated
      if (projectId && user) {
        loadProject(projectId);
      }
    } else {
      setCurrentView('dashboard');
    }
  }, [user]);

  const loadProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      const projectData = await loadProjectData(projectId, user.uid);
      
      // TODO: Load the project data into the scene store
      // This would involve converting Firestore data back to Three.js objects
      // and updating the scene store state
      console.log('Loaded project data:', projectData);
      
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setShowAuthModal(true);
    setCurrentView('dashboard');
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="w-full h-screen bg-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Show classroom dashboard by default
  if (currentView === 'dashboard') {
    return <ClassroomDashboard />;
  }

  // Show 3D modeling application
  return (
    <div className="w-full h-screen relative">
      <Scene />
      
      {/* Top Left Controls - Arranged horizontally */}
      <div className="fixed top-4 left-4 flex items-center gap-4 z-50">
        {/* Back to Dashboard Button */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 transition-all duration-200 hover:scale-105 text-white/90"
          title="Back to Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Dashboard</span>
        </button>
        
        {/* Hide Interface Button */}
        <HideInterfaceButton />
        
        {/* Save Button - When user is authenticated */}
        {user && <SaveButton user={user} projectId={currentProjectId} />}
        
        {/* User Profile - When user is authenticated */}
        {user && <UserProfile user={user} onSignOut={handleSignOut} />}
      </div>
      
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
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;