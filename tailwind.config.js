/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        reach: { light: '#FEE2E2', border: '#EF4444', text: '#991B1B', badge: '#DC2626' },
        target: { light: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', badge: '#2563EB' },
        safety: { light: '#D1FAE5', border: '#10B981', text: '#065F46', badge: '#059669' },
      },
    },
  },
  plugins: [],
};
