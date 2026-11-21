/**
 * Installed Application Version Configuration
 * Kept in sync with android/app/build.gradle and release pipeline
 */

export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
  buildDate: string;
  packageName: string;
  environment: 'production' | 'staging' | 'development';
}

export const CURRENT_APP_VERSION: AppVersionInfo = {
  versionCode: 1,
  versionName: '1.0.0',
  buildDate: '2026-11-21',
  packageName: 'com.studentcareer.app',
  environment: 'production',
};
