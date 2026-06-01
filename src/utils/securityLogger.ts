export const securityLogger = (event: { type: string; [key: string]: any }) => {
  if (process.env.NODE_ENV !== "production") {
    // Debug logging for development only
    console.log('[Security]', event);
  }
};

export const logSecurityEvent = (type: string, metadata: any = {}) => {
  securityLogger({ type, ...metadata });
};
