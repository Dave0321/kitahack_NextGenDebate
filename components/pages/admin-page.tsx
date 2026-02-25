"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { debateCards, removeCard, getCardsByCategory, restoreDefaultCards } from "@/lib/models/debate-card";
import { loadChallenges, saveChallenges, YoutubeChallenge, restoreDefaultChallenges } from "@/lib/models/youtube-challenge";
import { Trash2, Shield, Settings, Activity, List, RefreshCcw } from "lucide-react";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"content" | "prompts">("content");
  
  // Prompts State
  const [aiPrompt, setAiPrompt] = useState("");
  const [judgePrompt, setJudgePrompt] = useState("");
  const [moderatorPrompt, setModeratorPrompt] = useState("");
  const [topicPrompt, setTopicPrompt] = useState("");

  // Content State
  const [challenges, setChallenges] = useState<YoutubeChallenge[]>([]);
  const [trendingCards, setTrendingCards] = useState(getCardsByCategory('trending'));

  useEffect(() => {
    // Load prompts
    setAiPrompt(localStorage.getItem("admin_ai_opponent_prompt") || "Loading...");
    setJudgePrompt(localStorage.getItem("admin_judge_prompt") || "Loading...");
    setModeratorPrompt(localStorage.getItem("admin_moderator_prompt") || "Loading...");
    setTopicPrompt(localStorage.getItem("admin_topic_content_prompt") || "Loading...");
    
    // Load challenges
    setChallenges(loadChallenges().map(d => new YoutubeChallenge(d)));

    const syncContent = () => {
        setChallenges(loadChallenges().map(d => new YoutubeChallenge(d)));
        setTrendingCards(getCardsByCategory('trending'));
    }
    window.addEventListener("debate_me_challenges_updated", syncContent);
    window.addEventListener("debate_me_cards_updated", syncContent);
    return () => {
        window.removeEventListener("debate_me_challenges_updated", syncContent);
        window.removeEventListener("debate_me_cards_updated", syncContent);
    }
  }, []);

  const handleSavePrompts = () => {
    localStorage.setItem("admin_ai_opponent_prompt", aiPrompt);
    localStorage.setItem("admin_judge_prompt", judgePrompt);
    localStorage.setItem("admin_moderator_prompt", moderatorPrompt);
    localStorage.setItem("admin_topic_content_prompt", topicPrompt);
    alert("All 4 System Prompts saved successfully!");
  };

  const handleDeleteChallenge = (id: string) => {
    const next = challenges.filter(c => c.id !== id);
    setChallenges(next);
    saveChallenges(next);
  };

  const handleDeleteCard = (id: string) => {
    removeCard(id);
    setTrendingCards(getCardsByCategory('trending'));
  };

  const handleRestoreChallenges = () => {
    if (confirm("Are you sure you want to restore default live matches?")) {
      restoreDefaultChallenges();
    }
  };

  const handleRestoreCards = () => {
    if (confirm("Are you sure you want to restore default trending topics?")) {
      restoreDefaultCards();
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 pb-24">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10">
          <Shield className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage content and multi-layer AI behaviour</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b pb-4">
        <Button variant={activeTab === "content" ? "default" : "outline"} onClick={() => setActiveTab("content")}>
          <List className="mr-2 h-4 w-4" /> Content Moderation
        </Button>
        <Button variant={activeTab === "prompts" ? "default" : "outline"} onClick={() => setActiveTab("prompts")}>
          <Settings className="mr-2 h-4 w-4" /> AI Prompts (4 Layers)
        </Button>
      </div>

      {activeTab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Live Matches */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="h-5 w-5"/> Live Matches</h2>
              <Button variant="outline" size="sm" onClick={handleRestoreChallenges}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Restore Defaults
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {challenges.length === 0 && <p className="text-sm text-muted-foreground">No matches available.</p>}
              {challenges.map(ch => (
                <div key={ch.id} className="flex justify-between items-center p-3 border rounded-lg bg-secondary/50">
                  <div className="truncate pr-4">
                    <p className="font-semibold text-sm truncate">{ch.topic}</p>
                    <p className="text-xs text-muted-foreground">{ch.raisedBy} • {ch.status}</p>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteChallenge(ch.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Cards */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><List className="h-5 w-5"/> Trending Topics</h2>
              <Button variant="outline" size="sm" onClick={handleRestoreCards}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Restore Defaults
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {trendingCards.length === 0 && <p className="text-sm text-muted-foreground">No trending topics available.</p>}
              {trendingCards.map(card => (
                <div key={card.id} className="flex justify-between items-center p-3 border rounded-lg bg-secondary/50">
                  <div className="truncate pr-4">
                    <p className="font-semibold text-sm truncate">{card.title}</p>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteCard(card.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "prompts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-violet-500">1. AI Opponent</h2>
              <p className="text-xs text-muted-foreground">Controls how the AI argues during the debate.</p>
            </div>
            <Textarea 
              value={aiPrompt} 
              onChange={(e) => setAiPrompt(e.target.value)} 
              className="min-h-[250px] font-mono text-xs" 
            />
          </div>

          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-emerald-500">2. Post-Debate Judge</h2>
              <p className="text-xs text-muted-foreground">Determines scores, winner, and charity suggestions.</p>
            </div>
            <Textarea 
              value={judgePrompt} 
              onChange={(e) => setJudgePrompt(e.target.value)} 
              className="min-h-[250px] font-mono text-xs" 
            />
          </div>

          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-rose-500">3. Real-Time Moderator</h2>
              <p className="text-xs text-muted-foreground">Checks for profanity, off-topic, and fallacies in real time.</p>
            </div>
            <Textarea 
              value={moderatorPrompt} 
              onChange={(e) => setModeratorPrompt(e.target.value)} 
              className="min-h-[250px] font-mono text-xs" 
            />
          </div>

          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-amber-500">4. Topic Content Generator</h2>
              <p className="text-xs text-muted-foreground">Pre-loads hints and dynamic judge comments when a room opens.</p>
            </div>
            <Textarea 
              value={topicPrompt} 
              onChange={(e) => setTopicPrompt(e.target.value)} 
              className="min-h-[250px] font-mono text-xs" 
            />
          </div>

          <div className="col-span-full mt-4 flex justify-end">
            <Button size="lg" onClick={handleSavePrompts}>Save All Prompts</Button>
          </div>
        </div>
      )}
    </div>
  );
}