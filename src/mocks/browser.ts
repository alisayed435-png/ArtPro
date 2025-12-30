/**
 * MSW Browser Setup for Calyx Command Demo
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
