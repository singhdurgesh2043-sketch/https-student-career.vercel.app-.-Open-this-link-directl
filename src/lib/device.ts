import { Device } from '@capacitor/device';

export interface DeviceHardwareInfo {
  uuid: string;
  model: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  manufacturer: string;
}

export async function getDeviceHardwareInfo(): Promise<DeviceHardwareInfo> {
  try {
    const idInfo = await Device.getId();
    const info = await Device.getInfo();

    return {
      uuid: idInfo.identifier || 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      model: info.model || 'Android Device',
      platform: info.platform || 'android',
      osVersion: info.osVersion || 'Android 14',
      appVersion: '1.0.0',
      manufacturer: info.manufacturer || 'Generic',
    };
  } catch (error) {
    console.warn('Device API fallback to browser info:', error);
    // Generate persistent UUID for browser dev mode
    let fallbackId = localStorage.getItem('sc_dev_uuid');
    if (!fallbackId) {
      fallbackId = 'SC-DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('sc_dev_uuid', fallbackId);
    }
    return {
      uuid: fallbackId,
      model: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Chrome Workstation',
      platform: 'android-emulated',
      osVersion: '14.0',
      appVersion: '1.0.0',
      manufacturer: 'Android Native',
    };
  }
}
