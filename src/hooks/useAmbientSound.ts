import { useEffect, useRef } from "react";

import musicFile from "@/assets/tunetank-inspiring-cinematic-music-409347.mp3";

interface AmbientSoundOptions {
  enabled: boolean;
  volume?: number;
}

export function useAmbientSound({ enabled, volume = 0.3 }: AmbientSoundOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element on mount
    if (!audioRef.current) {
      audioRef.current = new Audio(musicFile);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';
      console.log('Audio element created with file:', musicFile);
      
      // Set up event listeners for debugging
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
      
      audioRef.current.addEventListener('loadstart', () => {
        console.log('Audio load start');
      });
    }

    // Handle play/pause based on enabled state
    if (enabled) {
      const playAudio = async () => {
        if (audioRef.current) {
          try {
            console.log('Attempting to play audio, current state:', audioRef.current.readyState);
            await audioRef.current.play();
            console.log('Audio playing successfully');
          } catch (error) {
            console.error('Audio play failed:', error);
          }
        }
      };

      // Try to play immediately
      playAudio();

      // Also try on user interaction as fallback
      const handleInteraction = () => {
        playAudio();
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('keydown', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        console.log('Audio paused');
      }
    }
    
    return undefined;
  }, [enabled, volume]);

  const updateVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      console.log('Volume updated to:', newVolume);
    }
  };

  return { updateVolume };
}
