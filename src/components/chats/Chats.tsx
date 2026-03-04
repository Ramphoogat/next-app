"use client";
import React, { useState, useRef } from "react";
import {
    FiSearch,
    FiMoreVertical,
    FiSend,
    FiMic,
    FiPlusCircle,
    FiPhone,
    FiVideo,
    FiChevronLeft,
    FiMessageSquare,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
    id: string;
    name: string;
    avatarLetter: string;
    avatarColor: string; // tailwind bg class
    lastMessage: string;
    time: string;
    unread: number;
    isOnline?: boolean;
    isGroup?: boolean;
}

// ─── Empty-state placeholder conversations (no real data) ─────────────────────
const PLACEHOLDER_CONVERSATIONS: Conversation[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({
    letter,
    color,
    size = "md",
    isOnline,
}: {
    letter: string;
    color: string;
    size?: "sm" | "md" | "lg";
    isOnline?: boolean;
}) => {
    const sizeClass = { sm: "size-9", md: "size-11", lg: "size-12" }[size];
    const textSize = { sm: "text-sm", md: "text-base", lg: "text-lg" }[size];
    return (
        <div className="relative shrink-0">
            <div
                className={`${sizeClass} ${color} rounded-2xl flex items-center justify-center font-black text-white ${textSize} shadow-md`}
            >
                {letter}
            </div>
            {isOnline !== undefined && (
                <span
                    className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-gray-900 ${isOnline ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                />
            )}
        </div>
    );
};

const ConversationItem = ({
    conv,
    isActive,
    onClick,
}: {
    conv: Conversation;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left group ${isActive
                ? "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
            }`}
    >
        <Avatar letter={conv.avatarLetter} color={conv.avatarColor} isOnline={conv.isOnline} />
        <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
                <span
                    className={`text-sm font-bold truncate ${isActive
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                >
                    {conv.name}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 font-semibold">
                    {conv.time}
                </span>
            </div>
            <div className="flex items-center justify-between gap-1 mt-0.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                    <span className="shrink-0 size-5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">
                        {conv.unread}
                    </span>
                )}
            </div>
        </div>
    </button>
);

// ─── Empty state for conversation list ────────────────────────────────────────
const NoConversations = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="size-16 rounded-3xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center">
            <FiMessageSquare className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Start a new chat to get going</p>
        </div>
    </div>
);

// ─── Empty state for message area (no conversation selected) ──────────────────
const NoChatSelected = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
        <div className="size-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/10 dark:to-purple-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-xl shadow-indigo-500/10">
            <FiMessageSquare className="w-9 h-9 text-indigo-400 dark:text-indigo-500" />
        </div>
        <div className="space-y-2">
            <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">
                Select a conversation
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed max-w-xs">
                Pick a chat from the list on the left, or start a new conversation.
            </p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-black shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 active:scale-95 flex items-center gap-2">
            <FiPlusCircle className="w-4 h-4" />
            New Conversation
        </button>
    </div>
);

// ─── Message area empty state (conversation selected but no messages) ─────────
const NoMessages = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6 py-10">
        <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <FiMessageSquare className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No messages yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Say hello to start the conversation!</p>
    </div>
);

// ─── Main Chats Component ─────────────────────────────────────────────────────

const Chats: React.FC = () => {
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showMobileList, setShowMobileList] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    const conversations = PLACEHOLDER_CONVERSATIONS;

    const filtered = conversations.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(search.toLowerCase())
    );

    const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

    const handleSelectConv = (id: string) => {
        setActiveConvId(id);
        setShowMobileList(false);
    };

    const handleSend = () => {
        if (!messageInput.trim()) return;
        // Real send logic goes here
        setMessageInput("");
        inputRef.current?.focus();
    };

    return (
        <div className="w-full h-full flex overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 animate-in fade-in duration-500">

            {/* ── LEFT: Conversation List ─────────────────────────────────── */}
            <aside
                className={`
                    flex flex-col shrink-0 border-r border-gray-100 dark:border-gray-800
                    bg-gray-50/60 dark:bg-gray-900
                    w-full md:w-80 lg:w-[22rem] xl:w-96
                    ${showMobileList ? "flex" : "hidden md:flex"}
                    transition-all
                `}
            >
                {/* Header */}
                <div className="px-5 pt-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            Messages
                        </h2>
                        <button
                            className="size-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all"
                            title="New conversation"
                        >
                            <FiPlusCircle className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>
                </div>

                {/* Section label */}
                <div className="px-5 pb-2">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                        Recent
                    </span>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4 space-y-1">
                    {filtered.length === 0 ? (
                        <NoConversations />
                    ) : (
                        filtered.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conv={conv}
                                isActive={activeConvId === conv.id}
                                onClick={() => handleSelectConv(conv.id)}
                            />
                        ))
                    )}
                </div>
            </aside>

            {/* ── RIGHT: Chat Window ──────────────────────────────────────── */}
            <div
                className={`
                    flex-1 flex flex-col min-w-0
                    bg-white dark:bg-gray-900
                    ${!showMobileList ? "flex" : "hidden md:flex"}
                `}
            >
                {activeConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Mobile back button */}
                                <button
                                    className="md:hidden p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
                                    onClick={() => setShowMobileList(true)}
                                >
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>
                                <Avatar
                                    letter={activeConv.avatarLetter}
                                    color={activeConv.avatarColor}
                                    size="sm"
                                    isOnline={activeConv.isOnline}
                                />
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                        {activeConv.name}
                                    </p>
                                    <p className="text-[11px] font-semibold text-emerald-500">
                                        {activeConv.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="size-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all" title="Voice call">
                                    <FiPhone className="w-4 h-4" />
                                </button>
                                <button className="size-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all" title="Video call">
                                    <FiVideo className="w-4 h-4" />
                                </button>
                                <button className="size-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all" title="More options">
                                    <FiMoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
                            <NoMessages />
                        </div>

                        {/* Message Input */}
                        <div className="shrink-0 px-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                <button
                                    className="shrink-0 text-gray-400 hover:text-indigo-500 transition-colors"
                                    title="Attach"
                                >
                                    <FiPlusCircle className="w-5 h-5" />
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Write a message…"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    className="flex-1 bg-transparent text-sm font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none"
                                />
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        className="size-8 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center justify-center transition-all"
                                        title="Voice message"
                                    >
                                        <FiMic className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={!messageInput.trim()}
                                        className="size-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/30 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                        title="Send"
                                    >
                                        <FiSend className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2 font-medium">
                                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-bold">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-bold">Shift+Enter</kbd> for new line
                            </p>
                        </div>
                    </>
                ) : (
                    <NoChatSelected />
                )}
            </div>
        </div>
    );
};

export default Chats;
