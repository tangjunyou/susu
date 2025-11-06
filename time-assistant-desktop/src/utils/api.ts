import { invoke } from '@tauri-apps/api/tauri';
import { Plan, Reflection } from '../types';

export const planApi = {
  async addPlan(plan: Omit<Plan, 'id'>): Promise<number> {
    return await invoke('add_plan', { plan });
  },

  async getAllPlans(): Promise<Plan[]> {
    return await invoke('get_all_plans');
  },

  async updatePlan(plan: Plan): Promise<void> {
    await invoke('update_plan', { plan });
  },

  async deletePlan(id: number): Promise<void> {
    await invoke('delete_plan', { id });
  },
};

export const reflectionApi = {
  async addReflection(reflection: Omit<Reflection, 'id'>): Promise<number> {
    return await invoke('add_reflection', { reflection });
  },

  async getReflectionsForPlan(planId: number): Promise<Reflection[]> {
    return await invoke('get_reflections_for_plan', { planId });
  },

  async deleteReflection(id: number): Promise<void> {
    await invoke('delete_reflection', { id });
  },
};

export const windowApi = {
  async toggleAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    await invoke('toggle_always_on_top', { alwaysOnTop });
  },

  async setWindowPosition(x: number, y: number): Promise<void> {
    await invoke('set_window_position', { x, y });
  },

  async setWindowSize(width: number, height: number): Promise<void> {
    await invoke('set_window_size', { width, height });
  },
};

export const dataApi = {
  async exportData(): Promise<string> {
    return await invoke('export_data');
  },
};

export const notificationApi = {
  async sendNotification(title: string, body: string): Promise<void> {
    await invoke('send_notification', { title, body });
  },
};

export const autostartApi = {
  async isEnabled(): Promise<boolean> {
    return await invoke('is_autostart_enabled');
  },

  async enable(): Promise<void> {
    await invoke('enable_autostart');
  },

  async disable(): Promise<void> {
    await invoke('disable_autostart');
  },
};
