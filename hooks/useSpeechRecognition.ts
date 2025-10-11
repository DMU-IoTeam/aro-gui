import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeModules } from 'react-native';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent,
  SpeechRecognizedEvent,
} from '@react-native-voice/voice';

type SpeechStatus = 'idle' | 'starting' | 'listening' | 'processing' | 'error';

type UseSpeechRecognitionReturn = {
  transcript: string;
  isListening: boolean;
  status: SpeechStatus;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
  resetRecognition: () => Promise<void>;
};

const DEFAULT_LOCALE = 'ko-KR';

export default function useSpeechRecognition(
  locale: string = DEFAULT_LOCALE,
): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const nativeVoiceModuleRef = useRef(NativeModules?.Voice ?? null);
  const voiceModuleRef = useRef<typeof Voice | null>(null);
  const [isSupported] = useState(() => {
    const hasNativeModule = nativeVoiceModuleRef.current != null;
    if (hasNativeModule && Voice && typeof Voice.start === 'function') {
      voiceModuleRef.current = Voice;
      return true;
    }
    voiceModuleRef.current = null;
    return false;
  });

  const handleSpeechStart = useCallback((event: SpeechStartEvent) => {
    if (!isMountedRef.current) {
      return;
    }
    setStatus('listening');
  }, []);

  const handleSpeechRecognized = useCallback(
    (event: SpeechRecognizedEvent) => {
      if (!isMountedRef.current) {
        return;
      }
      setStatus('processing');
    },
    [],
  );

  const handleSpeechResults = useCallback((event: SpeechResultsEvent) => {
    if (!isMountedRef.current) {
      return;
    }
    const [bestResult] = event.value ?? [];
    if (bestResult) {
      setTranscript(bestResult);
    }
    setStatus('idle');
  }, []);

  const handleSpeechError = useCallback((event: SpeechErrorEvent) => {
    if (!isMountedRef.current) {
      return;
    }
    const message = event.error?.message ?? '음성 인식 중 문제가 발생했어요.';
    setError(message);
    setStatus('error');
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const voiceModule = voiceModuleRef.current;
    if (!voiceModule) {
      setStatus('error');
      setError('음성 인식 모듈을 찾을 수 없어요.');
      return () => {
        isMountedRef.current = false;
      };
    }
    console.log('Voice module initialized:', voiceModule);
    
    voiceModule.onSpeechStart = handleSpeechStart;
    voiceModule.onSpeechRecognized = handleSpeechRecognized;
    voiceModule.onSpeechResults = handleSpeechResults;
    voiceModule.onSpeechError = handleSpeechError;

    return () => {
      isMountedRef.current = false;
      if (voiceModule?.destroy) {
        voiceModule
          .destroy()
          .then(() => voiceModule.removeAllListeners?.())
          .catch(() => {});
      }
      voiceModule?.removeAllListeners?.();
    };
  }, [handleSpeechError, handleSpeechRecognized, handleSpeechResults, handleSpeechStart]);

  const startListening = useCallback(async () => {
    const voiceModule = voiceModuleRef.current;
    if (!voiceModule) {
      setError('음성 인식이 현재 기기에서 지원되지 않아요.');
      setStatus('error');
      return;
    }
    try {
      setError(null);
      setStatus('starting');
      await voiceModule.start(locale);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '음성 인식을 시작할 수 없어요.';
      setError(message);
      setStatus('error');
    }
  }, [locale]);

  const stopListening = useCallback(async () => {
    const voiceModule = voiceModuleRef.current;
    if (!voiceModule) {
      return;
    }
    try {
      await voiceModule.stop();
      setStatus('idle');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '음성 인식을 종료할 수 없어요.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const cancelListening = useCallback(async () => {
    const voiceModule = voiceModuleRef.current;
    if (!voiceModule) {
      return;
    }
    try {
      await voiceModule.cancel?.();
      setStatus('idle');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '음성 인식을 취소할 수 없어요.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const resetRecognition = useCallback(async () => {
    setTranscript('');
    setError(null);
    setStatus('idle');
    const voiceModule = voiceModuleRef.current;
    if (!voiceModule) {
      return;
    }

    try {
      await voiceModule.destroy?.();
    } catch (err) {
      // ignore
    }
    voiceModule.removeAllListeners?.();
    voiceModule.onSpeechStart = handleSpeechStart;
    voiceModule.onSpeechRecognized = handleSpeechRecognized;
    voiceModule.onSpeechResults = handleSpeechResults;
    voiceModule.onSpeechError = handleSpeechError;
  }, [handleSpeechError, handleSpeechRecognized, handleSpeechResults, handleSpeechStart]);

  return {
    transcript,
    isListening: status === 'starting' || status === 'listening',
    status,
    error,
    isSupported,
    startListening,
    stopListening,
    cancelListening,
    resetRecognition,
  };
}
