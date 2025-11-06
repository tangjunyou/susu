import React, { useState, useEffect } from 'react';
import { X, Pin, Moon, Sun, Download, Power } from 'lucide-react';
import { windowApi, dataApi, autostartApi } from '../utils/api';
import { useTheme } from '../hooks/useTheme';
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: (value: boolean) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  alwaysOnTop,
  onToggleAlwaysOnTop,
}: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [autostart, setAutostart] = useState(false);
  const [loadingAutostart, setLoadingAutostart] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAutostartStatus();
    }
  }, [isOpen]);

  const loadAutostartStatus = async () => {
    try {
      const enabled = await autostartApi.isEnabled();
      setAutostart(enabled);
    } catch (error) {
      console.error('Failed to load autostart status:', error);
    } finally {
      setLoadingAutostart(false);
    }
  };

  const handleToggleAutostart = async () => {
    try {
      if (autostart) {
        await autostartApi.disable();
        setAutostart(false);
      } else {
        await autostartApi.enable();
        setAutostart(true);
      }
    } catch (error) {
      alert('切换开机自启失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleToggleAlwaysOnTop = async () => {
    try {
      const newValue = !alwaysOnTop;
      console.log('尝试切换窗口置顶:', { 当前值: alwaysOnTop, 新值: newValue });
      await windowApi.toggleAlwaysOnTop(newValue);
      onToggleAlwaysOnTop(newValue);
      console.log('窗口置顶切换成功');
    } catch (error) {
      console.error('窗口置顶切换失败:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : JSON.stringify(error);
      alert('切换置顶失败: ' + errorMessage);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await dataApi.exportData();
      const filePath = await save({
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }],
        defaultPath: `time-assistant-backup-${new Date().toISOString().split('T')[0]}.json`
      });

      if (filePath) {
        await writeTextFile(filePath, data);
        alert('数据导出成功！');
      }
    } catch (error) {
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">设置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">开机自启</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  系统启动时自动运行应用
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAutostart}
              disabled={loadingAutostart}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autostart ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              } ${loadingAutostart ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autostart ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">窗口置顶</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  始终显示在其他窗口之上
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAlwaysOnTop}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alwaysOnTop ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alwaysOnTop ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">主题切换</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? '深色模式' : '浅色模式'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">数据管理</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors dark:bg-primary-900 dark:text-primary-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? '导出中...' : '导出数据'}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">关于</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>时间助手桌面版 v1.0.0</p>
              <p>基于 Tauri + React 构建</p>
              <p>Copyright 2025 MiniMax Agent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
