export interface Room {
  id: string;
  name: string;
  category: string;
  color: string;
  activeUsers: { name: string; avatar: string; color: string }[];
  boards: Workboard[];
}

export interface Workboard {
  id: string;
  title: string;
  mode: 'doc' | 'whiteboard' | 'presentation';
  lastEdited: string;
  activeUsers: { name: string; color: string }[];
  previewType: 'canvas' | 'doc' | 'slides';
}

export interface LiveUserCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  status?: string;
}

export type SceneState = 'office' | 'transitioning' | 'gallery' | 'workspace';
