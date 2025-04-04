import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  // Load env variables from .env file based on mode
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY)
    }
  };
});
