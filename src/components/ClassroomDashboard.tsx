import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  User, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Trash2, 
  Edit3, 
  Copy, 
  Download, 
  Upload,
  Clock,
  Eye,
  Settings,
  LogOut,
  BookOpen,
  Palette,
  Lightbulb,
  Box,
  Users,
  Star,
  MoreVertical,
  ChevronDown,
  ArrowLeft,
  Share2,
  Link,
  Check,
  X
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getScenes, deleteScene, updateScene, FirestoreScene } from '../services/firestoreService';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

interface Project extends FirestoreScene {
  thumbnail?: string;
  lastModified: Date;
  objectCount: number;
  lightCount: number;
}

const ClassroomDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'modified'>('modified');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'starred'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  
  // Rename modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        setShowAuthModal(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, sortBy, filterBy]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const scenes = await getScenes(user.uid);
      const projectsWithMetadata: Project[] = scenes.map(scene => {
        // Extract thumbnail from scene data if available
        const thumbnail = scene.sceneData?.thumbnail || generateProjectThumbnail(scene);
        
        return {
          ...scene,
          lastModified: scene.updatedAt?.toDate() || scene.createdAt?.toDate() || new Date(),
          objectCount: scene.sceneData?.objectCount || 0,
          lightCount: scene.sceneData?.lightCount || 0,
          thumbnail
        };
      });
      setProjects(projectsWithMetadata);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const generateProjectThumbnail = (scene: FirestoreScene): string => {
    // Generate a procedural thumbnail based on project data
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-400 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-yellow-400 to-red-500',
      'from-indigo-500 to-purple-600',
      'from-pink-500 to-rose-500'
    ];
    
    const patterns = [
      'bg-gradient-to-br',
      'bg-gradient-to-tr',
      'bg-gradient-to-bl',
      'bg-gradient-to-tl'
    ];
    
    // Use scene ID to consistently generate the same thumbnail
    const colorIndex = (scene.id?.charCodeAt(0) || 0) % colors.length;
    const patternIndex = (scene.id?.charCodeAt(1) || 0) % patterns.length;
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <circle cx="200" cy="150" r="60" fill="rgba(255,255,255,0.2)"/>
        <rect x="150" y="100" width="100" height="100" fill="rgba(255,255,255,0.1)" rx="10"/>
        <text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${scene.name.substring(0, 20)}</text>
      </svg>
    `)}`;
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(project => project.lastModified > oneWeekAgo);
        break;
      case 'starred':
        // Mock starred projects (in real app, this would be stored in user preferences)
        filtered = filtered.filter((_, index) => index % 3 === 0);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return (b.createdAt?.toDate() || new Date()).getTime() - (a.createdAt?.toDate() || new Date()).getTime();
        case 'modified':
        default:
          return b.lastModified.getTime() - a.lastModified.getTime();
      }
    });

    setFilteredProjects(filtered);
  };

  const handleCreateProject = () => {
    // Navigate to the 3D modeling application in the same tab
    window.location.href = '/?view=app';
  };

  const handleOpenProject = (projectId: string) => {
    // Navigate to the 3D modeling application with the specific project in the same tab
    window.location.href = `/?view=app&project=${projectId}`;
  };

  const handleRenameProject = (project: Project) => {
    setRenamingProject(project);
    setNewProjectName(project.name);
    setShowRenameModal(true);
    setShowProjectMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (!renamingProject || !newProjectName.trim()) return;
    
    setRenameLoading(true);
    try {
      await updateScene(renamingProject.id!, {
        name: newProjectName.trim()
      });
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === renamingProject.id 
          ? { ...p, name: newProjectName.trim() }
          : p
      ));
      
      setShowRenameModal(false);
      setRenamingProject(null);
      setNewProjectName('');
    } catch (error) {
      console.error('Error renaming project:', error);
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      await deleteScene(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setShowProjectMenu(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleShareProject = (project: Project) => {
    setSharingProject(project);
    // Generate a shareable URL (in a real app, this would create a public share link)
    const shareableUrl = `${window.location.origin}/?view=app&project=${project.id}&shared=true`;
    setShareUrl(shareableUrl);
    setShowShareModal(true);
    setShowProjectMenu(null);
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      // Create a copy of the project with a new name
      const duplicatedProject = {
        ...project,
        name: `${project.name} (Copy)`,
        userId: user.uid
      };
      
      // Remove the ID so it creates a new document
      delete duplicatedProject.id;
      delete duplicatedProject.createdAt;
      delete duplicatedProject.updatedAt;
      
      // Save the duplicated project (this would need to be implemented in firestoreService)
      // For now, we'll just reload the projects
      await loadProjects();
      setShowProjectMenu(null);
    } catch (error) {
      console.error('Error duplicating project:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setShowAuthModal(true);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">3D Studio Classroom</h1>
                  <p className="text-sm text-white/60">Create and manage your 3D projects</p>
                </div>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCreateProject}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Project
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-white">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-white/60">
                        {user.email}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/70" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl z-50">
                        <div className="p-4 border-b border-white/10">
                          <div className="text-sm font-medium text-white">{user.displayName || 'User'}</div>
                          <div className="text-xs text-white/60">{user.email}</div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowProfileModal(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 rounded-lg transition-colors text-white"
                          >
                            <Settings className="w-4 h-4" />
                            Profile Settings
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 rounded-lg transition-colors text-red-400"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">All Projects</option>
              <option value="recent">Recent</option>
              <option value="starred">Starred</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="modified">Last Modified</option>
              <option value="name">Name</option>
              <option value="date">Date Created</option>
            </select>

            <div className="flex bg-black/20 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first 3D project to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Project
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-200 hover:scale-105"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden">
                    {project.thumbnail?.startsWith('data:image/svg+xml') ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                        <div className="text-center">
                          <Box className="w-12 h-12 text-white/40 mx-auto mb-2" />
                          <div className="text-white/60 text-sm font-medium">{project.name}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="relative">
                      <button
                        onClick={() => setShowProjectMenu(showProjectMenu === project.id ? null : project.id)}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showProjectMenu === project.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl z-50">
                            <button
                              onClick={() => {
                                handleOpenProject(project.id!);
                                setShowProjectMenu(null);
                              }}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Open Project
                            </button>
                            <button
                              onClick={() => handleRenameProject(project)}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-white transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              Rename
                            </button>
                            <button
                              onClick={() => handleDuplicateProject(project)}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-white transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleShareProject(project)}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-blue-400 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                            <div className="border-t border-white/10 my-1"></div>
                            <button
                              onClick={() => handleDeleteProject(project.id!)}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenProject(project.id!)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors">
                      <Eye className="w-6 h-6" />
                    </div>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        {project.objectCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        {project.lightCount}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.lastModified)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenProject(project.id!)}
                    className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors"
                  >
                    Open Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-colors"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {project.thumbnail?.startsWith('data:image/svg+xml') ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box className="w-8 h-8 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-white/60 truncate">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/50 mt-1">
                    <div className="flex items-center gap-1">
                      <Box className="w-3 h-3" />
                      {project.objectCount} objects
                    </div>
                    <div className="flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {project.lightCount} lights
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.lastModified)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenProject(project.id!)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                    title="Open Project"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowProjectMenu(showProjectMenu === project.id ? null : project.id)}
                      className="p-2 hover:bg-white/10 text-white/70 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showProjectMenu === project.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl z-50">
                          <button
                            onClick={() => handleRenameProject(project)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-white transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDuplicateProject(project)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-white transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleShareProject(project)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-blue-400 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <div className="border-t border-white/10 my-1"></div>
                          <button
                            onClick={() => handleDeleteProject(project.id!)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/10 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rename Project Modal */}
      {showRenameModal && renamingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rename Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500/50"
                    placeholder="Enter project name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSubmit();
                      } else if (e.key === 'Escape') {
                        setShowRenameModal(false);
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRenameModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    disabled={renameLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenameSubmit}
                    disabled={!newProjectName.trim() || renameLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {renameLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Project Modal */}
      {showShareModal && sharingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Share Project</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70 mb-3">
                    Share "{sharingProject.name}" with others using this link:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={handleCopyShareUrl}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        copySuccess 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    <strong>Note:</strong> Anyone with this link will be able to view your project in read-only mode.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </div>
  );
};

export default ClassroomDashboard;