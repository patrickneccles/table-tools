"use client";

/**
 * Audio Manager using Web Audio API
 * 
 * Provides:
 * - Audio preloading (decode to memory buffers)
 * - Instant low-latency playback
 * - Per-sound volume control
 * - Smooth fade in/out
 * - Loop support
 * - Channel groups (ambience/effects)
 * - Audio ducking (lower ambience when effects play)
 * - Reverb/filter presets
 */

export type SoundType = "ambience" | "effect" | "preview";

export type AudioInstance = {
  id: string;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  filterNode: BiquadFilterNode | null;
  isPlaying: boolean;
  isLooping: boolean;
  soundType: SoundType;
  baseVolume: number; // Store original volume for ducking restoration
};

export type AudioPreset = {
  id: string;
  name: string;
  description: string;
  // Filter settings
  lowpassFrequency?: number;  // Hz (20-20000), lower = more muffled
  highpassFrequency?: number; // Hz (20-20000), higher = thinner
  // Reverb settings
  reverbMix?: number; // 0-1, dry/wet mix
  reverbDecay?: number; // seconds
};

// Built-in presets
export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: "none",
    name: "None",
    description: "No effects applied",
  },
  {
    id: "cave",
    name: "Cave",
    description: "Echoing cavern with reverb",
    reverbMix: 0.4,
    reverbDecay: 2.5,
    lowpassFrequency: 8000,
  },
  {
    id: "underwater",
    name: "Underwater",
    description: "Muffled, submerged sound",
    lowpassFrequency: 800,
    highpassFrequency: 100,
  },
  {
    id: "distant",
    name: "Distant",
    description: "Sounds from far away",
    lowpassFrequency: 2000,
    reverbMix: 0.2,
    reverbDecay: 1.5,
  },
  {
    id: "indoor",
    name: "Indoor",
    description: "Small room ambiance",
    reverbMix: 0.15,
    reverbDecay: 0.8,
  },
  {
    id: "cathedral",
    name: "Cathedral",
    description: "Large reverberant space",
    reverbMix: 0.5,
    reverbDecay: 4.0,
  },
  {
    id: "muffled",
    name: "Muffled",
    description: "Behind a wall or door",
    lowpassFrequency: 500,
    highpassFrequency: 80,
  },
];

class AudioManager {
  private context: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
  private activeInstances: Map<string, AudioInstance> = new Map();
  
  // Audio normalization
  private normalizationGains: Map<string, number> = new Map();
  private normalizationEnabled: boolean = true;
  private targetPeakLevel: number = 0.8; // Target peak amplitude (0-1)
  
  // Audio graph nodes
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  
  // Filter nodes for presets
  private lowpassFilter: BiquadFilterNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  
  // Reverb
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbBuffer: AudioBuffer | null = null;
  
  // Ducking state
  private duckingEnabled: boolean = true;
  private duckLevel: number = 0.3; // Duck ambience to 30% when effects play
  private duckRampTime: number = 0.15; // 150ms ramp
  private activeEffectsCount: number = 0;
  private ambienceBaseVolume: number = 1;
  
  // Current preset
  private currentPreset: AudioPreset = AUDIO_PRESETS[0];

  /**
   * Initialize or resume the AudioContext
   * Must be called after user interaction (browser requirement)
   */
  async init(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      
      // Create master gain
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      
      // Create channel group gains
      this.ambienceGain = this.context.createGain();
      this.effectsGain = this.context.createGain();
      
      // Create filter nodes (shared by ambience and effects)
      this.lowpassFilter = this.context.createBiquadFilter();
      this.lowpassFilter.type = "lowpass";
      this.lowpassFilter.frequency.value = 20000; // Full range by default
      this.lowpassFilter.Q.value = 0.7;
      
      this.highpassFilter = this.context.createBiquadFilter();
      this.highpassFilter.type = "highpass";
      this.highpassFilter.frequency.value = 20; // Full range by default
      this.highpassFilter.Q.value = 0.7;
      
      // Create reverb nodes
      this.dryGain = this.context.createGain();
      this.dryGain.gain.value = 1;
      
      this.reverbGain = this.context.createGain();
      this.reverbGain.gain.value = 0; // No reverb by default
      
      this.reverbNode = this.context.createConvolver();
      
      // Generate impulse response for reverb
      this.reverbBuffer = this.createImpulseResponse(2.0);
      this.reverbNode.buffer = this.reverbBuffer;
      
      // Audio processing chain: filters -> dry/wet split -> master
      // Both ambience and effects go through the same processing chain
      // (Ducking still works because it affects ambienceGain before the chain)
      
      // Connect both channel groups to the filter chain
      this.ambienceGain.connect(this.lowpassFilter);
      this.effectsGain.connect(this.lowpassFilter);
      
      // Filter chain
      this.lowpassFilter.connect(this.highpassFilter);
      
      // Dry path
      this.highpassFilter.connect(this.dryGain);
      this.dryGain.connect(this.masterGain);
      
      // Wet (reverb) path
      this.highpassFilter.connect(this.reverbNode);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }
  
