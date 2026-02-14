import { create } from 'zustand';

interface WorkspaceState {
    // Layout states
    isLeftSidebarOpen: boolean;
    isRightPanelOpen: boolean;
    rightPanelTab: 'dna' | 'sql' | 'python' | 'context';

    // Workspace mode
    workspaceMode: 'empty' | 'active';

    // Actions
    toggleLeftSidebar: () => void;
    toggleRightPanel: () => void;
    setRightPanelTab: (tab: 'dna' | 'sql' | 'python' | 'context') => void;
    setWorkspaceMode: (mode: 'empty' | 'active') => void;
    setLeftSidebarOpen: (isOpen: boolean) => void;
    setRightPanelOpen: (isOpen: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    isLeftSidebarOpen: true,
    isRightPanelOpen: true,
    rightPanelTab: 'dna',
    workspaceMode: 'empty',

    toggleLeftSidebar: () => {
        set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen }));
    },

    toggleRightPanel: () => {
        set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen }));
    },

    setRightPanelTab: (tab) => {
        set({ rightPanelTab: tab });
    },

    setWorkspaceMode: (mode) => {
        set({ workspaceMode: mode });
    },

    setLeftSidebarOpen: (isOpen) => {
        set({ isLeftSidebarOpen: isOpen });
    },

    setRightPanelOpen: (isOpen) => {
        set({ isRightPanelOpen: isOpen });
    },
}));
