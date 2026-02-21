// Model for YouTube-sourced debate challenges

export type ChallengeStatus = "open" | "matched" | "scheduled" | "live";

export interface YoutubeChallengeData {
    id: string;
    raisedBy: string;
    videoUrl: string;
    topic: string;
    description: string;
    status: ChallengeStatus;
    createdAt: string;
    acceptedBy?: string;
    scheduledAt?: string;
    raisedByRole?: "pro" | "con"; // which side the raiser chose
}

export class YoutubeChallenge implements YoutubeChallengeData {
    id: string;
    raisedBy: string;
    videoUrl: string;
    topic: string;
    description: string;
    status: ChallengeStatus;
    createdAt: string;
    acceptedBy?: string;
    scheduledAt?: string;
    raisedByRole?: "pro" | "con";

    constructor(data: YoutubeChallengeData) {
        this.id = data.id;
        this.raisedBy = data.raisedBy;
        this.videoUrl = data.videoUrl;
        this.topic = data.topic;
        this.description = data.description;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.acceptedBy = data.acceptedBy;
        this.scheduledAt = data.scheduledAt;
        this.raisedByRole = data.raisedByRole;
    }

    isOwnedBy(name: string): boolean {
        return this.raisedBy === name;
    }

    getTimeAgo(): string {
        const diff = Date.now() - new Date(this.createdAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }
}

// Simulated AI topic suggestions based on a YouTube URL
export function suggestTopicsForVideo(_url: string): string[] {
    // In a real app this would call an AI API. We return plausible categories.
    const banks = [
        [
            "Should AI-generated content be regulated by governments?",
            "Does social media do more harm than good?",
            "Is digital privacy a human right?",
        ],
        [
            "Should renewable energy replace fossil fuels immediately?",
            "Is nuclear power the safest clean energy?",
            "Who should bear the cost of climate action?",
        ],
        [
            "Is globalization beneficial for developing nations?",
            "Should universal basic income be implemented worldwide?",
            "Can free markets alone solve inequality?",
        ],
        [
            "Should gene editing in humans be permitted?",
            "Is space exploration worth the cost?",
            "Does technology widen or close the wealth gap?",
        ],
    ];
    // Pick a deterministic bank based on URL char sum
    const sum = _url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return banks[sum % banks.length];
}

// Seed data for demo
export const seedChallenges: YoutubeChallengeData[] = [
    {
        id: "ch-1",
        raisedBy: "Alex_Debates",
        videoUrl: "https://www.youtube.com/watch?v=hJP5GqnTrNo",
        topic: "Should AI replace teachers in classrooms?",
        description:
            "This video explores AI's growing role in education. Opening for challengers to argue FOR or AGAINST AI-led instruction.",
        status: "open",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    },
    {
        id: "ch-2",
        raisedBy: "GreenDebater",
        videoUrl: "https://www.youtube.com/watch?v=EhAemz1v7dQ",
        topic: "Is nuclear energy truly a clean solution to climate change?",
        description:
            "Nuclear proponents claim zero-emissions power. Critics cite waste and risk. Come debate the facts!",
        status: "scheduled",
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        acceptedBy: "ClimateWarrior99",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    },
];