  /**
   * Create synthetic impulse response for reverb
   */
  private createImpulseResponse(duration: number): AudioBuffer {
    const sampleRate = this.context!.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context!.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with noise
        const decay = Math.exp(-3 * i / length);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    
    return buffer;
  }
  
  /**
   * Set the active audio preset
   */
  setPreset(presetId: string): void {
    const preset = AUDIO_PRESETS.find(p => p.id === presetId) ?? AUDIO_PRESETS[0];
    this.currentPreset = preset;
    this.applyPreset(preset);
  }
  
  /**
   * Get current preset
   */
  getPreset(): AudioPreset {
    return this.currentPreset;
  }
  
  /**
   * Apply preset settings to audio nodes
   */
  private applyPreset(preset: AudioPreset): void {
    if (!this.context) return;
    
    const currentTime = this.context.currentTime;
    const rampTime = 0.3; // Smooth transition
    
    // Apply lowpass filter
    if (this.lowpassFilter) {
      const freq = preset.lowpassFrequency ?? 20000;
      this.lowpassFilter.frequency.setValueAtTime(
        this.lowpassFilter.frequency.value, 
        currentTime
      );
      this.lowpassFilter.frequency.linearRampToValueAtTime(freq, currentTime + rampTime);
    }
    
    // Apply highpass filter
    if (this.highpassFilter) {
      const freq = preset.highpassFrequency ?? 20;
      this.highpassFilter.frequency.setValueAtTime(
        this.highpassFilter.frequency.value,
        currentTime
      );
      this.highpassFilter.frequency.linearRampToValueAtTime(freq, currentTime + rampTime);
    }
    
    // Apply reverb mix
    if (this.reverbGain && this.dryGain) {
      const wetLevel = preset.reverbMix ?? 0;
      const dryLevel = 1 - wetLevel * 0.5; // Keep some dry signal
      
      this.reverbGain.gain.setValueAtTime(this.reverbGain.gain.value, currentTime);
      this.reverbGain.gain.linearRampToValueAtTime(wetLevel, currentTime + rampTime);
      
      this.dryGain.gain.setValueAtTime(this.dryGain.gain.value, currentTime);
      this.dryGain.gain.linearRampToValueAtTime(dryLevel, currentTime + rampTime);
    }
    
    // Regenerate reverb buffer if decay changed
    if (preset.reverbDecay && this.reverbNode && this.context) {
      this.reverbBuffer = this.createImpulseResponse(preset.reverbDecay);
      this.reverbNode.buffer = this.reverbBuffer;
    }
  }
  
  /**
   * Enable/disable audio ducking
   */
  setDuckingEnabled(enabled: boolean): void {
    this.duckingEnabled = enabled;
    if (!enabled) {
      // Restore ambience volume
      this.restoreAmbienceVolume();
    }
  }
  
  /**
   * Set ducking level (0-1, how much to reduce ambience)
   */
  setDuckLevel(level: number): void {
    this.duckLevel = Math.max(0, Math.min(1, level));
  }
  
