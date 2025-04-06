import { createContext } from 'react';
import type { TelegramContextType } from './types';

/** Контекст Telegram WebApp */
export const TelegramContext = createContext<TelegramContextType>({} as TelegramContextType);
