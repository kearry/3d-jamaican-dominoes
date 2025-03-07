import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Define the accessibility settings interface
interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textToSpeech: boolean;
  keyboardNavigation: boolean;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  soundEffects: true,
  colorblindMode: 'none',
  textToSpeech: false,
  keyboardNavigation: true,
};

// Export hook for using accessibility settings throughout the app
export const useAccessibilitySettings = () => {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    'accessibility-settings', 
    defaultSettings
  );

  return { settings, setSettings };
};

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings } = useAccessibilitySettings();
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>(settings);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AccessibilitySettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSettings(localSettings);
    // Apply settings to DOM
    document.documentElement.classList.toggle('high-contrast', localSettings.highContrast);
    document.documentElement.classList.toggle('large-text', localSettings.largeText);
    document.documentElement.classList.toggle('reduced-motion', localSettings.reducedMotion);
    
    // Reset any previous colorblind mode
    document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    // Apply new colorblind mode if not none
    if (localSettings.colorblindMode !== 'none') {
      document.documentElement.classList.add(localSettings.colorblindMode);
    }
    
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="accessibility-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 id="accessibility-title" className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Accessibility Settings</h2>
        
        <div className="space-y-6">
          {/* Visual Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Visual</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>High Contrast</span>
                <input
                  type="checkbox"
                  checked={localSettings.highContrast}
                  onChange={(e) => handleToggle('highContrast', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>Large Text</span>
                <input
                  type="checkbox"
                  checked={localSettings.largeText}
                  onChange={(e) => handleToggle('largeText', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>Reduced Motion</span>
                <input
                  type="checkbox"
                  checked={localSettings.reducedMotion}
                  onChange={(e) => handleToggle('reducedMotion', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
              
              <div>
                <span className="block mb-1">Colorblind Mode</span>
                <select
                  value={localSettings.colorblindMode}
                  onChange={(e) => handleToggle('colorblindMode', e.target.value)}
                  className="form-select block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Interaction Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Interaction</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Sound Effects</span>
                <input
                  type="checkbox"
                  checked={localSettings.soundEffects}
                  onChange={(e) => handleToggle('soundEffects', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>Text to Speech</span>
                <input
                  type="checkbox"
                  checked={localSettings.textToSpeech}
                  onChange={(e) => handleToggle('textToSpeech', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>Keyboard Navigation</span>
                <input
                  type="checkbox"
                  checked={localSettings.keyboardNavigation}
                  onChange={(e) => handleToggle('keyboardNavigation', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityMenu;