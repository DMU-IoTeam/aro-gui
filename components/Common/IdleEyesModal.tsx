import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type IdleEyesModalProps = {
  visible: boolean;
  onRequestClose: () => void;
};

const formatTimestamp = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  const weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
    date.getDay()
  ];
  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${weekDay}`;
};

function IdleEyesModal({ visible, onRequestClose }: IdleEyesModalProps) {
  const [now, setNow] = useState(() => new Date());

  const eyeScale = useRef(new Animated.Value(1)).current;
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      eyeScale.setValue(1);
      return;
    }

    const blink = () => {
      Animated.sequence([
        Animated.timing(eyeScale, {
          toValue: 0.15,
          duration: 120,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(eyeScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }
        blinkTimeoutRef.current = setTimeout(blink, 3500);
      });
    };

    blink();

    return () => {
      eyeScale.stopAnimation();
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
      eyeScale.setValue(1);
    };
  }, [eyeScale, visible]);

  const formattedTime = useMemo(() => formatTimestamp(now), [now]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <View pointerEvents="none" style={styles.content}>
          <View style={styles.eyesWrapper}>
            {[0, 1].map((eye) => (
              <Animated.View key={eye} style={[styles.eyeOuter, { transform: [{ scaleY: eyeScale }] }] }>
                <View style={styles.eyeInner} />
                <View style={styles.eyeHighlight} />
              </Animated.View>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 42,
    fontWeight: '600',
    marginTop: 24,
  },
  eyesWrapper: {
    flexDirection: 'row',
    gap: 142,
    position: 'relative',
    top: -100,
  },
  eyeOuter: {
    width: 200,
    height: 200,
    borderRadius: 9999,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeInner: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: 'black',
  },
  eyeHighlight: {
    position: 'absolute',
    top: 40,
    right: 50,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
  },
});

export default IdleEyesModal;
