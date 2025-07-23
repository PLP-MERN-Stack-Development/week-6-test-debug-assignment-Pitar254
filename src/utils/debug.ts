// Debug utilities for development
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🐛 [DEBUG] ${message}`, data || '');
  }
};

export const debugError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [ERROR] ${message}`, error || '');
  }
};

export const debugWarn = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ [WARN] ${message}`, data || '');
  }
};

export const debugInfo = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`ℹ️ [INFO] ${message}`, data || '');
  }
};

// Performance debugging
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    debugInfo(`Performance: ${name}`, `${end - start}ms`);
  } else {
    fn();
  }
};

// Component debugging helper
export const withDebugProps = (componentName: string) => (props: any) => {
  debugLog(`${componentName} rendered with props:`, props);
  return props;
};