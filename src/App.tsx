import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HardDrive, 
  Wifi, 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  File, 
  Play, 
  X, 
  Check, 
  AlertCircle,
  Menu,
  Settings,
  Battery,
  ShieldCheck,
  Search,
  MoreVertical,
  Plus,
  Folder,
  ChevronLeft,
  Info,
  Activity,
  Cpu,
  Power,
  Sun,
  Moon,
  Copy,
  ChevronDown,
  RefreshCw,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_BASE_URL } from './config';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileInfo {
  name: string;
  path?: string;
  size: number;
  mtime: string;
  isDir: boolean;
  mimeType: string;
}

interface ServerStatus {
  status: string;
  ip: string;
  port: number;
  deviceName: string;
  storageUsed: number;
  fileCount: number;
  uptime: number;
  batteryOptimization: string;
  deviceStorage?: {
    total: number;
    used: number;
    free: number;
  };
  remoteDevices?: {
    id: string;
    name: string;
    ip: string;
    status: string;
  }[];
}

export default function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<{ name: string; content: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = async (file: FileInfo) => {
    if (file.mimeType.startsWith('text/')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/preview?path=${encodeURIComponent(file.path || file.name)}`);
        const content = await res.text();
        setEditingFile({ name: file.path || file.name, content });
      } catch (err) {
        console.error('Failed to load file for editing:', err);
      }
    } else {
      setPreviewFile(file);
    }
  };

  const saveEdit = async () => {
    if (!editingFile) return;
    const blob = new Blob([editingFile.content], { type: 'text/plain' });
    const file = new File([blob], editingFile.name.split('/').pop() || editingFile.name);
    const formData = new FormData();
    formData.append('files', file);

    try {
      // Save to the directory where the file is located
      const filePathParts = editingFile.name.split('/');
      filePathParts.pop();
      const dirPath = filePathParts.join('/');
      
      await fetch(`${API_BASE_URL}/api/upload?path=${encodeURIComponent(dirPath)}`, {
        method: 'POST',
        body: formData,
      });
      setEditingFile(null);
      fetchFiles();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const [currentPath, setCurrentPath] = useState('');
  const [activeTab, setActiveTab] = useState<'nas' | 'local' | 'settings'>('nas');
  const [prevTab, setPrevTab] = useState<'nas' | 'local' | 'settings'>('nas');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isBatterySaving, setIsBatterySaving] = useState(true);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [isStorageExpanded, setIsStorageExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeviceSelectorOpen, setIsDeviceSelectorOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [appColor, setAppColor] = useState('indigo');
  const [deviceSettings, setDeviceSettings] = useState<Record<string, {
    allowed: boolean;
    permissions: ('all' | 'video' | 'image' | 'audio')[];
  }>>({});
  const [fileActionMenu, setFileActionMenu] = useState<FileInfo | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const theme = {
    indigo: {
      name: 'Normal',
      bg: 'bg-indigo-600',
      bgHover: 'hover:bg-indigo-700',
      bgLight: 'bg-indigo-50',
      bgDark: 'bg-indigo-900',
      border: 'border-indigo-100',
      borderDark: 'border-indigo-800',
      text: 'text-indigo-600',
      textLight: 'text-indigo-400',
      textAccent: 'text-indigo-500',
      shadow: 'shadow-indigo-200',
      shadowDark: 'shadow-indigo-900/20',
      fill: 'fill-indigo-600',
      selection: 'selection:bg-indigo-100 selection:text-indigo-900',
      accent: 'bg-indigo-600',
      accentBg: 'bg-indigo-50',
      accentBorder: 'border-indigo-100',
      accentShadow: 'shadow-indigo-100',
      accentRing: 'ring-indigo-500',
      success: 'text-emerald-600',
      successBg: 'bg-emerald-500',
      successLight: 'bg-emerald-50',
      danger: 'text-rose-600',
      dangerBg: 'bg-rose-500',
      dangerLight: 'bg-rose-50',
      warning: 'text-amber-600',
      warningBg: 'bg-amber-500',
      warningLight: 'bg-amber-50',
      info: 'text-blue-600',
      infoBg: 'bg-blue-500',
      infoLight: 'bg-blue-50',
      muted: 'text-slate-400',
      mutedBg: 'bg-slate-100',
    },
    emerald: {
      name: 'Verde',
      bg: 'bg-emerald-600',
      bgHover: 'hover:bg-emerald-700',
      bgLight: 'bg-emerald-50',
      bgDark: 'bg-emerald-900',
      border: 'border-emerald-100',
      borderDark: 'border-emerald-800',
      text: 'text-emerald-600',
      textLight: 'text-emerald-400',
      textAccent: 'text-emerald-500',
      shadow: 'shadow-emerald-200',
      shadowDark: 'shadow-emerald-900/20',
      fill: 'fill-emerald-600',
      selection: 'selection:bg-emerald-100 selection:text-emerald-900',
      accent: 'bg-emerald-600',
      accentBg: 'bg-emerald-50',
      accentBorder: 'border-emerald-100',
      accentShadow: 'shadow-emerald-100',
      accentRing: 'ring-emerald-500',
      success: 'text-emerald-600',
      successBg: 'bg-emerald-500',
      successLight: 'bg-emerald-50',
      danger: 'text-rose-600',
      dangerBg: 'bg-rose-500',
      dangerLight: 'bg-rose-50',
      warning: 'text-amber-600',
      warningBg: 'bg-amber-500',
      warningLight: 'bg-amber-50',
      info: 'text-blue-600',
      infoBg: 'bg-blue-500',
      infoLight: 'bg-blue-50',
      muted: 'text-slate-400',
      mutedBg: 'bg-slate-100',
    },
    blue: {
      name: 'Azul',
      bg: 'bg-blue-600',
      bgHover: 'hover:bg-blue-700',
      bgLight: 'bg-blue-50',
      bgDark: 'bg-blue-900',
      border: 'border-blue-100',
      borderDark: 'border-blue-800',
      text: 'text-blue-600',
      textLight: 'text-blue-400',
      textAccent: 'text-blue-500',
      shadow: 'shadow-blue-200',
      shadowDark: 'shadow-blue-900/20',
      fill: 'fill-blue-600',
      selection: 'selection:bg-blue-100 selection:text-blue-900',
      accent: 'bg-blue-600',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-100',
      accentShadow: 'shadow-blue-100',
      accentRing: 'ring-blue-500',
      success: 'text-emerald-600',
      successBg: 'bg-emerald-500',
      successLight: 'bg-emerald-50',
      danger: 'text-rose-600',
      dangerBg: 'bg-rose-500',
      dangerLight: 'bg-rose-50',
      warning: 'text-amber-600',
      warningBg: 'bg-amber-500',
      warningLight: 'bg-amber-50',
      info: 'text-blue-600',
      infoBg: 'bg-blue-500',
      infoLight: 'bg-blue-50',
      muted: 'text-slate-400',
      mutedBg: 'bg-slate-100',
    },
    rose: {
      name: 'Rosa',
      bg: 'bg-rose-600',
      bgHover: 'hover:bg-rose-700',
      bgLight: 'bg-rose-50',
      bgDark: 'bg-rose-900',
      border: 'border-rose-100',
      borderDark: 'border-rose-800',
      text: 'text-rose-600',
      textLight: 'text-rose-400',
      textAccent: 'text-rose-500',
      shadow: 'shadow-rose-200',
      shadowDark: 'shadow-rose-900/20',
      fill: 'fill-rose-600',
      selection: 'selection:bg-rose-100 selection:text-rose-900',
      accent: 'bg-rose-600',
      accentBg: 'bg-rose-50',
      accentBorder: 'border-rose-100',
      accentShadow: 'shadow-rose-100',
      accentRing: 'ring-rose-500',
      success: 'text-emerald-600',
      successBg: 'bg-emerald-500',
      successLight: 'bg-emerald-50',
      danger: 'text-rose-600',
      dangerBg: 'bg-rose-500',
      dangerLight: 'bg-rose-50',
      warning: 'text-amber-600',
      warningBg: 'bg-amber-500',
      warningLight: 'bg-amber-50',
      info: 'text-blue-600',
      infoBg: 'bg-blue-500',
      infoLight: 'bg-blue-50',
      muted: 'text-slate-400',
      mutedBg: 'bg-slate-100',
    },
    amber: {
      name: 'Ambar',
      bg: 'bg-amber-600',
      bgHover: 'hover:bg-amber-700',
      bgLight: 'bg-amber-50',
      bgDark: 'bg-amber-900',
      border: 'border-amber-100',
      borderDark: 'border-amber-800',
      text: 'text-amber-600',
      textLight: 'text-amber-400',
      textAccent: 'text-amber-500',
      shadow: 'shadow-amber-200',
      shadowDark: 'shadow-amber-900/20',
      fill: 'fill-amber-600',
      selection: 'selection:bg-amber-100 selection:text-amber-900',
      accent: 'bg-amber-600',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-100',
      accentShadow: 'shadow-amber-100',
      accentRing: 'ring-amber-500',
      success: 'text-emerald-600',
      successBg: 'bg-emerald-500',
      successLight: 'bg-emerald-50',
      danger: 'text-rose-600',
      dangerBg: 'bg-rose-500',
      dangerLight: 'bg-rose-50',
      warning: 'text-amber-600',
      warningBg: 'bg-amber-500',
      warningLight: 'bg-amber-50',
      info: 'text-blue-600',
      infoBg: 'bg-blue-500',
      infoLight: 'bg-blue-50',
      muted: 'text-slate-400',
      mutedBg: 'bg-slate-100',
    },
    dark: {
      name: 'Oscuro',
      bg: 'bg-slate-800',
      bgHover: 'hover:bg-slate-700',
      bgLight: 'bg-slate-900',
      bgDark: 'bg-slate-950',
      border: 'border-slate-700',
      borderDark: 'border-slate-800',
      text: 'text-slate-200',
      textLight: 'text-slate-400',
      textAccent: 'text-slate-300',
      shadow: 'shadow-slate-900/50',
      shadowDark: 'shadow-black/40',
      fill: 'fill-slate-200',
      selection: 'selection:bg-slate-700 selection:text-slate-100',
      accent: 'bg-indigo-500',
      accentBg: 'bg-indigo-500/10',
      accentBorder: 'border-indigo-500/20',
      accentShadow: 'shadow-indigo-500/10',
      accentRing: 'ring-indigo-500',
      success: 'text-emerald-400',
      successBg: 'bg-emerald-500',
      successLight: 'bg-emerald-500/10',
      danger: 'text-rose-400',
      dangerBg: 'bg-rose-500',
      dangerLight: 'bg-rose-500/10',
      warning: 'text-amber-400',
      warningBg: 'bg-amber-500',
      warningLight: 'bg-amber-500/10',
      info: 'text-blue-400',
      infoBg: 'bg-blue-500',
      infoLight: 'bg-blue-500/10',
      muted: 'text-slate-500',
      mutedBg: 'bg-slate-800',
    }


  };

  const currentTheme = theme[appColor as keyof typeof theme] || theme.indigo;

  useEffect(() => {
    if (appColor === 'dark') {
      setIsDarkMode(true);
    } else if (appColor === 'indigo') {
      setIsDarkMode(false);
    }
  }, [appColor]);

  const refreshDevices = async () => {
    setIsScanning(true);
    // Simular un escaneo de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchStatus();
    setIsScanning(false);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const storageBreakdown = useMemo(() => {
    return files.reduce((acc, file) => {
      if (file.isDir) return acc;
      const mime = file.mimeType.toLowerCase();
      if (mime.startsWith('image/')) acc.images += file.size;
      else if (mime.startsWith('video/')) acc.videos += file.size;
      else if (mime.startsWith('audio/')) acc.audio += file.size;
      else acc.others += file.size;
      return acc;
    }, { images: 0, videos: 0, audio: 0, others: 0 });
  }, [files]);

  const toggleTab = (tab: 'nas' | 'local' | 'settings') => {
    if (activeTab === tab) {
      setActiveTab(prevTab);
    } else {
      setPrevTab(activeTab);
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchFiles('');
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const fetchFiles = async (path = currentPath) => {
    try {
      setLoading(true);
      if (connectedDeviceId) {
        // Mocking remote files for the demo
        const device = status?.remoteDevices?.find(d => d.id === connectedDeviceId);
        const perms = deviceSettings[connectedDeviceId]?.permissions || ['video'];
        
        const mockFiles: FileInfo[] = [
          { name: 'Documento_Compartido.txt', size: 1024, mtime: new Date().toISOString(), isDir: false, mimeType: 'text/plain' },
          { name: 'Foto_Vacaciones.jpg', size: 2048576, mtime: new Date().toISOString(), isDir: false, mimeType: 'image/jpeg' },
          { name: 'Video_Demo.mp4', size: 50485760, mtime: new Date().toISOString(), isDir: false, mimeType: 'video/mp4' },
          { name: 'Musica_Relax.mp3', size: 4048576, mtime: new Date().toISOString(), isDir: false, mimeType: 'audio/mpeg' },
        ];

        const filteredMock = mockFiles.filter(f => {
          if (perms.includes('all')) return true;
          if (perms.includes('video') && f.mimeType.startsWith('video/')) return true;
          if (perms.includes('image') && f.mimeType.startsWith('image/')) return true;
          if (perms.includes('audio') && f.mimeType.startsWith('audio/')) return true;
          return false;
        });

        setFiles(filteredMock);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/files?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    fetchFiles(path);
  };

  const goBack = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const newPath = parts.join('/');
    setCurrentPath(newPath);
    fetchFiles(newPath);
  };

  const handleFileClick = (file: FileInfo) => {
    if (file.isDir) {
      navigateTo(file.path || '');
    } else {
      handleEdit(file);
    }
  };

  const handleFileLongPressStart = (file: FileInfo) => {
    longPressTimer.current = setTimeout(() => {
      setFileActionMenu(file);
    }, 600);
  };

  const handleFileLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      await fetch(`${API_BASE_URL}/api/upload?path=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData,
      });
      fetchFiles();
      fetchStatus();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/files?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchFiles();
      fetchStatus();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/mkdir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, path: currentPath }),
      });
      fetchFiles();
    } catch (err) {
      console.error('Create folder failed:', err);
    }
  };

  const getFileIcon = (file: FileInfo) => {
    if (file.isDir) return <Folder className={cn("w-6 h-6", currentTheme.text)} fill="currentColor" style={{ fillOpacity: 0.2 }} />;
    const mimeType = file.mimeType;
    if (mimeType.startsWith('image/')) return <ImageIcon className={cn("w-6 h-6", currentTheme.success)} />;
    if (mimeType.startsWith('video/')) return <Play className={cn("w-6 h-6", currentTheme.info)} fill="currentColor" style={{ fillOpacity: 0.1 }} />;
    if (mimeType.startsWith('text/')) return <FileText className={cn("w-6 h-6", currentTheme.warning)} />;
    if (mimeType.includes('pdf')) return <File className={cn("w-6 h-6", currentTheme.danger)} />;
    return <File className={cn("w-6 h-6", currentTheme.muted)} />;
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 font-sans",
      currentTheme.selection,
      isDarkMode ? "bg-slate-950 text-slate-100" : cn("bg-slate-50", currentTheme.text)
    )}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col transition-all duration-300 border-r",
        isSidebarOpen ? "w-64" : "w-20",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
            isPoweredOn ? currentTheme.bg : "bg-slate-400"
          )}>
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <h1 className="font-bold text-xl tracking-tight">NASdroid 1.0</h1>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('nas')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group",
              activeTab === 'nas' 
                ? `${currentTheme.bg} text-white shadow-lg` 
                : isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Wifi className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold">Servidor NAS</span>}
          </button>
          <button 
            onClick={() => setActiveTab('local')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group",
              activeTab === 'local' 
                ? `${currentTheme.bg} text-white shadow-lg` 
                : isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <HardDrive className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold">Archivos Locales</span>}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group",
              activeTab === 'settings' 
                ? `${currentTheme.bg} text-white shadow-lg` 
                : isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold">Configuración</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
              isDarkMode ? `bg-slate-800 ${currentTheme.textLight}` : `bg-slate-100 ${currentTheme.text}`
            )}
          >
            {isDarkMode ? <Moon className="w-5 h-5 shrink-0" /> : <Sun className="w-5 h-5 shrink-0" />}
            {isSidebarOpen && <span className="font-bold">{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</span>}
          </button>
        </div>
      </aside>

      <div className={cn(
        "flex-1 transition-all duration-300",
        "md:ml-20",
        isSidebarOpen && "md:ml-64"
      )}>
        {/* Mobile-style Header (Hidden on Desktop) */}
        <header className={cn(
          "sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between transition-colors md:hidden",
          isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
        )}>
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPoweredOn(!isPoweredOn)}
            className="flex items-center gap-3 text-left pointer-events-auto"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all",
              isPoweredOn 
                ? `${currentTheme.bg} ${currentTheme.shadow}` 
                : "bg-slate-400 shadow-slate-200"
            )}>
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">NASdroid 1.0</h1>
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  isPoweredOn ? currentTheme.successBg : currentTheme.dangerBg
                )} />
                {isPoweredOn ? "Servidor Activo" : "Servidor Apagado"}
              </div>
            </div>
          </motion.button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSearching(!isSearching)}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              isSearching 
                ? `${currentTheme.bg} text-white shadow-lg` 
                : isDarkMode ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleTab('settings')}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              activeTab === 'settings' 
                ? `${currentTheme.bg} text-white shadow-lg` 
                : isDarkMode ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className={cn(
        "transition-all duration-500",
        !isPoweredOn && "grayscale pointer-events-none opacity-60"
      )}>
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={cn(
                "border-b overflow-hidden transition-colors",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar archivos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 transition-all",
                      currentTheme.accentRing,
                      isDarkMode ? "bg-slate-800 text-white" : cn("bg-slate-100", currentTheme.text)
                    )}
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors",
                        isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
                      )}
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
          {/* PC Interface Welcome (Desktop Only) */}
          <section className="hidden md:block">
            <div className={cn(
              "p-8 rounded-[2.5rem] border shadow-sm flex items-center justify-between transition-colors",
              isDarkMode ? `${currentTheme.bgDark} ${currentTheme.borderDark}` : `${currentTheme.bgLight} ${currentTheme.border}`
            )}>
              <div className="space-y-2">
                <h2 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : currentTheme.text)}>
                  Interfaz Web para PC
                </h2>
                <p className="text-slate-500 max-w-md">
                  Conéctate desde cualquier navegador en tu red local usando la dirección IP de tu dispositivo.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <code className={cn("px-4 py-2 rounded-xl text-lg font-mono font-bold", isDarkMode ? currentTheme.textLight : currentTheme.text)}>
                    http://{status?.ip || '192.168.1.100'}:3000
                  </code>
                  <button 
                    onClick={() => copyToClipboard(`http://${status?.ip}:3000`)}
                    className={cn(
                      "p-3 text-white rounded-xl transition-colors shadow-lg",
                      `${currentTheme.bg} ${currentTheme.bgHover} ${currentTheme.shadow}`
                    )}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className={cn("w-32 h-32 rounded-full flex items-center justify-center", isDarkMode ? "bg-slate-800" : "bg-white shadow-xl")}>
                  <Activity className={cn("w-16 h-16 animate-pulse", currentTheme.accent)} />
                </div>
              </div>
            </div>
          </section>
        {activeTab === 'nas' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Bento Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={cn(
                "col-span-1 lg:col-span-2 rounded-[2rem] border shadow-sm transition-all duration-300 overflow-hidden",
                isNetworkExpanded ? (isDarkMode ? `bg-slate-900 ${currentTheme.accentBorder}` : `bg-white ${currentTheme.border} shadow-xl ${currentTheme.accentShadow}`) : (isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")
              )}>
                <div 
                  onClick={() => setIsNetworkExpanded(!isNetworkExpanded)}
                  className={cn(
                    "w-full p-6 flex justify-between items-center text-left transition-colors cursor-pointer",
                    isNetworkExpanded && (isDarkMode ? currentTheme.bgDark : currentTheme.bgLight)
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors", 
                      isNetworkExpanded ? `${currentTheme.bg} text-white` : (isDarkMode ? `bg-slate-800 ${currentTheme.textLight}` : `${currentTheme.bgLight} ${currentTheme.text}`)
                    )}>
                      <Wifi className="w-7 h-7" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : currentTheme.textLight)}>Red Local</p>
                      <div className="flex items-center gap-2">
                        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : currentTheme.text)}>{status?.ip || 'Detectando...'}</h2>
                        {status?.ip && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(status.ip);
                            }}
                            className={cn(
                              "p-1.5 rounded-lg transition-all",
                              isDarkMode ? `bg-slate-800 text-slate-400 hover:${currentTheme.textLight}` : `bg-slate-100 text-slate-500 hover:${currentTheme.text}`
                            )}
                          >
                            {copied ? <Check className={cn("w-3.5 h-3.5", currentTheme.accent)} /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isNetworkExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-800" : "bg-slate-100")}
                  >
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isNetworkExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-slate-500">IP del Servidor:</span>
                        <code className={cn("px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono", isDarkMode ? currentTheme.textLight : currentTheme.text)}>
                          {status?.ip}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(status?.ip || '')}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            isDarkMode ? `bg-slate-800 text-slate-400 hover:${currentTheme.textLight}` : `bg-slate-100 text-slate-500 hover:${currentTheme.text}`
                          )}
                        >
                          {copied ? <Check className={cn("w-3.5 h-3.5", currentTheme.accent)} /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Storage Visualization Bar */}
                      {status?.deviceStorage && (
                        <div className="mb-4">
                          <div className="flex justify-between items-end mb-1.5">
                            <p className="text-xs font-bold text-slate-500">Almacenamiento del Dispositivo</p>
                            <p className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              status.deviceStorage.free < 20 * 1024 * 1024 * 1024 
                                ? `${currentTheme.dangerLight} ${currentTheme.danger}` 
                                : isDarkMode ? currentTheme.mutedBg : "bg-slate-100 text-slate-600"
                            )}>
                              {status.deviceStorage.free < 20 * 1024 * 1024 * 1024 ? "ESPACIO BAJO DISPONIBLE" : "ESTADO ÓPTIMO"}
                            </p>
                          </div>
                          <div className={cn("h-3 w-full rounded-full overflow-hidden flex", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
                            <div 
                              className={cn(
                                "h-full transition-all duration-1000",
                                status.deviceStorage.free < 20 * 1024 * 1024 * 1024 ? currentTheme.dangerBg : currentTheme.accentBg
                              )}
                              style={{ width: `${(status.deviceStorage.used / status.deviceStorage.total) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-medium">
                            <span>Usado: {formatSize(status.deviceStorage.used)}</span>
                            <span>Libre: {formatSize(status.deviceStorage.free)}</span>
                            <span>Total: {formatSize(status.deviceStorage.total)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className={cn("w-4 h-4", currentTheme.accent)} />
                          Sin Contraseña
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Battery className={cn("w-4 h-4", currentTheme.accent)} />
                          Optimizado
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={cn(
                "rounded-[2rem] text-white shadow-xl flex flex-col transition-all duration-300 overflow-hidden",
                isStorageExpanded ? (isDarkMode ? `${currentTheme.bg} ${currentTheme.shadowDark}` : `${currentTheme.bgHover} ${currentTheme.shadow}`) : (isDarkMode ? `${currentTheme.bgDark} border ${currentTheme.borderDark}` : currentTheme.bg)
              )}>
                <button 
                  onClick={() => setIsStorageExpanded(!isStorageExpanded)}
                  className={cn(
                    "w-full p-6 flex justify-between items-center text-left transition-colors",
                    isStorageExpanded && "bg-black/10"
                  )}
                >
                  <div>
                    <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", currentTheme.textAccent)}>Almacenamiento</p>
                    <h2 className="text-2xl font-bold leading-none">{formatSize(status?.storageUsed || 0)}</h2>
                  </div>
                  <motion.div
                    animate={{ rotate: isStorageExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="p-2 rounded-full bg-white/10"
                  >
                    <ChevronDown className={cn("w-6 h-6", currentTheme.textAccent)} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isStorageExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 pt-2"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Imágenes</span>
                          <span>{formatSize(storageBreakdown.images)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="flex items-center gap-1.5"><Play className="w-3 h-3" /> Videos</span>
                          <span>{formatSize(storageBreakdown.videos)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Audio</span>
                          <span>{formatSize(storageBreakdown.audio)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Otros</span>
                          <span>{formatSize(storageBreakdown.others)}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className={cn("text-[10px] uppercase font-bold tracking-wider", currentTheme.textAccent)}>{status?.fileCount || 0} archivos totales</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Remote Devices Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className={cn("font-bold flex items-center gap-2", isDarkMode ? "text-white" : currentTheme.text)}>
                  <Wifi className={cn("w-4 h-4", currentTheme.accent)} />
                  Dispositivos en Red
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Auto-Discovery</span>
                  <button 
                    onClick={refreshDevices}
                    disabled={isScanning}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      isDarkMode ? `bg-slate-800 text-slate-400 hover:${currentTheme.textLight}` : `bg-slate-100 text-slate-500 hover:${currentTheme.text}`,
                      isScanning && "animate-spin"
                    )}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {status?.remoteDevices?.map(device => {
                  const settings = deviceSettings[device.id] || { allowed: true, permissions: ['video'] };
                  return (
                    <motion.button
                      key={device.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDevice(device)}
                      className={cn(
                        "flex-shrink-0 p-4 rounded-3xl border shadow-sm min-w-[160px] text-left transition-all",
                        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                        !settings.allowed && "grayscale opacity-50"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative", isDarkMode ? "bg-slate-800" : currentTheme.bgLight)}>
                        <HardDrive className={cn("w-5 h-5", currentTheme.text)} />
                        {!settings.allowed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X className={cn("w-6 h-6 stroke-[3px]", currentTheme.danger)} />
                          </div>
                        )}
                      </div>
                      <h4 className={cn("font-bold text-sm truncate", isDarkMode ? "text-white" : currentTheme.text)}>{device.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{device.ip}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", settings.allowed ? currentTheme.successBg : currentTheme.mutedBg)} />
                        <span className={cn("text-[10px] font-bold uppercase", settings.allowed ? currentTheme.success : currentTheme.muted)}>
                          {settings.allowed ? "Conectado" : "Denegado"}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'local' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                {currentPath && !connectedDeviceId && (
                  <button onClick={goBack} className="p-1 hover:bg-slate-100 rounded-full">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <h3 className={cn("font-bold", isDarkMode ? "text-white" : currentTheme.text)}>
                  {connectedDeviceId 
                    ? `Archivos de ${status?.remoteDevices?.find(d => d.id === connectedDeviceId)?.name}`
                    : currentPath ? `.../${currentPath.split('/').pop()}` : 'Archivos Locales'}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                {!connectedDeviceId && !isReadOnly && (
                  <>
                    <button 
                      onClick={() => {
                        const name = prompt('Nombre de la carpeta:');
                        if (name) handleCreateFolder(name);
                      }}
                      className={cn(
                        "p-2 rounded-xl transition-all border text-xs font-bold flex items-center gap-2",
                        isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Carpeta
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "p-2 rounded-xl transition-all border text-xs font-bold flex items-center gap-2",
                        isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                      )}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Subir
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleUpload} 
                      multiple 
                      className="hidden" 
                    />
                  </>
                )}
                <button 
                  onClick={() => {
                    setConnectedDeviceId(null);
                    fetchFiles('');
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all border text-xs font-bold flex items-center gap-2",
                    !connectedDeviceId 
                      ? `${currentTheme.bg} ${currentTheme.accentBorder} text-white` 
                      : isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                  )}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  Local
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setIsDeviceSelectorOpen(!isDeviceSelectorOpen)}
                    className={cn(
                      "p-2 rounded-xl transition-all border text-xs font-bold flex items-center gap-2",
                      connectedDeviceId 
                        ? `${currentTheme.bg} ${currentTheme.accentBorder} text-white` 
                        : isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                    )}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    Red
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isDeviceSelectorOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isDeviceSelectorOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                          "absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border overflow-hidden z-50",
                          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                        )}
                      >
                        <div className={cn("p-3 border-b text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400")}>
                          Dispositivos Disponibles
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {status?.remoteDevices?.map(device => {
                            const settings = deviceSettings[device.id] || { allowed: true, permissions: 'all' };
                            return (
                              <button
                                key={device.id}
                                disabled={!settings.allowed}
                                onClick={() => {
                                  setConnectedDeviceId(device.id);
                                  setIsDeviceSelectorOpen(false);
                                  fetchFiles();
                                }}
                                className={cn(
                                  "w-full p-4 text-left text-xs font-bold transition-colors flex items-center justify-between group",
                                  !settings.allowed && "opacity-40 cursor-not-allowed",
                                  connectedDeviceId === device.id ? `${currentTheme.bg} text-white` : isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <HardDrive className={cn("w-4 h-4", connectedDeviceId === device.id ? "text-white" : currentTheme.accent)} />
                                  <div className="flex flex-col">
                                    <span>{device.name}</span>
                                    <span className={cn("text-[9px] font-medium opacity-60", connectedDeviceId === device.id ? currentTheme.textAccent : "text-slate-500")}>{device.ip}</span>
                                  </div>
                                </div>
                                {connectedDeviceId === device.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className={cn(
              "rounded-3xl border shadow-sm overflow-hidden transition-colors",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <div className={cn("w-8 h-8 border-4 border-t-transparent rounded-full animate-spin", currentTheme.accentBorder)} />
                  <p className="text-sm text-slate-500">Cargando archivos...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                    <File className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <p className={cn("font-bold", isDarkMode ? "text-white" : currentTheme.text)}>No se encontraron archivos</p>
                    <p className="text-sm text-slate-500">Intenta con otra búsqueda o sube archivos</p>
                  </div>
                </div>
              ) : (
                <div className={cn("divide-y", isDarkMode ? "divide-slate-800" : "divide-slate-100")}>
                  {filteredFiles.map((file, idx) => (
                      <motion.div 
                        key={file.path || file.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "group flex items-center justify-between p-4 transition-colors cursor-pointer select-none",
                          isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
                        )}
                        onClick={() => handleFileClick(file)}
                        onMouseDown={() => handleFileLongPressStart(file)}
                        onMouseUp={handleFileLongPressEnd}
                        onMouseLeave={handleFileLongPressEnd}
                        onTouchStart={() => handleFileLongPressStart(file)}
                        onTouchEnd={handleFileLongPressEnd}
                      >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          isDarkMode ? "bg-slate-800 group-hover:bg-slate-700" : "bg-slate-50 group-hover:bg-white"
                        )}>
                          {getFileIcon(file)}
                        </div>
                        <div className="min-w-0">
                          <h4 className={cn("font-semibold truncate pr-4", isDarkMode ? "text-white" : currentTheme.text)}>{file.name}</h4>
                          <p className="text-xs text-slate-400">
                            {file.isDir ? 'Carpeta' : formatSize(file.size)} • {new Date(file.mtime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!file.isDir && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={`${API_BASE_URL}/api/download?path=${encodeURIComponent(file.path || file.name)}`} 
                            download 
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              isDarkMode ? `hover:bg-slate-700 text-slate-400 hover:${currentTheme.textLight}` : `hover:bg-white text-slate-600 hover:${currentTheme.text}`
                            )}
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(file.path || file.name);
                            }}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              isDarkMode ? "hover:bg-slate-700 text-slate-400 hover:text-red-400" : "hover:bg-white text-slate-600 hover:text-red-600"
                            )}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={cn(
              "p-8 rounded-[2.5rem] border shadow-sm text-center transition-colors",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6", isDarkMode ? "bg-slate-800" : currentTheme.bgLight)}>
                <Info className={cn("w-10 h-10", currentTheme.text)} />
              </div>
              <h2 className={cn("text-2xl font-bold mb-2", isDarkMode ? "text-white" : currentTheme.text)}>Información del Sistema</h2>
              <p className="text-slate-500 mb-8">Estadísticas detalladas de tu servidor NASdroid 1.0.</p>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dispositivo</p>
                  <p className={cn("font-bold", isDarkMode ? "text-slate-200" : currentTheme.text)}>{status?.deviceName}</p>
                </div>
                <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Uptime</p>
                  <p className={cn("font-bold", isDarkMode ? "text-slate-200" : currentTheme.text)}>{Math.floor((status?.uptime || 0) / 60)} min</p>
                </div>
                <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CPU</p>
                  <div className="flex items-center gap-2">
                    <Cpu className={cn("w-4 h-4", currentTheme.accent)} />
                    <p className={cn("font-bold", isDarkMode ? "text-slate-200" : currentTheme.text)}>2.4%</p>
                  </div>
                </div>
                <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Actividad</p>
                  <div className="flex items-center gap-2">
                    <Activity className={cn("w-4 h-4", currentTheme.accent)} />
                    <p className={cn("font-bold", isDarkMode ? "text-slate-200" : currentTheme.text)}>Estable</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-6 rounded-3xl border shadow-sm transition-colors",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <h3 className={cn("font-bold mb-4", isDarkMode ? "text-white" : currentTheme.text)}>Configuración Rápida</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-colors",
                    isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className={cn("w-5 h-5", currentTheme.textLight)} /> : <Sun className={cn("w-5 h-5", currentTheme.warning)} />}
                    <span className={cn("font-semibold", isDarkMode ? "text-slate-200" : "text-slate-700")}>Modo Oscuro</span>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    isDarkMode ? currentTheme.bg : "bg-slate-200"
                  )}>
                    <motion.div 
                      animate={{ x: isDarkMode ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </div>
                </button>
                <button 
                  onClick={() => setIsReadOnly(!isReadOnly)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-colors",
                    isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <span className={cn("font-semibold", isDarkMode ? "text-slate-200" : "text-slate-700")}>Modo Solo Lectura</span>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    isReadOnly ? currentTheme.bg : "bg-slate-200"
                  )}>
                    <motion.div 
                      animate={{ x: isReadOnly ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </div>
                </button>
                <button 
                  onClick={() => setIsBatterySaving(!isBatterySaving)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-colors",
                    isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <span className={cn("font-semibold", isDarkMode ? "text-slate-200" : "text-slate-700")}>Ahorro de Batería</span>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    isBatterySaving ? currentTheme.bg : "bg-slate-200"
                  )}>
                    <motion.div 
                      animate={{ x: isBatterySaving ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </div>
                </button>

                <div className={cn(
                  "w-full p-4 rounded-2xl space-y-4",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-2">
                    <Palette className={cn("w-5 h-5", currentTheme.accent)} />
                    <span className={cn("font-semibold", isDarkMode ? "text-slate-200" : "text-slate-700")}>Color de la App</span>
                  </div>
                  <div className="flex gap-3 justify-between">
                    {Object.keys(theme).map((themeId) => {
                      const t = theme[themeId as keyof typeof theme];
                      return (
                        <button
                          key={themeId}
                          onClick={() => setAppColor(themeId)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                            t.bg,
                            appColor === themeId 
                              ? isDarkMode ? "border-white scale-110" : "border-slate-900 scale-110" 
                              : "border-transparent"
                          )}
                        >
                          {appColor === themeId && <Check className="w-5 h-5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  </div>

      {/* Floating Action Bar (Mobile only) */}
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 transition-all duration-500 md:hidden",
        !isPoweredOn && "grayscale pointer-events-none opacity-60"
      )}>
        <div className={cn(
          "backdrop-blur-lg rounded-full p-2 flex items-center justify-around shadow-2xl border transition-colors",
          isDarkMode ? "bg-slate-900/90 border-white/10" : "bg-white/90 border-slate-200"
        )}>
          <button 
            onClick={() => toggleTab('nas')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 transition-colors relative",
              activeTab === 'nas' ? (isDarkMode ? currentTheme.textLight : currentTheme.text) : "text-slate-400"
            )}
          >
            <Wifi className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">NAS</span>
            {activeTab === 'nas' && (
              <motion.div 
                layoutId="activeTab"
                className={cn("absolute inset-0 rounded-2xl -z-10", isDarkMode ? "bg-white/10" : currentTheme.bgLight)}
              />
            )}
          </button>
          
          <div className="w-px h-8 bg-white/10" />

          <button 
            onClick={() => toggleTab('local')}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1 transition-colors relative",
              activeTab === 'local' ? (isDarkMode ? currentTheme.textLight : currentTheme.text) : "text-slate-400"
            )}
          >
            <HardDrive className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Local</span>
            {activeTab === 'local' && (
              <motion.div 
                layoutId="activeTab"
                className={cn("absolute inset-0 rounded-2xl -z-10", isDarkMode ? "bg-white/10" : currentTheme.bgLight)}
              />
            )}
          </button>
        </div>
      </div>

      {/* Previews & Modals */}
      <AnimatePresence>
        {previewFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setPreviewFile(null)} className="p-2">
                  <X className="w-6 h-6" />
                </button>
                <h3 className="font-bold truncate max-w-[200px]">{previewFile.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a href={`${API_BASE_URL}/api/download?path=${encodeURIComponent(previewFile.path || previewFile.name)}`} download className="p-2">
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
              {previewFile.mimeType.startsWith('image/') ? (
                <img 
                  src={`${API_BASE_URL}/api/preview?path=${encodeURIComponent(previewFile.path || previewFile.name)}`} 
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : previewFile.mimeType.startsWith('video/') ? (
                <video 
                  controls 
                  className="max-w-full max-h-full rounded-lg"
                  src={`${API_BASE_URL}/api/preview?path=${encodeURIComponent(previewFile.path || previewFile.name)}`}
                />
              ) : (
                <div className="bg-white/5 p-12 rounded-3xl flex flex-col items-center gap-4 text-white/60">
                  <FileText className="w-24 h-24" />
                  <p>Previsualización no disponible para este tipo de archivo</p>
                  <a 
                    href={`${API_BASE_URL}/api/download?path=${encodeURIComponent(previewFile.path || previewFile.name)}`} 
                    download
                    className="bg-white text-black px-6 py-2 rounded-full font-bold"
                  >
                    Descargar para ver
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center transition-colors",
                isDarkMode ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6", currentTheme.dangerLight)}>
                <AlertCircle className={cn("w-8 h-8", currentTheme.danger)} />
              </div>
              <h3 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : currentTheme.text)}>¿Eliminar archivo?</h3>
              <p className="text-slate-500 mb-8">Esta acción no se puede deshacer. El archivo se borrará permanentemente del NAS.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl font-bold transition-colors",
                    isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className={cn("flex-1 py-3 rounded-2xl font-bold text-white transition-colors shadow-lg", currentTheme.dangerBg, currentTheme.shadow)}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {editingFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 flex flex-col transition-colors",
              isDarkMode ? "bg-slate-950" : "bg-white"
            )}
          >
            <div className={cn(
              "p-4 flex items-center justify-between border-b transition-colors",
              isDarkMode ? "border-slate-800" : "border-slate-200"
            )}>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditingFile(null)} className={cn("p-2", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  <X className="w-6 h-6" />
                </button>
                <h3 className={cn("font-bold truncate max-w-[200px]", isDarkMode ? "text-white" : currentTheme.text)}>{editingFile.name}</h3>
              </div>
              <button 
                onClick={saveEdit}
                className={cn("text-white px-6 py-2 rounded-full font-bold shadow-lg", currentTheme.bg, currentTheme.shadow)}
              >
                Guardar
              </button>
            </div>
            <textarea 
              className={cn(
                "flex-1 p-6 font-mono text-sm outline-none resize-none transition-colors",
                isDarkMode ? "bg-slate-900 text-slate-200" : cn("bg-slate-50", currentTheme.text)
              )}
              value={editingFile.content}
              onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
              spellCheck={false}
            />
          </motion.div>
        )}

        {selectedDevice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl transition-colors",
                isDarkMode ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center relative", isDarkMode ? "bg-slate-800" : currentTheme.bgLight)}>
                  <HardDrive className={cn("w-8 h-8", currentTheme.text)} />
                  {!(deviceSettings[selectedDevice.id]?.allowed ?? true) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <X className={cn("w-10 h-10 stroke-[3px]", currentTheme.danger)} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedDevice(null)}
                  className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <h3 className={cn("text-2xl font-bold mb-1", isDarkMode ? "text-white" : currentTheme.text)}>{selectedDevice.name}</h3>
              <p className="text-slate-500 mb-6 font-mono text-sm">{selectedDevice.ip}</p>
              
              <div className="space-y-4 mb-8">
                <div className={cn("p-4 rounded-2xl flex items-center justify-between", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={cn("w-5 h-5", currentTheme.accent)} />
                    <span className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>Conexión Permitida</span>
                  </div>
                  <button 
                    onClick={() => {
                      const current = deviceSettings[selectedDevice.id] || { allowed: true, permissions: ['video'] };
                      setDeviceSettings({
                        ...deviceSettings,
                        [selectedDevice.id]: { ...current, allowed: !current.allowed }
                      });
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      (deviceSettings[selectedDevice.id]?.allowed ?? true) ? currentTheme.bg : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      (deviceSettings[selectedDevice.id]?.allowed ?? true) ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div className={cn("p-4 rounded-2xl space-y-3", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <p className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-slate-400" : "text-slate-500")}>Permisos de Acceso</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', 'video', 'image', 'audio'].map((perm) => {
                      const current = deviceSettings[selectedDevice.id] || { allowed: true, permissions: ['video'] };
                      const isSelected = current.permissions.includes(perm as any);
                      
                      return (
                        <button
                          key={perm}
                          onClick={() => {
                            let newPerms: ('all' | 'video' | 'image' | 'audio')[] = [...current.permissions];
                            if (perm === 'all') {
                              newPerms = ['all'];
                            } else {
                              // If 'all' is selected and we select something else, remove 'all'
                              if (newPerms.includes('all')) {
                                newPerms = [perm as any];
                              } else {
                                if (isSelected) {
                                  newPerms = newPerms.filter(p => p !== perm);
                                  // Default to video if nothing selected
                                  if (newPerms.length === 0) newPerms = ['video'];
                                } else {
                                  newPerms.push(perm as any);
                                }
                              }
                            }
                            setDeviceSettings({
                              ...deviceSettings,
                              [selectedDevice.id]: { ...current, permissions: newPerms }
                            });
                          }}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                            isSelected
                              ? `${currentTheme.bg} ${currentTheme.accentBorder} text-white`
                              : isDarkMode ? "bg-slate-700 border-slate-600 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                          )}
                        >
                          {perm === 'all' ? 'Todo' : perm.charAt(0).toUpperCase() + perm.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={cn("p-4 rounded-2xl flex items-center justify-between", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                  <div className="flex items-center gap-3">
                    <Activity className={cn("w-5 h-5", currentTheme.accent)} />
                    <span className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>Latencia</span>
                  </div>
                  <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>12ms</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedDevice(null)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-colors",
                    isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => {
                    const settings = deviceSettings[selectedDevice.id] || { allowed: true, permissions: ['video'] };
                    if (!settings.allowed) {
                      alert("La conexión con este dispositivo está denegada.");
                      return;
                    }
                    setConnectedDeviceId(selectedDevice.id);
                    setActiveTab('local');
                    setSelectedDevice(null);
                    fetchFiles();
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-white transition-colors shadow-lg",
                    (deviceSettings[selectedDevice.id]?.allowed ?? true) 
                      ? `${currentTheme.bg} ${currentTheme.bgHover} ${currentTheme.shadow}` 
                      : "bg-slate-400 cursor-not-allowed"
                  )}
                >
                  Conectar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {fileActionMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl transition-colors",
                isDarkMode ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>
                    {getFileIcon(fileActionMenu)}
                  </div>
                  <div>
                    <h3 className={cn("text-lg font-bold truncate max-w-[200px]", isDarkMode ? "text-white" : currentTheme.text)}>{fileActionMenu.name}</h3>
                    <p className="text-xs text-slate-500">{formatSize(fileActionMenu.size)} • {new Date(fileActionMenu.mtime).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFileActionMenu(null)}
                  className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Preview Area */}
              {(fileActionMenu.mimeType?.startsWith('image/') || fileActionMenu.mimeType?.startsWith('video/')) && (
                <div className={cn("w-full aspect-video rounded-3xl overflow-hidden mb-6 border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                  {fileActionMenu.mimeType?.startsWith('image/') ? (
                    <img 
                      src={`${API_BASE_URL}/api/preview?path=${encodeURIComponent(fileActionMenu.path || fileActionMenu.name)}`} 
                      alt={fileActionMenu.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <video 
                      src={`${API_BASE_URL}/api/preview?path=${encodeURIComponent(fileActionMenu.path || fileActionMenu.name)}`}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 mb-6">
                <button 
                  onClick={() => {
                    handleEdit(fileActionMenu);
                    setFileActionMenu(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors",
                    isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <Play className={cn("w-5 h-5", currentTheme.accent)} />
                  Previsualizar Pantalla Completa
                </button>
                <a 
                  href={`${API_BASE_URL}/api/download?path=${encodeURIComponent(fileActionMenu.path || fileActionMenu.name)}`}
                  download
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors",
                    isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <Download className={cn("w-5 h-5", currentTheme.accent)} />
                  Descargar
                </a>
                <button 
                  onClick={() => {
                    copyToClipboard(`${window.location.origin}/api/download?path=${encodeURIComponent(fileActionMenu.path || fileActionMenu.name)}`);
                    setFileActionMenu(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors",
                    isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <Copy className={cn("w-5 h-5", currentTheme.accent)} />
                  Compartir Enlace
                </button>
                {!isReadOnly && (
                  <button 
                    onClick={() => {
                      setDeleteConfirm(fileActionMenu.path || fileActionMenu.name);
                      setFileActionMenu(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors",
                      isDarkMode ? "hover:bg-red-900/20 text-red-400" : "hover:bg-red-50 text-red-600"
                    )}
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar
                  </button>
                )}
              </div>

              <button 
                onClick={() => setFileActionMenu(null)}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-colors",
                  isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
