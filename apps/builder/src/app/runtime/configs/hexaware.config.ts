import type { AppConfig } from '../models/app-config.model';
import rawConfig from './hexaware.config.json';

export const HEXAWARE_APP_CONFIG = rawConfig as AppConfig;
