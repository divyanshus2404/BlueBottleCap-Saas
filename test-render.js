import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.tsx';

try {
  console.log("Attempting to render App");
  // we would need ts-node or similar to run this.
} catch (e) {
  console.error(e);
}
