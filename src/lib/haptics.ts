/**
 * iOS Haptic Feedback Utility
 * Provides native-feel haptic feedback for key interactions
 */

import { Capacitor } from '@capacitor/core';

let Haptics: any = null;
let ImpactStyle: any = null;
let NotificationType: any = null;

const isNative = Capacitor.isNativePlatform();

// Initialize haptics on first use
async function initHaptics() {
  if (!isNative || Haptics) return;
  
  try {
    const module = await import('@capacitor/haptics');
    Haptics = module.Haptics;
    ImpactStyle = module.ImpactStyle;
    NotificationType = module.NotificationType;
  } catch (e) {
    console.warn('Haptics not available');
  }
}

// Initialize immediately if native
if (isNative) {
  initHaptics();
}

/**
 * Light impact - for subtle UI feedback
 * Use for: button taps, selections, toggles
 */
export async function hapticLight() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.impact({ style: ImpactStyle?.Light });
  } catch (e) {}
}

/**
 * Medium impact - for confirmations
 * Use for: check-ins, likes, saves
 */
export async function hapticMedium() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.impact({ style: ImpactStyle?.Medium });
  } catch (e) {}
}

/**
 * Heavy impact - for significant actions
 * Use for: matches, important confirmations
 */
export async function hapticHeavy() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.impact({ style: ImpactStyle?.Heavy });
  } catch (e) {}
}

/**
 * Success notification - for positive outcomes
 * Use for: successful match, profile saved, check-in complete
 */
export async function hapticSuccess() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.notification({ type: NotificationType?.Success });
  } catch (e) {}
}

/**
 * Warning notification - for alerts
 * Use for: expiring matches, low messages remaining
 */
export async function hapticWarning() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.notification({ type: NotificationType?.Warning });
  } catch (e) {}
}

/**
 * Error notification - for failures
 * Use for: failed actions, errors
 */
export async function hapticError() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.notification({ type: NotificationType?.Error });
  } catch (e) {}
}

/**
 * Selection changed - for picker/selection UI
 * Use for: scrolling through options, tab changes
 */
export async function hapticSelection() {
  if (!isNative) return;
  await initHaptics();
  try {
    await Haptics?.selectionChanged();
  } catch (e) {}
}
