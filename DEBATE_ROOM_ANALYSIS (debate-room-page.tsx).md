# Debate Room Page - Complete Analysis

**File:** `components/debate/debate-room-page.tsx`  
**Generated:** February 22, 2026  
**Type:** React Component (Client-side)

---

## Overview

The `DebateRoomPage` component is the main arena where two players engage in a debate with an AI judge scoring their arguments. It's a real-time debate interface with:
- Split-screen layout (PRO vs CON)
- Live scoring system
- AI judge commentary
- YouTube video reference
- Round-based timer system

---

## Component Props

```typescript
interface DebateRoomPageProps {
    challenge: YoutubeChallenge;      // The debate challenge containing topic and video URL
    currentUser: string;              // Current user's ID/name
    onExit: () => void;              // Callback function to exit debate room
    userRole?: "pro" | "con";        // User's selected debate stance (optional)
}
```

### Prop Details

| Prop | Type | Required | Example |
|------|------|----------|---------|
| `challenge` | `YoutubeChallenge` | Yes | `{ topic: "Should AI be regulated?", videoUrl: "https://youtube.com/...", raisedBy: "player1", acceptedBy: "player2" }` |
| `currentUser` | `string` | Yes | `"john_doe"` |
| `onExit` | Function | Yes | `() => navigate("/")` |
| `userRole` | `"pro"` \| `"con"` | No | `"pro"` |

---

## State Variables

### Timer State
```typescript
const [seconds, setSeconds] = useState(ROUND_SECONDS);        // Current round seconds (0-300)
const [timerRunning, setTimerRunning] = useState(true);      // Is timer active?
const [round, setRound] = useState(1);                        // Current debate round
```

**Constant:**
```typescript
const ROUND_SECONDS = 300; // 5 minutes per round
```

### Messages & Chat State
```typescript
const [messages, setMessages] = useState<Message[]>([]);     // All debate messages
const [myInput, setMyInput] = useState("");                  // User's input text
const [oppInput, setOppInput] = useState("");                // Opponent's input text
const [myTyping, setMyTyping] = useState(false);             // User typing indicator
const [oppTyping, setOppTyping] = useState(false);           // Opponent typing indicator
const [activeTip, setActiveTip] = useState<string | null>(null); // Active AI tip
```

### Message Interface
```typescript
interface Message {
    id: string;                   // Unique message ID
    player: "pro" | "con";       // Which side sent it
    name: string;                 // Player's name
    text: string;                 // Message content
    timestamp: Date;              // When sent
    score?: number;               // Argument quality (1-10)
}
```

### Refs
```typescript
const oppTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Opponent response timer
const myMessagesEndRef = useRef<HTMLDivElement | null>(null);          // Scroll anchor (user)
const oppMessagesEndRef = useRef<HTMLDivElement | null>(null);         // Scroll anchor (opponent)
```

---

## Core Functions

### 1. **`scoreArgument(text: string): number`** ⭐

Calculates argument quality score from 1-10 based on linguistic analysis.

```typescript
function scoreArgument(text: string): number {
    const words = text.trim().split(/\s+/).length;
    
    // Check for logical/evidence keywords
    const hasClaims = /because|therefore|however|evidence|studies|research|data|fact/i.test(text);
    
    // Check for counterargument phrases
    const hasCounterpoint = /but|although|despite|while|whereas|on the other hand/i.test(text);
    
    // Base score: 1 point per 8 words (capped at 10)
    let score = Math.min(10, Math.max(1, Math.floor(words / 8)));
    
    // Bonus points
    if (hasClaims) score = Math.min(10, score + 2);          // +2 for evidence
    if (hasCounterpoint) score = Math.min(10, score + 1);    // +1 for counterpoint
    
    return score;
}
```

**Scoring Criteria:**
- Base: 1 point per 8 words (min 1, max 10)
- Evidence bonus: +2 (keywords: because, therefore, evidence, studies, research, data, fact)
- Counterpoint bonus: +1 (keywords: but, although, despite, while, whereas, on the other hand)