  /**
   * Apply ducking to ambience channel
   */
  private applyDucking(): void {
    if (!this.duckingEnabled || !this.ambienceGain || !this.context) return;
    
    const currentTime = this.context.currentTime;
    const targetVolume = this.ambienceBaseVolume * this.duckLevel;
    
    this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, currentTime);
    this.ambienceGain.gain.linearRampToValueAtTime(targetVolume, currentTime + this.duckRampTime);
  }
  
  /**
   * Restore ambience volume after ducking
   */
  private restoreAmbienceVolume(): void {
    if (!this.ambienceGain || !this.context) return;
    
    const currentTime = this.context.currentTime;
    this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, currentTime);
    this.ambienceGain.gain.linearRampToValueAtTime(
      this.ambienceBaseVolume, 
      currentTime + this.duckRampTime
    );
  }
  
  /**
   * Track effect start for ducking
   */
  private onEffectStart(): void {
    this.activeEffectsCount++;
    if (this.activeEffectsCount === 1) {
      this.applyDucking();
    }
  }
  
  /**
   * Track effect end for ducking
   */
  private onEffectEnd(): void {
    this.activeEffectsCount = Math.max(0, this.activeEffectsCount - 1);
    if (this.activeEffectsCount === 0) {
      this.restoreAmbienceVolume();
    }
  }

  /**
   * Preload audio file into memory buffer
   */
  async preload(url: string): Promise<AudioBuffer | null> {
    // Return cached buffer if available
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Start loading
    const loadPromise = this.loadAudio(url);
    this.loadingPromises.set(url, loadPromise);

    try {
      const buffer = await loadPromise;
      this.bufferCache.set(url, buffer);
      return buffer;
    } catch (error) {
      console.error(`Failed to preload audio: ${url}`, error);
      return null;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  /**
   * Preload multiple audio files in parallel
   */
  async preloadAll(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.preload(url)));
  }

  /**
   * Check if audio is preloaded
   */
  isPreloaded(url: string): boolean {
    return this.bufferCache.has(url);
  }

  /**
   * Get preload progress (0-1)
   */
  getPreloadProgress(urls: string[]): number {
    if (urls.length === 0) return 1;
    const loaded = urls.filter((url) => this.bufferCache.has(url)).length;
    return loaded / urls.length;
  }

  private async loadAudio(url: string): Promise<AudioBuffer> {
    await this.init();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.context!.decodeAudioData(arrayBuffer);
    
    // Analyze and compute normalization gain
    if (this.normalizationEnabled) {
      const normGain = this.computeNormalizationGain(buffer);
      this.normalizationGains.set(url, normGain);
    }
    
    return buffer;
  }
  
  /**
   * Analyze audio buffer and compute gain needed for normalization
   */
  private computeNormalizationGain(buffer: AudioBuffer): number {
    let maxPeak = 0;
    
    // Find the peak amplitude across all channels
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const absValue = Math.abs(channelData[i]);
        if (absValue > maxPeak) {
          maxPeak = absValue;
        }
      }
    }
    
    // Compute gain to reach target level
    // If audio is already at or above target, don't boost
    if (maxPeak >= this.targetPeakLevel || maxPeak === 0) {
      return 1.0;
    }
    
    // Calculate gain, but cap at 3x to avoid over-amplifying quiet sounds
    const gain = Math.min(this.targetPeakLevel / maxPeak, 3.0);
    return gain;
  }
  
  /**
   * Get normalization gain for a URL
   */
  getNormalizationGain(url: string): number {
    return this.normalizationGains.get(url) ?? 1.0;
  }
  
  /**
   * Enable or disable audio normalization
   */
  setNormalizationEnabled(enabled: boolean): void {
    this.normalizationEnabled = enabled;
  }
  
  /**
   * Check if normalization is enabled
   */
  isNormalizationEnabled(): boolean {
    return this.normalizationEnabled;
  }
  
  /**
   * Set target peak level for normalization (0-1)
   */
  setTargetPeakLevel(level: number): void {
    this.targetPeakLevel = Math.max(0.1, Math.min(1.0, level));
  }

  /**
   * Play a sound with optional settings
   */
  async play(
    id: string,
    url: string,
    options: {
      volume?: number;
      loop?: boolean;
      fadeIn?: boolean;
      fadeInDuration?: number;
      soundType?: SoundType;
    } = {}
  ): Promise<boolean> {
    const { 
      volume = 1, 
      loop = false, 
      fadeIn = false, 
      fadeInDuration = 0.5,
      soundType = "preview",
    } = options;

    await this.init();

    // Stop existing instance with same ID
    if (this.activeInstances.has(id)) {
      await this.stop(id, { fadeOut: false });
    }

    // Get or load buffer
    let buffer: AudioBuffer | null | undefined = this.bufferCache.get(url);
    if (!buffer) {
      buffer = await this.preload(url);
      if (!buffer) return false;
    }

    // Apply normalization gain if enabled
    const normGain = this.normalizationEnabled ? this.getNormalizationGain(url) : 1.0;
    const normalizedVolume = volume * normGain;

    // Create audio nodes
    const source = this.context!.createBufferSource();
    const gainNode = this.context!.createGain();

    source.buffer = buffer;
    source.loop = loop;

    // Connect to appropriate channel group
    source.connect(gainNode);
    
    if (soundType === "ambience" && this.ambienceGain) {
      gainNode.connect(this.ambienceGain);
    } else if (soundType === "effect" && this.effectsGain) {
      gainNode.connect(this.effectsGain);
      // Trigger ducking
      this.onEffectStart();
    } else {
      // Preview and fallback go to master
      gainNode.connect(this.masterGain!);
    }

    // Handle fade in (using normalized volume)
    if (fadeIn) {
      gainNode.gain.setValueAtTime(0, this.context!.currentTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume, this.context!.currentTime + fadeInDuration);
    } else {
      gainNode.gain.setValueAtTime(normalizedVolume, this.context!.currentTime);
    }

    // Track instance
    const instance: AudioInstance = {
      id,
      source,
      gainNode,
      filterNode: null,
      isPlaying: true,
      isLooping: loop,
      soundType,
      baseVolume: volume,
    };
    this.activeInstances.set(id, instance);

    // Handle end event
    source.onended = () => {
      if (this.activeInstances.get(id) === instance) {
        instance.isPlaying = false;
        this.activeInstances.delete(id);
        
        // Handle ducking restoration for effects
        if (soundType === "effect") {
          this.onEffectEnd();
        }
      }
    };

    // Start playback
    source.start();
    return true;
  }

  /**
   * Stop a playing sound
   */
  async stop(
    id: string,
    options: { fadeOut?: boolean; fadeOutDuration?: number } = {}
  ): Promise<void> {
    const { fadeOut = true, fadeOutDuration = 0.5 } = options;

    const instance = this.activeInstances.get(id);
    if (!instance || !instance.source) return;

    const wasEffect = instance.soundType === "effect";

    if (fadeOut && this.context) {
      // Fade out
      const currentTime = this.context.currentTime;
      instance.gainNode.gain.setValueAtTime(instance.gainNode.gain.value, currentTime);
      instance.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

      // Stop after fade
      setTimeout(() => {
        try {
          instance.source?.stop();
        } catch {
          // Already stopped
        }
        this.activeInstances.delete(id);
        
        // Handle ducking restoration for effects
        if (wasEffect) {
          this.onEffectEnd();
        }
      }, fadeOutDuration * 1000);
    } else {
      // Immediate stop
      try {
        instance.source.stop();
      } catch {
        // Already stopped
      }
      this.activeInstances.delete(id);
      
      // Handle ducking restoration for effects
      if (wasEffect) {
        this.onEffectEnd();
      }
    }
  }

  /**
   * Set volume for a playing sound
   */
  setVolume(id: string, volume: number, rampDuration = 0.1): void {
    const instance = this.activeInstances.get(id);
    if (!instance || !this.context) return;

    const currentTime = this.context.currentTime;
    instance.gainNode.gain.setValueAtTime(instance.gainNode.gain.value, currentTime);
    instance.gainNode.gain.linearRampToValueAtTime(volume, currentTime + rampDuration);
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number, rampDuration = 0.1): void {
    if (!this.masterGain || !this.context) return;

    const currentTime = this.context.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
    this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + rampDuration);
  }
  
  /**
   * Set ambience channel volume (base volume before ducking)
   */
  setAmbienceVolume(volume: number, rampDuration = 0.1): void {
    this.ambienceBaseVolume = volume;
    
    if (!this.ambienceGain || !this.context) return;
    
    // Only set if not currently ducked
    if (this.activeEffectsCount === 0) {
      const currentTime = this.context.currentTime;
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, currentTime);
      this.ambienceGain.gain.linearRampToValueAtTime(volume, currentTime + rampDuration);
    }
  }
  
  /**
   * Set effects channel volume
   */
  setEffectsVolume(volume: number, rampDuration = 0.1): void {
    if (!this.effectsGain || !this.context) return;

    const currentTime = this.context.currentTime;
    this.effectsGain.gain.setValueAtTime(this.effectsGain.gain.value, currentTime);
    this.effectsGain.gain.linearRampToValueAtTime(volume, currentTime + rampDuration);
  }
  
  /**
   * Get all available presets
   */
  getPresets(): AudioPreset[] {
    return AUDIO_PRESETS;
  }
  
  /**
   * Check if ducking is currently active
   */
  isDucking(): boolean {
    return this.duckingEnabled && this.activeEffectsCount > 0;
  }

  /**
   * Check if a sound is currently playing
   */
  isPlaying(id: string): boolean {
    return this.activeInstances.get(id)?.isPlaying ?? false;
  }

  /**
   * Stop all playing sounds
   */
  async stopAll(options: { fadeOut?: boolean } = {}): Promise<void> {
    const ids = Array.from(this.activeInstances.keys());
    await Promise.all(ids.map((id) => this.stop(id, options)));
  }

  /**
   * Play a short preview of a sound (non-looping, auto-stops)
   */
  async playPreview(url: string, duration = 3): Promise<void> {
    const previewId = `preview-${url}`;
    
    // Stop any existing preview
    await this.stop(previewId, { fadeOut: true, fadeOutDuration: 0.2 });

    await this.play(previewId, url, {
      volume: 0.7,
      loop: false,
      fadeIn: true,
      fadeInDuration: 0.2,
    });

    // Auto-stop after duration
    setTimeout(() => {
      this.stop(previewId, { fadeOut: true, fadeOutDuration: 0.3 });
    }, duration * 1000);
  }

  /**
   * Stop preview playback
   */
  async stopPreview(url: string): Promise<void> {
    const previewId = `preview-${url}`;
    await this.stop(previewId, { fadeOut: true, fadeOutDuration: 0.2 });
  }

  /**
   * Get the AudioContext (for advanced usage)
   */
  getContext(): AudioContext | null {
    return this.context;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// React hook for using the audio manager
import { useEffect, useState, useCallback } from "react";

export function useAudioManager() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize on first user interaction
    const handleInteraction = async () => {
      await audioManager.init();
      setIsReady(true);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return {
    isReady,
    audioManager,
  };
}

export function useAudioPreloader(urls: string[]) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setProgress(1);
      setIsComplete(true);
      return;
    }

    let mounted = true;

    const preload = async () => {
      await audioManager.init();
      
      let loaded = 0;
      await Promise.all(
        urls.map(async (url) => {
          await audioManager.preload(url);
          loaded++;
          if (mounted) {
            setProgress(loaded / urls.length);
          }
        })
      );

      if (mounted) {
        setIsComplete(true);
      }
    };

    preload();

    return () => {
      mounted = false;
    };
  }, [urls]);

  return { progress, isComplete };
}

