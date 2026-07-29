export interface CosmicArtifact {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  sourceStoryId?: string;
  sourceStoryTitle?: string;
  sourceChapterNumber?: number;
  eventKey?: string;
  milestoneType: string;
  milestoneName: string;
  imageUrl?: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Transcendent";
  attributeBoost?: string;
  
  // Weekly Offering System mock fields
  offeringWeekId?: string;
  gatheredAt?: string;
  status?: "unsubmitted" | "submitted" | "auto_submitted";
  rewardValueQi?: number;
  rewardValueSectMerit?: number;
}
