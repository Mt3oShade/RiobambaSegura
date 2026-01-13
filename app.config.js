// app.config.js
import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      API_URL: (process.env.EXPO_PUBLIC_API_URL || 'https://zincographical-aiden-subunequal.ngrok-free.dev').trim(),
    },
    android: {
      ...config.android,
      package: "com.upcriobamba.upcmovil" // debe coincidir con google-services.json
    }
    
  };
};
