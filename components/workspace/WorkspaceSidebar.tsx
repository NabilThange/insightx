"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pin, PinOff, Pencil, Trash2, Clock, Search as SearchIcon } from "lucide-react";
import { updateChatTitle, deleteChatFromSupabase, getAllChats, EnhancedChat } from "@/lib/api/chats";
import { showToast } from "@/lib/utils/toast";
import { logger } from "@/lib/utils/logger";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PILL_COLORS = [
    { bg: "#dde4f5", text: "#1a3a8f" },
    { bg: "#d4edda", text: "#1a6b35" },
    { bg: "#fde8d8", text: "#8f3a1a" },
    { bg: "#f5d4f5", text: "#6b1a8f" },
    { bg: "#d4f0f5", text: "#1a6b75" },
    { bg: "#f5f5d4", text: "#6b6b1a" },
];

const getDeterministicColor = (filename: string) => {
    let hash = 0;
    for (let i = 0; i < filename.length; i++) hash = filename.charCodeAt(i) + ((hash << 5) - hash);
    return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
};

const formatTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
};

interface WorkspaceSidebarProps {
    sessionId: string;
    onChatsUpdate: () => void;
    sqlHistory?: string[];
}

export default function WorkspaceSidebar({ sessionId, onChatsUpdate, sqlHistory = [] }: WorkspaceSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeChatId = searchParams.get("chat");

    const [allChats, setAllChats] = useState<EnhancedChat[]>([]);
    const [allSessions, setAllSessions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);

    // ── Load — no auth, no user_id ─────────────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            const { data: sessions, error } = await supabase
                .from("sessions")
                .select("id, filename, created_at, row_count")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setAllSessions(sessions || []);

            const chats = await getAllChats();
            setAllChats(chats);

            const storedPins = localStorage.getItem("pinned_chats");
            if (storedPins) setPinnedChatIds(JSON.parse(storedPins));
        } catch (err) {
            console.error("Sidebar load error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [sessionId, loadData]);

    useEffect(() => {
        localStorage.setItem("pinned_chats", JSON.stringify(pinnedChatIds));
    }, [pinnedChatIds]);

    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setShowNewChatDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleRename = (chatId: string, currentTitle: string | null) => {
        setEditingId(chatId);
        setEditTitle(currentTitle || "Untitled Chat");
    };

    const saveRename = async (chatId: string) => {
        if (!editTitle.trim()) { setEditingId(null); return; }
        const snapshot = [...allChats];
        setAllChats(prev => prev.map(c => c.id === chatId ? { ...c, title: editTitle } : c));
        setEditingId(null);
        try {
            await updateChatTitle(chatId, editTitle);
            onChatsUpdate();
            showToast.success("Chat Renamed", `New title: ${editTitle}`);
        }
        catch {
            setAllChats(snapshot);
            showToast.error("Rename Failed", "Could not update the title in Supabase.");
        }
    };

    const confirmDelete = async (chatId: string) => {
        const snapshot = [...allChats];
        setAllChats(prev => prev.filter(c => c.id !== chatId));
        setDeleteConfirmId(null);
        try {
            await deleteChatFromSupabase(chatId);
            onChatsUpdate();
            showToast.success("Chat Deleted");
            if (activeChatId === chatId) router.push(`/workspace/${sessionId}`);
        } catch {
            setAllChats(snapshot);
            showToast.error("Delete Failed");
        }
    };

    const togglePin = (chatId: string) => {
        setPinnedChatIds(prev => {
            const isPinned = prev.includes(chatId);
            const next = isPinned ? prev.filter(id => id !== chatId) : [...prev, chatId];
            showToast.success(isPinned ? "Chat Unpinned" : "Chat Pinned");
            return next;
        });
    };

    const handleNewChat = (session?: any) => {
        if (!session && allSessions.length > 1) { setShowNewChatDropdown(v => !v); return; }
        const targetId = session?.id || allSessions[0]?.id;
        if (targetId) router.push(`/workspace/${targetId}`);
        setShowNewChatDropdown(false);
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const datasets = useMemo(() =>
        Array.from(new Set(allChats.map(c => c.filename))).sort()
        , [allChats]);

    const filteredChats = useMemo(() => allChats.filter(chat => {
        const matchesFilter = activeFilter === "ALL" || chat.filename === activeFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            (chat.title || "Untitled Chat").toLowerCase().includes(q) ||
            (chat.first_ai_message || "").toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    }), [allChats, activeFilter, searchQuery]);

    const pinnedList = filteredChats.filter(c => pinnedChatIds.includes(c.id));
    const recentList = filteredChats.filter(c => !pinnedChatIds.includes(c.id));

    return (
        <aside className="flex h-screen w-[280px] flex-col border-r border-stroke bg-[#f8f9fa] dark:bg-sidebar">

            {/* New Chat */}
            <div className="relative p-3" ref={dropdownRef}>
                <button
                    onClick={() => handleNewChat()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-sm font-medium text-white transition-all hover:bg-black/90 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" /><span>New Chat</span>
                </button>
                <AnimatePresence>
                    {showNewChatDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="absolute left-3 right-3 top-full z-20 mt-1 rounded-lg border border-stroke bg-white p-1.5 shadow-xl"
                        >
                            <button
                                onClick={() => { router.push("/connect"); setShowNewChatDropdown(false); }}
                                className="mb-1.5 flex w-full items-center gap-2 rounded-md border border-stroke bg-gray-50/50 px-3 py-2 text-left text-xs font-bold text-muted-foreground transition-all hover:border-black hover:bg-black hover:text-white"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>New Dataset</span>
                            </button>

                            <div className="mb-1 border-t border-stroke/50" />
                            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Select Dataset</p>

                            {allSessions.map(s => (
                                <button key={s.id} onClick={() => handleNewChat(s)}
                                    className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-accent transition-colors">
                                    <span className="truncate text-xs font-semibold">{s.filename}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {s.row_count?.toLocaleString()} rows · {formatTimeAgo(s.created_at)}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
                <div className="group relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-black" />
                    <input
                        type="text" placeholder="Search chats..." value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-white/50 py-2 pl-9 pr-12 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-stroke bg-white px-1 py-0.5 font-mono text-[9px] text-muted-foreground">⌘K</div>
                </div>
            </div>

            {/* Filter Pills */}
            {datasets.length > 0 && (
                <div className="px-3 pb-3">
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        <button onClick={() => setActiveFilter("ALL")}
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${activeFilter === "ALL" ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                            All · {allChats.length}
                        </button>
                        {datasets.map(name => {
                            const colors = getDeterministicColor(name);
                            const isActive = activeFilter === name;
                            const label = name.length > 12 ? name.slice(0, 12) + "…" : name;
                            return (
                                <button key={name} onClick={() => setActiveFilter(name)} title={name}
                                    className="whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all"
                                    style={{ backgroundColor: isActive ? colors.text : colors.bg, color: isActive ? colors.bg : colors.text }}>
                                    {label} · {allChats.filter(c => c.filename === name).length}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {loading ? (
                    <div className="flex flex-col gap-2 px-3 pt-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-black/5" />)}
                    </div>
                ) : (
                    <>
                        {pinnedList.length > 0 && (
                            <div className="mb-4">
                                <SectionHeader icon={<Pin className="h-3 w-3" />} label="Pinned" />
                                <div className="space-y-1">
                                    {pinnedList.map(chat => (
                                        <ChatRow key={chat.id} chat={chat} isActive={activeChatId === chat.id} isPinned
                                            editingId={editingId} editTitle={editTitle} setEditTitle={setEditTitle}
                                            saveRename={saveRename} cancelRename={() => setEditingId(null)}
                                            onRename={() => handleRename(chat.id, chat.title)}
                                            onTogglePin={() => togglePin(chat.id)}
                                            onDelete={() => setDeleteConfirmId(chat.id)}
                                            deleteConfirmId={deleteConfirmId}
                                            onDeleteCancel={() => setDeleteConfirmId(null)}
                                            onDeleteConfirm={() => confirmDelete(chat.id)}
                                            onClick={() => router.push(`/workspace/${chat.session_id}?chat=${chat.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <SectionHeader icon={<Clock className="h-3 w-3" />} label="Recent" />
                            <div className="space-y-1">
                                {recentList.map(chat => (
                                    <ChatRow key={chat.id} chat={chat} isActive={activeChatId === chat.id} isPinned={false}
                                        editingId={editingId} editTitle={editTitle} setEditTitle={setEditTitle}
                                        saveRename={saveRename} cancelRename={() => setEditingId(null)}
                                        onRename={() => handleRename(chat.id, chat.title)}
                                        onTogglePin={() => togglePin(chat.id)}
                                        onDelete={() => setDeleteConfirmId(chat.id)}
                                        deleteConfirmId={deleteConfirmId}
                                        onDeleteCancel={() => setDeleteConfirmId(null)}
                                        onDeleteConfirm={() => confirmDelete(chat.id)}
                                        onClick={() => router.push(`/workspace/${chat.session_id}?chat=${chat.id}`)}
                                    />
                                ))}
                            </div>
                            {recentList.length === 0 && (
                                <p className="py-8 text-center text-xs text-muted-foreground">
                                    {searchQuery ? "No chats match your search" : "No chats yet"}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* SQL History Panel */}
            {sqlHistory.length > 0 && (
                <div className="border-t border-stroke bg-white/30 p-3">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>📊</span>
                        <span>SQL History</span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {sqlHistory.slice(0, 5).map((query, index) => (
                            <div
                                key={index}
                                className="bg-white/80 border border-stroke rounded-md p-2 text-[10px] font-mono text-gray-700 hover:bg-white transition-colors cursor-pointer"
                                title={query}
                            >
                                <div className="truncate">{query.length > 60 ? query.slice(0, 60) + '...' : query}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-stroke bg-white/50 p-2">
                <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2">
                    <Avatar className="h-7 w-7 rounded-md">
                        <AvatarFallback className="rounded-md bg-black text-[10px] font-bold text-white">IX</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">InsightX</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                            {allChats.length} chat{allChats.length !== 1 ? "s" : ""} · {datasets.length} dataset{datasets.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </aside>
    );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="mb-2 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {icon}<span>{label}</span>
        </div>
    );
}

interface ChatRowProps {
    chat: EnhancedChat; isActive: boolean; isPinned: boolean;
    editingId: string | null; editTitle: string; setEditTitle: (v: string) => void;
    saveRename: (id: string) => void; cancelRename: () => void;
    onRename: () => void; onTogglePin: () => void; onDelete: () => void;
    deleteConfirmId: string | null; onDeleteCancel: () => void; onDeleteConfirm: () => void;
    onClick: () => void;
}

function ChatRow({ chat, isActive, isPinned, editingId, editTitle, setEditTitle, saveRename, cancelRename, onRename, onTogglePin, onDelete, deleteConfirmId, onDeleteCancel, onDeleteConfirm, onClick }: ChatRowProps) {
    const isEditing = editingId === chat.id;
    const isDeleting = deleteConfirmId === chat.id;
    const colors = getDeterministicColor(chat.filename);
    const initials = (chat.title || "Un").slice(0, 2).toUpperCase();
    const subtitle = chat.first_ai_message
        ? chat.first_ai_message.length > 55 ? `${chat.first_ai_message.slice(0, 55)}…` : chat.first_ai_message
        : "New chat session…";

    if (isEditing) return (
        <div className="flex items-center gap-2 px-3 py-2">
            <Input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveRename(chat.id); if (e.key === "Escape") cancelRename(); }}
                onBlur={() => saveRename(chat.id)}
                className="h-7 border-black/10 bg-white text-xs shadow-none focus-visible:ring-1 focus-visible:ring-black" />
        </div>
    );

    if (isDeleting) return (
        <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-600">
            <span>Delete this chat?</span>
            <div className="flex gap-3">
                <button onClick={onDeleteConfirm} className="hover:underline">Yes</button>
                <button onClick={onDeleteCancel} className="font-normal text-gray-400 hover:underline">No</button>
            </div>
        </div>
    );

    return (
        <div onClick={onClick}
            className={`group relative flex cursor-pointer flex-col rounded-lg px-3 py-2.5 transition-all hover:bg-white hover:shadow-sm ${isActive ? "bg-white shadow-sm ring-1 ring-black/5" : "bg-transparent"}`}>
            <div className="flex items-start gap-2.5">
                <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-black text-[10px] font-bold text-white">
                    {initials}
                    {isPinned && <Pin className="absolute -left-1 -top-1 h-2.5 w-2.5 fill-black text-black" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-[13px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>
                            {chat.title || "Untitled Chat"}
                        </span>
                        <div className="relative flex h-5 shrink-0 items-center">
                            <span className="truncate rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-opacity group-hover:opacity-0"
                                style={{ backgroundColor: colors.bg, color: colors.text, maxWidth: 72 }} title={chat.filename}>
                                {chat.filename.length > 10 ? chat.filename.slice(0, 10) + "…" : chat.filename}
                            </span>
                            {!isActive && (
                                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 scale-95 items-center gap-0.5 rounded border border-stroke bg-white p-0.5 opacity-0 shadow-sm transition-all group-hover:scale-100 group-hover:opacity-100">
                                    <button onClick={e => { e.stopPropagation(); onTogglePin(); }} className="rounded p-1 hover:bg-gray-100" title={isPinned ? "Unpin" : "Pin"}>
                                        {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); onRename(); }} className="rounded p-1 hover:bg-gray-100" title="Rename">
                                        <Pencil className="h-3 w-3" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11px] leading-tight text-muted-foreground/60">{subtitle}</p>
                    <div className="mt-1 flex justify-end">
                        <span className="text-[10px] text-muted-foreground/40">{formatTimeAgo(chat.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}