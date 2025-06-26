import React, { useState, useEffect } from 'react';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Download, 
  Upload, 
  Search,
  Globe,
  Lock,
  Plus,
  X,
  Calendar,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  Cloud,
  CloudOff
} from 'lucide-react';
import { useSceneStore } from '../store/sceneStore';
import { firestoreService, SavedScene } from '../services/firestoreService';

const SaveLoadPanel: React.FC = () => {
  const { 
    objects, 
    groups, 
    lights, 
    sceneSettings,
    loadSceneFromData,
    clearScene
  } = useSceneStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'browse'>('save');
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);
  const [publicScenes, setPublicScenes] = useState<SavedScene[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

  // Save dialog state
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveAsPublic, setSaveAsPublic] = useState(false);

  // Load scenes on component mount and tab change
  useEffect(() => {
    if (isOpen) {
      loadScenes();
    }
  }, [isOpen, activeTab]);

  const loadScenes = async () => {
    setLoading(true);
    try {
      if (activeTab === 'load') {
        // Load user's scenes (for now, we'll load all scenes)
        const scenes = await firestoreService.getScenes();
        setSavedScenes(scenes);
      } else if (activeTab === 'browse') {
        // Load public scenes
        const scenes = await firestoreService.getPublicScenes();
        setPublicScenes(scenes);
      }
    } catch (error) {
      console.error('Error loading scenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;

    setLoading(true);
    try {
      if (currentSceneId) {
        // Update existing scene
        await firestoreService.updateScene(
          currentSceneId,
          saveName,
          objects,
          groups,
          lights,
          sceneSettings,
          saveDescription
        );
      } else {
        // Save new scene
        const sceneId = await firestoreService.saveScene(
          saveName,
          objects,
          groups,
          lights,
          sceneSettings,
          saveDescription,
          saveAsPublic
        );
        setCurrentSceneId(sceneId);
      }

      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
      setSaveAsPublic(false);
      
      // Refresh the scenes list
      loadScenes();
    } catch (error) {
      console.error('Error saving scene:', error);
      alert('Failed to save scene. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (sceneId: string) => {
    setLoading(true);
    try {
      const sceneData = await firestoreService.loadScene(sceneId);
      
      // Clear current scene
      clearScene();
      
      // Load the scene data
      loadSceneFromData(
        sceneData.objects,
        sceneData.groups,
        sceneData.lights,
        sceneData.sceneSettings
      );

      setCurrentSceneId(sceneId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error loading scene:', error);
      alert('Failed to load scene. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sceneId: string) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;

    setLoading(true);
    try {
      await firestoreService.deleteScene(sceneId);
      
      // Remove from local state
      setSavedScenes(prev => prev.filter(scene => scene.id !== sceneId));
      setPublicScenes(prev => prev.filter(scene => scene.id !== sceneId));
      
      // Clear current scene ID if it was deleted
      if (currentSceneId === sceneId) {
        setCurrentSceneId(null);
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
      alert('Failed to delete scene. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadScenes();
      return;
    }

    setLoading(true);
    try {
      const scenes = await firestoreService.searchScenes(searchTerm, activeTab === 'browse');
      
      if (activeTab === 'browse') {
        setPublicScenes(scenes);
      } else {
        setSavedScenes(scenes);
      }
    } catch (error) {
      console.error('Error searching scenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSceneCard = (scene: SavedScene, showActions: boolean = true) => (
    <div key={scene.id} className="bg-[#2a2a2a] rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-white/90 mb-1">{scene.name}</h3>
          {scene.description && (
            <p className="text-sm text-white/60 mb-2">{scene.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-white/50">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(scene.updatedAt)}
            </div>
            <div className="flex items-center gap-1">
              {scene.isPublic ? (
                <>
                  <Globe className="w-3 h-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Private
                </>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1 ml-3">
            <button
              onClick={() => handleLoad(scene.id!)}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
              title="Load Scene"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(scene.id!)}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
              title="Delete Scene"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-white/50">
        <div>
          {scene.objects?.length || 0} objects, {scene.lights?.length || 0} lights
        </div>
        {currentSceneId === scene.id && (
          <div className="flex items-center gap-1 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Current
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-20 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl shadow-2xl shadow-black/20 border border-white/5 transition-all duration-200 hover:scale-105 z-50"
        title="Save/Load Scenes"
      >
        <Cloud className="w-5 h-5 text-white/90" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/5 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white/90">Scene Manager</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'save', label: 'Save', icon: Save },
            { id: 'load', label: 'My Scenes', icon: FolderOpen },
            { id: 'browse', label: 'Browse Public', icon: Globe }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-6 py-4 transition-colors ${
                activeTab === id
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                  : 'text-white/70 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {/* Save Tab */}
          {activeTab === 'save' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white/90 mb-2">Save Current Scene</h3>
                <p className="text-white/60 mb-6">
                  Save your current 3D scene to the cloud for later use
                </p>
                
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={objects.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    objects.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Save className="w-5 h-5 inline mr-2" />
                  Save Scene
                </button>
                
                {objects.length === 0 && (
                  <p className="text-sm text-white/50 mt-2">
                    Add some objects to your scene before saving
                  </p>
                )}
              </div>

              {currentSceneId && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Cloud className="w-4 h-4" />
                    <span className="font-medium">Scene Linked</span>
                  </div>
                  <p className="text-sm text-white/70">
                    This scene is linked to cloud storage. Saving will update the existing scene.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Load Tab */}
          {activeTab === 'load' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search your scenes..."
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white/90 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={loadScenes}
                  disabled={loading}
                  className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors text-white/70"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
                  <p className="text-white/60">Loading scenes...</p>
                </div>
              ) : savedScenes.length === 0 ? (
                <div className="text-center py-8">
                  <CloudOff className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p className="text-white/60 mb-2">No saved scenes found</p>
                  <p className="text-sm text-white/50">Create and save your first scene!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedScenes.map(scene => renderSceneCard(scene))}
                </div>
              )}
            </div>
          )}

          {/* Browse Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search public scenes..."
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white/90 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={loadScenes}
                  disabled={loading}
                  className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors text-white/70"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
                  <p className="text-white/60">Loading public scenes...</p>
                </div>
              ) : publicScenes.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p className="text-white/60 mb-2">No public scenes found</p>
                  <p className="text-sm text-white/50">Be the first to share a public scene!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {publicScenes.map(scene => renderSceneCard(scene, false))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/5 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Save Scene</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Scene Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter scene name..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description (Optional)</label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Describe your scene..."
                  rows={3}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Make Public</label>
                <button
                  onClick={() => setSaveAsPublic(!saveAsPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    saveAsPublic ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      saveAsPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {saveAsPublic && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    Public scenes can be viewed and loaded by other users.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors text-white/90"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim() || loading}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  !saveName.trim() || loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveLoadPanel;