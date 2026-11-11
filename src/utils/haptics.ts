export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(12);
      } else if (type === 'medium') {
        navigator.vibrate([18, 30, 18]);
      } else {
        navigator.vibrate([30, 40, 40]);
      }
    } catch {
      // Ignorar si el navegador bloquea la vibración
    }
  }
}

