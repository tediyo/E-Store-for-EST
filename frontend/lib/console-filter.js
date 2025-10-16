// Console filter to suppress specific warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    const message = args.join(' ');
    // Suppress bbai-tooltip-injected warnings
    if (message.includes('bbai-tooltip-injected')) {
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    // Suppress bbai-tooltip-injected warnings
    if (message.includes('bbai-tooltip-injected')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