**Example:**
- 8 words "I think this is right because studies show it" → 1 + 2 = **3/10**
- 32 words with evidence → 4 + 2 = **6/10**
- 40 words with evidence + counterpoint → 5 + 2 + 1 = **8/10**

---

### 2. **`handleMySend(): void`** ⭐ **[AI RESPONSE FUNCTION]**

The primary function that handles user message sending and triggers AI opponent response.

```typescript
const handleMySend = () => {
    // 1. Validate and send user message
    if (!myInput.trim()) return;
    sendMessage(myRole, myName, myInput);
    setMyInput("");

    // 2. Simulate opponent thinking
    setOppTyping(true);
    
    // Clear any pending timeout
    if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
    
    // 3. Generate opponent response after delay
    oppTimerRef.current = setTimeout(() => {
        const replies = [
            "I understand your point, but consider this: the data suggests otherwise when examined in context.",
            "That's an interesting perspective. However, evidence points towards a more nuanced conclusion.",
            "While true to some extent, the broader implications contradict your argument significantly.",
            "I'd push back on that — independent studies have consistently shown the opposite.",
            "You raise a fair point, but this overlooks a critical factor that fundamentally changes the analysis.",
        ];
        
        // Random reply selection
        const reply = replies[Math.floor(Math.random() * replies.length)];
        sendMessage(oppRole, opponentName, reply);
        setOppTyping(false);
        
    }, 1500 + Math.random() * 2000);  // 1.5-3.5 second delay

    // 4. Show AI coaching tip
    const tip = AI_PROMPTS[Math.floor(Math.random() * AI_PROMPTS.length)];
    setActiveTip(tip);
    setTimeout(() => setActiveTip(null), 5000);  // Hide after 5 seconds
};
```

**Process:**
1. Validates user input
2. Sends user message to chat
3. Shows opponent typing indicator
4. Waits 1.5-3.5 seconds (simulating thinking)
5. Selects random pre-written response
6. Sends opponent response (scored via `scoreArgument()`)
7. Shows random AI coaching tip for 5 seconds

**Current Implementation:** Mock/simulated - **NOT real AI**

---

### 3. **`sendMessage(player, name, text): Message`**

Helper function called by `handleMySend()` to add messages to chat.

```typescript
const sendMessage = useCallback(
    (player: "pro" | "con", name: string, text: string) => {
        if (!text.trim()) return;
        
        const score = scoreArgument(text);  // Score the argument
        
        const msg: Message = {
            id: `${Date.now()}-${player}`,
            player,
            name,
            text: text.trim(),
            timestamp: new Date(),
            score,
        };
        
        setMessages((prev) => [...prev, msg]);
        return msg;
    },
    []
);
```

---

## AI Prompts (Coaching Tips)

```typescript
const AI_PROMPTS = [
    "Support your claim with specific evidence or data.",
    "Address the strongest opposing argument.",
    "What are the societal implications of this stance?",
    "Can you cite a real-world example?",
    "How does this align with established research?",
    "Anticipate and refute a likely counterpoint.",
];
```

---

## Judge Comments

### Neutral (Balanced Debate)
```typescript
const JUDGE_COMMENTS_NEUTRAL = [
    "Both sides are presenting strong arguments. The debate hinges on concrete evidence.",
    "We're looking for clear, evidence-backed reasoning. Stay on point.",
    "A balanced start. Push deeper into the implications of each claim.",
    "Logic and structure will determine the winner here. Keep arguments tight.",
];
```

### PRO Leading (PRO score > CON + 2)
```typescript
const JUDGE_COMMENTS_PRO_LEAD = [
    "PRO currently presents a more structured case. CON must raise the stakes.",
    "PRO's evidence is compelling. CON needs to address these points directly.",
    "PRO is leading on argument quality. CON — counterpoint now, or concede ground.",
];
```

### CON Leading (CON score > PRO + 2)
```typescript
const JUDGE_COMMENTS_CON_LEAD = [
    "CON is dismantling PRO's framework effectively. PRO needs a stronger rebuttal.",
    "CON's counterpoints are landing. PRO must reinforce their core premise.",
    "CON leads on density and refutation. PRO — respond to their strongest point.",
];
```