export function useSoundPlayer(
  id: string, 
  url: string, 
  options?: { loop?: boolean; soundType?: SoundType }
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    audioManager.preload(url).then(() => setIsLoaded(true));
  }, [url]);

  const play = useCallback(async (volume = 1, fadeIn = true) => {
    const success = await audioManager.play(id, url, {
      volume,
      loop: options?.loop ?? false,
      fadeIn,
      soundType: options?.soundType ?? "preview",
    });
    if (success) setIsPlaying(true);
  }, [id, url, options?.loop, options?.soundType]);

  const stop = useCallback(async (fadeOut = true) => {
    await audioManager.stop(id, { fadeOut });
    setIsPlaying(false);
  }, [id]);

  const toggle = useCallback(async (volume = 1) => {
    if (isPlaying) {
      await stop(true);
    } else {
      await play(volume, true);
    }
  }, [isPlaying, play, stop]);

  const setVolume = useCallback((volume: number) => {
    audioManager.setVolume(id, volume);
  }, [id]);

  return {
    isPlaying,
    isLoaded,
    play,
    stop,
    toggle,
    setVolume,
  };
}

/**
 * Hook for managing audio presets
 */
export function useAudioPresets() {
  const [currentPreset, setCurrentPreset] = useState<AudioPreset>(AUDIO_PRESETS[0]);
  const [duckingEnabled, setDuckingEnabled] = useState(true);
  const [fadeEnabled, setFadeEnabled] = useState(true);
  const [volume, setVolumeState] = useState(75);

  const setPreset = useCallback((presetId: string) => {
    const preset = AUDIO_PRESETS.find(p => p.id === presetId) ?? AUDIO_PRESETS[0];
    audioManager.setPreset(presetId);
    setCurrentPreset(preset);
  }, []);

  const toggleDucking = useCallback((enabled: boolean) => {
    audioManager.setDuckingEnabled(enabled);
    setDuckingEnabled(enabled);
  }, []);

  const toggleFade = useCallback((enabled: boolean) => {
    setFadeEnabled(enabled);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const normalized = Math.max(0, Math.min(100, vol));
    audioManager.setMasterVolume(normalized / 100);
    setVolumeState(normalized);
  }, []);

  return {
    presets: AUDIO_PRESETS,
    currentPreset,
    setPreset,
    duckingEnabled,
    toggleDucking,
    fadeEnabled,
    toggleFade,
    volume,
    setVolume,
  };
}
