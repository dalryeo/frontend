const isDev = process.env.APP_ENV === 'development' || !process.env.APP_ENV;

export const BASE_URL = isDev
  ? 'https://api-dev.dalryeo.store'
  : 'https://api.dalryeo.store';
