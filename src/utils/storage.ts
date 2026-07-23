import { Plant, CareAlert, CareLogEntry, CareTask } from '../types';
import { INITIAL_PLANTS, INITIAL_CARE_ALERTS, MONTY_CARE_LOGS, INITIAL_CARE_TASKS } from '../data/initialData';

const KEYS = {
  PLANTS: 'plantcare_pro_plants_v1',
  ALERTS: 'plantcare_pro_alerts_v1',
  LOGS: 'plantcare_pro_logs_v1',
  TASKS: 'plantcare_pro_tasks_v1',
  SETTINGS: 'plantcare_pro_settings_v1',
};

export const getStoredPlants = (): Plant[] => {
  try {
    const data = localStorage.getItem(KEYS.PLANTS);
    return data ? JSON.parse(data) : INITIAL_PLANTS;
  } catch (e) {
    console.error('Failed to load plants from storage', e);
    return INITIAL_PLANTS;
  }
};

export const saveStoredPlants = (plants: Plant[]) => {
  try {
    localStorage.setItem(KEYS.PLANTS, JSON.stringify(plants));
  } catch (e) {
    console.error('Failed to save plants to storage', e);
  }
};

export const getStoredAlerts = (): CareAlert[] => {
  try {
    const data = localStorage.getItem(KEYS.ALERTS);
    return data ? JSON.parse(data) : INITIAL_CARE_ALERTS;
  } catch (e) {
    return INITIAL_CARE_ALERTS;
  }
};

export const saveStoredAlerts = (alerts: CareAlert[]) => {
  try {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  } catch (e) {}
};

export const getStoredLogs = (plantId: string): CareLogEntry[] => {
  try {
    const data = localStorage.getItem(`${KEYS.LOGS}_${plantId}`);
    if (data) return JSON.parse(data);
    if (plantId === 'monty') return MONTY_CARE_LOGS;
    return [];
  } catch (e) {
    return plantId === 'monty' ? MONTY_CARE_LOGS : [];
  }
};

export const saveStoredLogs = (plantId: string, logs: CareLogEntry[]) => {
  try {
    localStorage.setItem(`${KEYS.LOGS}_${plantId}`, JSON.stringify(logs));
  } catch (e) {}
};

export const getStoredTasks = (): CareTask[] => {
  try {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : INITIAL_CARE_TASKS;
  } catch (e) {
    return INITIAL_CARE_TASKS;
  }
};

export const saveStoredTasks = (tasks: CareTask[]) => {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {}
};

export const resetAllStorage = () => {
  localStorage.clear();
};
