export interface Plan {
  id?: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'work' | 'study' | 'life' | 'health' | 'other';
  completed: boolean;
  totalTime: number;
  startDate: string;  // 开始日期 YYYY-MM-DD
  endDate: string;    // 结束日期 YYYY-MM-DD，支持跨天任务
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id?: number;
  planId: number;
  content: string;
  createdAt: string;
}

export interface Timer {
  planId: number;
  startTime: number;
  isRunning: boolean;
}

export interface Settings {
  alwaysOnTop: boolean;
  theme: 'light' | 'dark';
  autoStart: boolean;
  windowPosition: {
    x: number;
    y: number;
  };
  windowSize: {
    width: number;
    height: number;
  };
}

export const PRIORITY_LABELS = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
};

export const CATEGORY_LABELS = {
  work: '工作',
  study: '学习',
  life: '生活',
  health: '健康',
  other: '其他',
};

export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

export const CATEGORY_COLORS = {
  work: 'bg-blue-100 text-blue-700 border-blue-300',
  study: 'bg-purple-100 text-purple-700 border-purple-300',
  life: 'bg-pink-100 text-pink-700 border-pink-300',
  health: 'bg-green-100 text-green-700 border-green-300',
  other: 'bg-gray-100 text-gray-700 border-gray-300',
};
