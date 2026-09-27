// Global circular-structure safeguard to prevent unhandled telemetry crashes
const nativeStringify = JSON.stringify;
JSON.stringify = function (value: any, replacer?: any, space?: any) {
  const seen = new WeakSet();
  return nativeStringify(
    value,
    function (key: string, val: any) {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      if (typeof replacer === 'function') {
        return replacer(key, val);
      }
      return val;
    },
    space
  );
} as typeof JSON.stringify;

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
