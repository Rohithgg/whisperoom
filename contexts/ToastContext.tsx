import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ToastState {
  message: string | null;
  type: 'info' | 'error' | 'success';
}

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: null, type: 'info' });
  const [visible, setVisible] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const showToast = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ message, type });
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || !toast.message) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setToast((prev) => ({ ...prev, message: null }));
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [visible, toast.message, opacity]);

  const backgroundColor =
    toast.type === 'error' ? '#FF3B30' : toast.type === 'success' ? '#34C759' : '#007AFF';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && toast.message && (
        <Animated.View style={[styles.toastContainer, { opacity }]}>
          <View style={[styles.toast, { backgroundColor }]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toast: {
    maxWidth: SCREEN_WIDTH * 0.9,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});
