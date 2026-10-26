import { initAppConfig, useAppConfig } from '@geeksman/core-ui';
import { config as localConfig } from './config.local';
import { config as stagingConfig } from './config.staging';
import { config as prodConfig } from './config.prod';
import { config as testingConfig } from './config.testing';
import { AppConfig, SupplierCustomConfig } from './types';

export { useAppConfig };
export * from './types';

export const getAppConfig = (): AppConfig => {
  return initAppConfig<SupplierCustomConfig>({
    local: localConfig,
    staging: stagingConfig,
    prod: prodConfig,
    testing: testingConfig,
  });
};
