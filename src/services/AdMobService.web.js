import React from 'react';
import { View, Text } from 'react-native';

export const AD_UNIT_BANNER = 'mock-banner';
export const AD_UNIT_INTERSTITIAL = 'mock-interstitial';

export async function initAdMob() {
  console.log('[AdMob Web] Mocks ativados.');
}

export function FiloBannerAd() {
  return (
    <View style={{ width: '100%', height: 50, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>[AdMob Banner Mock]</Text>
    </View>
  );
}

export function loadInterstitial() {
  // No-op for web
}

export function showInterstitial() {
  console.log('[AdMob Web] Mostrar Interstitial (Simulado)');
}
