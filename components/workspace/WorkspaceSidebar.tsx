"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    MessageSquare,
    MoreVertical,
    Pencil,
    Trash2,
    Check,
    X,
    Pin,
    PinOff,
    Search,
    Clock,
    Settings,
    User,
    Moon,
    Sun,
    LogOut,
    ChevronDown,
    Archive,
    Download,
    Share2,
    Globe,
    HelpCircle,
    Crown,
    BookOpen,
    ChevronRight,
} from "lucide-react";
import { updateChatTitle, deleteChatFromSupabase } from "@/lib/api/chats";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Subcomponents
// import SidebarSection from "./SidebarSection";
// import SearchModal from "./SearchModal";
// import SettingsPopover from "./SettingsPopover";

interface Chat {
    id: string;
    session_id: string;
    title: string | null;
    created_at: string;
    pinned?: boolean;
}

interface WorkspaceSidebarProps {
    sessionId: string;
    chats: Chat[];
    onChatsUpdate: () => void;
}

export default function WorkspaceSidebar({
    sessionId,
    chats,
    onChatsUpdate,
}: WorkspaceSidebarProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [pinnedCollapsed, setPinnedCollapsed] = useState(false);
    const [recentCollapsed, setRecentCollapsed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Optimistic state for chats
    const [optimisticChats, setOptimisticChats] = useState<Chat[]>(chats);

    useEffect(() => {
        setOptimisticChats(chats);
    }, [chats]);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    // Prepare conversations for search modal
    const conversations = optimisticChats.map((chat) => ({
        id: chat.id,
        title: chat.title || "Untitled Chat",
        preview: "Chat preview...", // You can enhance this
        updatedAt: chat.created_at,
    }));

    // Filter chats based on search
    const filteredChats = optimisticChats.filter((chat) =>
        (chat.title || "Untitled Chat")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    // Separate pinned and recent chats
    const pinnedChatsList = filteredChats.filter((chat) =>
        pinnedChats.has(chat.id)
    );
    const recentChatsList = filteredChats.filter(
        (chat) => !pinnedChats.has(chat.id)
    );

    const handleRename = (chatId: string) => {
        const chat = optimisticChats.find((c) => c.id === chatId);
        if (!chat) return;
        setEditingId(chatId);
        setEditTitle(chat.title || "Untitled Chat");
    };

    const handleSaveRename = async (chatId: string) => {
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }

        setOptimisticChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, title: editTitle } : c))
        );
        setEditingId(null);

        try {
            await updateChatTitle(chatId, editTitle);
            onChatsUpdate();
        } catch (error) {
            console.error("Failed to rename chat:", error);
            setOptimisticChats(chats);
            alert("Failed to rename chat. Please try again.");
        }
    };

    const handleCancelRename = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const handleDeleteClick = (chatId: string) => {
        setChatToDelete(chatId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!chatToDelete) return;

        setOptimisticChats((prev) => prev.filter((c) => c.id !== chatToDelete));
        setDeleteDialogOpen(false);

        try {
            await deleteChatFromSupabase(chatToDelete);
            onChatsUpdate();

            if (chatToDelete === sessionId) {
                const remainingChats = optimisticChats.filter(
                    (c) => c.id !== chatToDelete
                );
                if (remainingChats.length > 0) {
                    router.push(
                        `/workspace/${remainingChats[0].session_id}?chat=${remainingChats[0].id}`
                    );
                } else {
                    router.push(`/workspace/${optimisticChats[0]?.session_id || sessionId}`);
                }
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
            setOptimisticChats(chats);
            alert("Failed to delete chat. Please try again.");
        } finally {
            setChatToDelete(null);
        }
    };

    const togglePin = (chatId: string) => {
        setPinnedChats((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(chatId)) {
                newSet.delete(chatId);
            } else {
                newSet.add(chatId);
            }
            return newSet;
        });
    };

    const handleChatClick = (chat: Chat) => {
        router.push(`/workspace/${chat.session_id}?chat=${chat.id}`);
    };

    const handleNewChat = () => {
        router.push("/connect");
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
        document.documentElement.classList.toggle("dark");
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchModalOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {/* Sidebar Container */}
            <aside className="flex h-screen w-[240px] flex-col border-r border-stroke bg-sidebar">
                {/* Header with New Chat Button */}
                <div className="p-3">
                    <button
                        onClick={handleNewChat}
                        style={{ backgroundColor: '#1f1f1f', color: '#f1efe7' }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Search Button */}
                <div className="px-3 pb-3">
                    <button
                        onClick={() => setSearchModalOpen(true)}
                        className="flex w-full items-center gap-2 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                    >
                        <Search className="h-4 w-4" />
                        <span>Search chats...</span>
                        <kbd className="ml-auto rounded border border-stroke px-1.5 py-0.5 text-xs">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Scrollable Chat List */}
                {/* Scrollable Chat List */}
                <div className="flex-1 overflow-y-auto px-2">
                    <div className="space-y-4">
                        {/* Pinned Chats Section */}
                        {pinnedChatsList.length > 0 && (
                            <div className="mb-4">
                                <div className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Pin className="h-3.5 w-3.5" />
                                        <span>PINNED</span>
                                    </div>
                                    <button onClick={() => setPinnedCollapsed(!pinnedCollapsed)}>
                                        {pinnedCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                                {!pinnedCollapsed && (
                                    <div className="space-y-0.5">
                                        {/* <ChatItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={chat.id === sessionId}
                                                isEditing={editingId === chat.id}
                                                editTitle={editTitle}
                                                onEditTitleChange={setEditTitle}
                                                onSave={() => handleSaveRename(chat.id)}
                                                onCancel={handleCancelRename}
                                                onClick={() => handleChatClick(chat)}
                                                onRename={() => handleRename(chat.id)}
                                                onTogglePin={() => togglePin(chat.id)}
                                                onDelete={() => handleDeleteClick(chat.id)}
                                                isPinned={true}
                                                inputRef={inputRef}
                                            /> */}
                                        {pinnedChatsList.map((chat) => (
                                            <div key={chat.id} className="px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer truncate" onClick={() => handleChatClick(chat)}>
                                                {chat.title || "Untitled Chat"}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recent Chats Section */}
                        <div>
                            <div className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>RECENT</span>
                                </div>
                                <button onClick={() => setRecentCollapsed(!recentCollapsed)}>
                                    {recentCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                            {!recentCollapsed && (
                                <>
                                    {recentChatsList.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {/* {recentChatsList.map((chat) => (
                                                <ChatItem
                                                    key={chat.id}
                                                    chat={chat}
                                                    isActive={chat.id === sessionId}
                                                    isEditing={editingId === chat.id}
                                                    editTitle={editTitle}
                                                    onEditTitleChange={setEditTitle}
                                                    onSave={() => handleSaveRename(chat.id)}
                                                    onCancel={handleCancelRename}
                                                    onClick={() => handleChatClick(chat)}
                                                    onRename={() => handleRename(chat.id)}
                                                    onTogglePin={() => togglePin(chat.id)}
                                                    onDelete={() => handleDeleteClick(chat.id)}
                                                    isPinned={false}
                                                    inputRef={inputRef}
                                                />
                                            ))} */}
                                            {recentChatsList.map((chat) => (
                                                <div key={chat.id} className="px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer truncate" onClick={() => handleChatClick(chat)}>
                                                    {chat.title || "Untitled Chat"}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                                            {searchQuery ? "No chats found" : "No chats yet"}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer with User Settings */}
                <div className="border-t border-stroke p-2">
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-muted">
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">User</div>
                            <div className="truncate text-xs text-muted-foreground">
                                user@example.com
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </aside>

            {/* Search Modal Placeholder */}
            {searchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSearchModalOpen(false)}>
                    <div style={{ backgroundColor: 'hsl(var(--background))' }} className="w-full max-w-lg rounded-lg p-6 shadow-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="mb-4 text-lg font-semibold">Search Chats</h2>
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <div className="mt-4 max-h-[300px] overflow-y-auto">
                            {/* Simplified search results */}
                            {filteredChats.map(chat => (
                                <button
                                    key={chat.id}
                                    className="w-full px-4 py-2 text-left hover:bg-accent rounded"
                                    onClick={() => {
                                        handleChatClick(chat);
                                        setSearchModalOpen(false);
                                    }}
                                >
                                    {chat.title || "Untitled Chat"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {deleteDialogOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60"
                            onClick={() => setDeleteDialogOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stroke bg-popover p-6 shadow-xl"
                        >
                            <h2 className="mb-2 text-lg font-semibold">Delete Chat</h2>
                            <p className="mb-6 text-sm text-muted-foreground">
                                Are you sure you want to delete this chat? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteDialogOpen(false)}
                                    className="flex-1 rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// Chat Item Component
function ChatItem({
    chat,
    isActive,
    isEditing,
    editTitle,
    onEditTitleChange,
    onSave,
    onCancel,
    onClick,
    onRename,
    onTogglePin,
    onDelete,
    isPinned,
    inputRef,
}: {
    chat: Chat;
    isActive: boolean;
    isEditing: boolean;
    editTitle: string;
    onEditTitleChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onClick: () => void;
    onRename: () => void;
    onTogglePin: () => void;
    onDelete: () => void;
    isPinned: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 px-2">
                <Input
                    ref={inputRef}
                    value={editTitle}
                    onChange={(e) => onEditTitleChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSave();
                        if (e.key === "Escape") onCancel();
                    }}
                    className="h-8 border-stroke bg-transparent text-sm"
                />
                <button
                    onClick={onSave}
                    className="rounded-lg p-1.5 hover:bg-accent"
                >
                    <Check className="h-4 w-4" />
                </button>
                <button
                    onClick={onCancel}
                    className="rounded-lg p-1.5 hover:bg-accent"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="group relative">
            <button
                onClick={onClick}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${isActive
                    ? "bg-accent text-foreground"
                    : "text-foreground hover:bg-accent/50"
                    }`}
            >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                        {chat.title || "Untitled Chat"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                        {new Date(chat.created_at).toLocaleDateString()}
                    </div>
                </div>
            </button>

            {/* Context Menu */}
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        className="rounded-lg p-1 hover:bg-accent"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    <AnimatePresence>
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-stroke bg-popover p-1 shadow-xl"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRename();
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Rename</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTogglePin();
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                                    >
                                        {isPinned ? (
                                            <>
                                                <PinOff className="h-4 w-4" />
                                                <span>Unpin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Pin className="h-4 w-4" />
                                                <span>Pin</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span>Share</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                                    >
                                        <Archive className="h-4 w-4" />
                                        <span>Archive</span>
                                    </button>
                                    <div className="my-1 border-t border-stroke" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}