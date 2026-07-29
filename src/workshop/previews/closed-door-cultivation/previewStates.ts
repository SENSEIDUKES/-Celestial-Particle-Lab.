export type PreviewState =
  | 'idle'
  | 'claiming'
  | 'earned-11'
  | 'earned-350'
  | 'earned-9999';

export interface PreviewScenario {
  id: PreviewState;
  label: string;
  qiEarned: number | null;
}

export const scenarios: PreviewScenario[] = [
  { id: 'idle', label: 'No Qi (Hidden)', qiEarned: null },
  { id: 'earned-11', label: '+11 Qi (Small)', qiEarned: 11 },
  { id: 'earned-350', label: '+350 Qi (Medium)', qiEarned: 350 },
  { id: 'earned-9999', label: '+9999 Qi (Large)', qiEarned: 9999 },
];