---

## Scoring System

### Argument Score Calculation
- **Range:** 1-10
- **Method:** Keyword detection + word count analysis
- **Display:** Star rating (1-5 stars)

### Overall Debate Score
```typescript
const proScore = messages
    .filter((m) => m.player === "pro")
    .reduce((acc, m) => acc + (m.score ?? 0), 0);

const conScore = messages
    .filter((m) => m.player === "con")
    .reduce((acc, m) => acc + (m.score ?? 0), 0);
```

**Display:** Live score bar at top + AI Judge Panel

---

## Layout Structure

### 1. **Header (Sticky)**
- Exit button
- Debate round indicator
- Topic title
- Live score bar (PRO vs CON)
- Timer (with color change based on remaining time)
  - ✅ Green: > 2 min
  - ⚠️ Yellow: 1-2 min
  - 🔴 Red: < 1 min
- Next Round button (appears when timer = 0)

### 2. **Main Arena (3-column, hidden on mobile)**
- **LEFT:** PRO player column
- **CENTER:** Video + topic + judge panel + debate stats
- **RIGHT:** CON player column

### 3. **Player Columns**
- Player header (name, role badge, total score)
- Message feed (scrollable)
- AI typing indicator
- Input textarea
- Send button

### 4. **Center Panel (Hidden on mobile)**
- YouTube video embed
- Debate topic
- Live argument strength bar
- AI Judge Panel (with live commentary + live indicator)
- Argument count
- Forfeit button

### 5. **Mobile Footer**
- Compact score bar
- Forfeit button

---

## Key Features

### ✅ Real-time Scoring
Messages are scored immediately when sent based on argument quality.

### ✅ AI Judge Commentary
Cycles through contextual comments every 6 seconds based on score difference.

### ✅ Typing Indicators
Shows when opponent is "thinking" (1.5-3.5 sec delay).

### ✅ Coaching Tips
Random AI suggestions shown after each user message.

### ✅ Round-based Timer
5-minute rounds with pause/resume toggle.

### ✅ Responsive Design
- Desktop: 3-column layout
- Tablet: 2-column with collapsed center
- Mobile: Single column with bottom score bar

---

## Important Notes

⚠️ **Current Limitations:**

1. **Mock AI:** Uses pre-written responses, NOT connected to real AI/API
2. **No Persistence:** Messages not saved to database
3. **No Backend:** All data is client-side only
4. **Simulated Opponent:** Can't debate with real opponent (would need WebSocket/Firebase)
5. **No Authentication:** User ID passed as string, no verification

---

## Common Use Cases

### Starting a Debate
```tsx
<DebateRoomPage
    challenge={youtubeChallenge}
    currentUser="john_doe"
    userRole="pro"
    onExit={() => navigate("/")}
/>
```

### User Sends Message
1. Types in textarea
2. Presses Enter or clicks Send
3. `handleMySend()` called
4. Message added with score
5. Opponent response generated after 1-3.5 sec
6. Judge panel updates

### Round Ends
- Timer reaches 0
- "Next Round" button appears
- `nextRound()` handler resets timer

---

## Tech Stack Used

- **React Hooks:** useState, useRef, useEffect, useCallback
- **Icons:** Lucide React
- **UI Components:** Custom + shadcn/ui
- **Styling:** Tailwind CSS
- **TypeScript:** Full type safety

---

## Files to Integrate

When integrating real AI or backend:

1. Replace `handleMySend()` with API call to AI service
2. Add Firebase Realtime Database for collaboration
3. Implement WebSocket for real opponent sync
4. Add user authentication layer
5. Create backend debate history storage

---

## Future Enhancements

- [ ] Connect to OpenAI/Claude API for real AI responses
- [ ] Firebase Realtime Database integration
- [ ] Debate recording/playback
- [ ] Advanced argument analytics
- [ ] Multiplayer opponent matching
- [ ] Debate history and statistics
- [ ] Audio/video debate support

---

**End of Analysis**  
Generated: February 22, 2026
