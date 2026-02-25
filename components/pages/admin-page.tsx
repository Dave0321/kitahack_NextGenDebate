"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeCard, getCardsByCategory, restoreDefaultCards, addCard, DebateCard } from "@/lib/models/debate-card";
import { loadChallenges, saveChallenges, YoutubeChallenge, restoreDefaultChallenges } from "@/lib/models/youtube-challenge";
import { Trash2, Shield, Settings, Activity, List, RefreshCcw, Plus } from "lucide-react";

import { AI_OPPONENT_SYSTEM_PROMPT } from "@/lib/utils/ai-opponent";
import { JUDGE_SYSTEM_PROMPT, TOPIC_CONTENT_SYSTEM_PROMPT } from "@/lib/utils/debate-judge";
import { DEFAULT_MODERATOR_PROMPT } from "@/lib/utils/debate-moderator";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"content" | "prompts">("content");
  
  // Prompts State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTemp, setAiTemp] = useState(0.6);

  const [judgePrompt, setJudgePrompt] = useState("");
  const [judgeTemp, setJudgeTemp] = useState(0.2);

  const [moderatorPrompt, setModeratorPrompt] = useState("");
  const [modTemp, setModTemp] = useState(0.1);

  const [topicPrompt, setTopicPrompt] = useState("");
  const [topicTemp, setTopicTemp] = useState(0.2);

  // Content State
  const [challenges, setChallenges] = useState<YoutubeChallenge[]>([]);
  const [trendingCards, setTrendingCards] = useState(getCardsByCategory('trending'));

  useEffect(() => {
    // Load prompts
    setAiPrompt(localStorage.getItem("admin_ai_opponent_prompt") || AI_OPPONENT_SYSTEM_PROMPT);
    setAiTemp(parseFloat(localStorage.getItem("admin_ai_opponent_temperature") || "0.6"));

    setJudgePrompt(localStorage.getItem("admin_judge_prompt") || JUDGE_SYSTEM_PROMPT);
    setJudgeTemp(parseFloat(localStorage.getItem("admin_judge_temperature") || "0.2"));

    setModeratorPrompt(localStorage.getItem("admin_moderator_prompt") || DEFAULT_MODERATOR_PROMPT);
    setModTemp(parseFloat(localStorage.getItem("admin_moderator_temperature") || "0.1"));

    setTopicPrompt(localStorage.getItem("admin_topic_content_prompt") || TOPIC_CONTENT_SYSTEM_PROMPT);
    setTopicTemp(parseFloat(localStorage.getItem("admin_topic_content_temperature") || "0.2"));
    
    // Load content
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
    localStorage.setItem("admin_ai_opponent_temperature", aiTemp.toString());

    localStorage.setItem("admin_judge_prompt", judgePrompt);
    localStorage.setItem("admin_judge_temperature", judgeTemp.toString());

    localStorage.setItem("admin_moderator_prompt", moderatorPrompt);
    localStorage.setItem("admin_moderator_temperature", modTemp.toString());

    localStorage.setItem("admin_topic_content_prompt", topicPrompt);
    localStorage.setItem("admin_topic_content_temperature", topicTemp.toString());
    
    alert("All 4 System Prompts and Configurations saved successfully!");
  };

  // --- Content Management Handlers ---

  const handleAddChallenge = () => {
    const topic = prompt("Enter Debate Topic for Live Match:");
    if (!topic) return;
    const videoUrl = prompt("Enter YouTube URL:");
    if (!videoUrl) return;

    // Extract Video ID
    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : videoUrl;
    
    const sdg = prompt("Enter SDG Number (1-17):") || "16";

    const newChallenge = new YoutubeChallenge({
      id: `ch-${Date.now()}`,
      topic,
      videoId,
      raisedBy: "Admin",
      sdg,
      stance: "pro",
      status: "open",
      createdAt: new Date().toISOString()
    });

    const next = [...challenges, newChallenge];
    setChallenges(next);
    saveChallenges(next);
  };

  const handleAddCard = () => {
    const title = prompt("Enter Trending Topic Title:");
    if (!title) return;
    const description = prompt("Enter short description:");
    if (!description) return;
    const videoUrl = prompt("Enter YouTube URL (thumbnail will be extracted automatically):");
    if (!videoUrl) return;

    const sdg = prompt("Enter SDG Number (1-17):") || "4";

    addCard({
      id: `debate-${Date.now()}`,
      title,
      description,
      videoUrl, // Save the actual video URL
      sdgTags: [parseInt(sdg)],
      category: "trending",
      createdAt: new Date().toISOString()
    });
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
    if (confirm("Are you sure you want to restore default live matches?")) restoreDefaultChallenges();
  };

  const handleRestoreCards = () => {
    if (confirm("Are you sure you want to restore default trending topics?")) restoreDefaultCards();
  };

  // Helper to safely get the image for a Debate Card
  const getCardImage = (card: DebateCard) => {
    if (card.thumbnailUrl) return card.thumbnailUrl;
    if (card.videoUrl) {
      const match = card.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
      }
    }
    return "/placeholder.jpg"; // Fallback if no valid URL is found
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
          <Settings className="mr-2 h-4 w-4" /> AI Configuration
        </Button>
      </div>

      {activeTab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Live Matches */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="h-5 w-5"/> Live Matches</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRestoreChallenges}>
                  <RefreshCcw className="h-4 w-4 mr-2" /> Defaults
                </Button>
                <Button size="sm" onClick={handleAddChallenge}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {challenges.length === 0 && <p className="text-sm text-muted-foreground">No matches available.</p>}
              {challenges.map(ch => (
                <div key={ch.id} className="flex justify-between items-center p-3 border rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3 truncate pr-4">
                    {/* YouTube Thumbnail Preview */}
                    <img src={`https://img.youtube.com/vi/${ch.videoId}/mqdefault.jpg`} alt="thumbnail" className="h-10 w-16 object-cover rounded bg-muted" />
                    <div className="truncate">
                      <p className="font-semibold text-sm truncate">{ch.topic}</p>
                      <p className="text-xs text-muted-foreground">{ch.raisedBy} • {ch.status}</p>
                    </div>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRestoreCards}>
                  <RefreshCcw className="h-4 w-4 mr-2" /> Defaults
                </Button>
                <Button size="sm" onClick={handleAddCard}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {trendingCards.length === 0 && <p className="text-sm text-muted-foreground">No trending topics available.</p>}
              {trendingCards.map(card => (
                <div key={card.id} className="flex justify-between items-center p-3 border rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3 truncate pr-4">
                    {/* Fixed Image Preview using Helper */}
                    <img src={getCardImage(card)} alt="thumbnail" className="h-10 w-16 object-cover rounded bg-muted" />
                    <div className="truncate">
                      <p className="font-semibold text-sm truncate">{card.title}</p>
                    </div>
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-violet-500">1. AI Opponent</h2>
                <p className="text-xs text-muted-foreground">Controls how the AI argues during the debate.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Temp:</Label>
                <Input type="number" step="0.1" min="0" max="2" value={aiTemp} onChange={(e) => setAiTemp(parseFloat(e.target.value) || 0)} className="h-8 w-16 text-xs" />
              </div>
            </div>
            <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="min-h-[250px] font-mono text-xs" />
          </div>

          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-emerald-500">2. Post-Debate Judge</h2>
                <p className="text-xs text-muted-foreground">Determines scores, winner, and charity suggestions.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Temp:</Label>
                <Input type="number" step="0.1" min="0" max="2" value={judgeTemp} onChange={(e) => setJudgeTemp(parseFloat(e.target.value) || 0)} className="h-8 w-16 text-xs" />
              </div>
            </div>
            <Textarea value={judgePrompt} onChange={(e) => setJudgePrompt(e.target.value)} className="min-h-[250px] font-mono text-xs" />
          </div>

          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-rose-500">3. Real-Time Moderator</h2>
                <p className="text-xs text-muted-foreground">Checks for profanity, off-topic, and fallacies.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Temp:</Label>
                <Input type="number" step="0.1" min="0" max="2" value={modTemp} onChange={(e) => setModTemp(parseFloat(e.target.value) || 0)} className="h-8 w-16 text-xs" />
              </div>
            </div>
            <Textarea value={moderatorPrompt} onChange={(e) => setModeratorPrompt(e.target.value)} className="min-h-[250px] font-mono text-xs" />
          </div>

          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
             <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-amber-500">4. Topic Content Generator</h2>
                <p className="text-xs text-muted-foreground">Pre-loads hints and dynamic judge comments.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Temp:</Label>
                <Input type="number" step="0.1" min="0" max="2" value={topicTemp} onChange={(e) => setTopicTemp(parseFloat(e.target.value) || 0)} className="h-8 w-16 text-xs" />
              </div>
            </div>
            <Textarea value={topicPrompt} onChange={(e) => setTopicPrompt(e.target.value)} className="min-h-[250px] font-mono text-xs" />
          </div>

          <div className="col-span-full mt-4 flex justify-end">
            <Button size="lg" onClick={handleSavePrompts}>Save All Prompts & Settings</Button>
          </div>
        </div>
      )}
    </div>
  );
}