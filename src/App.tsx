// Add to App.tsx imports
import { useState, useEffect } from 'react';
import { api } from './lib/api';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [landingContent, setLandingContent] = useState<LandingContent>(defaultLandingContent);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── On mount: restore session ──────────────────────────────────────────────
  useEffect(() => {
    api.auth.me()
      .then((user: any) => {
        setCurrentUser(user);
        loadInitialData(user);
      })
      .catch(() => {
        // No active session — show landing
      })
      .finally(() => setLoading(false));

    // Always load landing content
    api.landing.get()
      .then((content: any) => setLandingContent(content))
      .catch(() => {});
  }, []);

  const loadInitialData = async (user: User) => {
    try {
      const [projectsData, requestsData] = await Promise.all([
        api.projects.getAll(),
        api.accessRequests.getAll(),
      ]);

      setProjects(projectsData as Project[]);
      setAccessRequests(requestsData as AccessRequest[]);

      if (user.role === 'admin') {
        const users = await api.admin.getUsers();
        setAllUsers(users as User[]);
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  };

  // ─── Auth handlers ───────────────────────────────────────────────────────────
  const handleLogin = async (credentials: { email: string; password: string; name?: string; role: string }) => {
    const { user } = credentials as any;
    setCurrentUser(user);
    setShowLogin(false);
    await loadInitialData(user);
  };

  const handleLogout = async () => {
    await api.auth.logout().catch(() => {});
    setCurrentUser(null);
    setProjects([]);
    setAccessRequests([]);
    setAllUsers([]);
    setCurrentView('dashboard');
  };

  // ─── Project handlers ─────────────────────────────────────────────────────────
  const handleCreateProject = async (project: Project) => {
    const created = await api.projects.create(project) as Project;
    setProjects(prev => [created, ...prev]);
    setCurrentView('dashboard');
  };

  const handleRequestAccess = async (projectId: string) => {
    if (!currentUser) return;
    const request = await api.accessRequests.create(projectId) as AccessRequest;
    setAccessRequests(prev => [...prev, request]);
  };

  const handleApproveRequest = async (requestId: string) => {
    const updated = await api.accessRequests.approve(requestId) as AccessRequest;
    setAccessRequests(prev => prev.map(r => r.id === requestId ? updated : r));

    const request = accessRequests.find(r => r.id === requestId);
    if (request) {
      setProjects(prev => prev.map(p =>
        p.id === request.projectId
          ? { ...p, approvedFacultyIds: [...(p.approvedFacultyIds || []), request.facultyId] }
          : p
      ));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const updated = await api.accessRequests.reject(requestId) as AccessRequest;
    setAccessRequests(prev => prev.map(r => r.id === requestId ? updated : r));
  };

  const handleApproveProject = async (projectId: string) => {
    const updated = await api.admin.approveProject(projectId) as Project;
    setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
  };

  const handleRejectProject = async (projectId: string) => {
    const updated = await api.admin.rejectProject(projectId) as Project;
    setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
  };

  const handleUpdateLandingContent = async (content: LandingContent) => {
    const updated = await api.landing.update(content) as LandingContent;
    setLandingContent(updated);
  };

  // ─── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ─── ADMIN VIEW ──────────────────────────────────────────────────────────────
  if (currentUser?.role === 'admin') {
    return (
      <AdminDashboard
        user={currentUser}
        landingContent={landingContent}
        onUpdateContent={handleUpdateLandingContent}
        onLogout={handleLogout}
        projects={projects}
        users={allUsers}
        onApproveProject={handleApproveProject}
        onRejectProject={handleRejectProject}
      />
    );
  }

  // ─── Rest of your normal app render (students/faculty/landing/dashboard) ────
  return (
    <div>
      {/* your existing UI */}
    </div>
  );
}

export default App;