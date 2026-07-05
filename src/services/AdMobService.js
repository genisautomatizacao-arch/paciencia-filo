import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';

let mobileAds, BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType;
let isAdMobLoaded = false;

try {
  if (!IS_WEB) {
    const admobLib = require('react-native-google-mobile-ads');
    mobileAds = admobLib.default;
    BannerAd = admobLib.BannerAd;
    BannerAdSize = admobLib.BannerAdSize;
    TestIds = admobLib.TestIds;
    InterstitialAd = admobLib.InterstitialAd;
    AdEventType = admobLib.AdEventType;
    isAdMobLoaded = true;
  }
} catch (e) {
  console.warn('[AdMob] Módulo nativo não encontrado. Usando mocks.');
}

// Use TestIds em ambiente de desenvolvimento local para evitar bloqueios do AdMob
export const AD_UNIT_BANNER = (__DEV__ && isAdMobLoaded) ? TestIds.BANNER : 'ca-app-pub-1633575498973162/4926699634';
export const AD_UNIT_INTERSTITIAL = (__DEV__ && isAdMobLoaded) ? TestIds.INTERSTITIAL : 'ca-app-pub-1633575498973162/3613617967';

// Inicialização do AdMob
export async function initAdMob() {
  if (IS_WEB || !isAdMobLoaded) {
    console.log('[AdMob] Mocks ativados (Web ou Expo Go).');
    return;
  }
  
  try {
    await mobileAds().initialize();
    console.log('[AdMob] Inicializado com sucesso.');
  } catch (e) {
    console.warn('[AdMob] Erro ao inicializar:', e);
  }
}

// ── BANNER COMPONENT ──
export function FiloBannerAd() {
  if (IS_WEB || !isAdMobLoaded) {
    return (
      <View style={{ width: '100%', height: 50, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>[AdMob Banner Mock]</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <BannerAd
        unitId={AD_UNIT_BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => console.log('[AdMob Banner] Failed to load:', error)}
      />
    </View>
  );
}

// ── INTERSTITIAL LOGIC ──
let interstitial = null;

export function loadInterstitial() {
  if (IS_WEB || !isAdMobLoaded) return;

  try {
    interstitial = InterstitialAd.createForAdRequest(AD_UNIT_INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdMob Interstitial] Carregado.');
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('[AdMob Interstitial] Erro:', error);
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob Interstitial] Fechado.');
      // Preload next one
      loadInterstitial();
    });

    interstitial.load();
  } catch (e) {
    console.warn('[AdMob Interstitial] Erro no setup:', e);
  }
}

export function showInterstitial() {
  if (IS_WEB || !isAdMobLoaded) {
    console.log('[AdMob] Mostrar Interstitial (Simulado)');
    return;
  }

  if (interstitial && interstitial.loaded) {
    interstitial.show();
  } else {
    console.log('[AdMob Interstitial] Não estava pronto para exibir. Tentando carregar...');
    loadInterstitial();
  }
}
