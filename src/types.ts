export interface Plant {
  id: string;
  nickname: string;
  species: string;
  scientificName?: string;
  location: string;
  acquiredDate: string;
  healthScore: number;
  survivalScore: number;
  nextCareDue: string; // e.g. "Water in 3 days" or "Overdue!"
  nextCareDays: number;
  waterRequirement: string; // 'Partial' | 'Direct' | 'Shade' or 'In 3 days'
  sunRequirement: string; // 'Partial' | 'Shade' | 'Direct'
  status: 'Healthy' | 'Thirsty' | 'Warning' | 'Stable' | 'Growing';
  photoUrl: string;
  latitude?: string;
  longitude?: string;
  watersCount: number;
  fertsCount: number;
  daysTracked: number;
  careNotes?: string;
}

export interface CareAlert {
  id: string;
  plantId: string;
  plantName: string;
  plantPhoto: string;
  alertType: 'water' | 'moisture' | 'light';
  title?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  actionNeeded: string;
}

export type CareActionType = 'water' | 'fertilize' | 'prune' | 'repot' | 'move' | 'inspect';

export interface CareLogEntry {
  id: string;
  plantId: string;
  type: 'Watered' | 'Fertilized' | 'Pruned' | 'Repotted' | 'Moved' | 'Inspected' | 'Milestone' | 'AI Note';
  title: string;
  timestamp: string;
  note: string;
  badgeText?: string;
  details?: Record<string, string | number>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isTyping?: boolean;
}

export interface SpeciesMatch {
  species: string;
  commonName: string;
  confidence: number;
  tags: string[];
  photoUrl: string;
  description: string;
  careInfo?: {
    light: string;
    water: string;
    humidity: string;
  };
}

export interface CareTask {
  id: string;
  plantId: string;
  plantName: string;
  taskType: 'Water' | 'Fertilize' | 'Prune' | 'Inspect' | 'Mist';
  dueDate: string;
  dueLabel: string;
  isCompleted: boolean;
  overdue: boolean;
}
