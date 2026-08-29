import { resolveAppConfig } from '@geeksman/core-ui';
import { config as localConfig } from './config.local';
import { config as stagingConfig } from './config.staging';
import { config as prodConfig } from './config.prod';
import { config as testingConfig } from './config.testing';
import { AppConfig } from './types';

export const getAppConfig = (): AppConfig => {
  return resolveAppConfig(localConfig, stagingConfig, prodConfig, testingConfig);
};
