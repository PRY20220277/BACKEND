export const APP_ENV = process.env.APP_ENVIRONMENT;
export const PORT = parseInt(process.env.PORT, 10) || 3000;
export const COSMOS_ENDPOINT = process.env.DEEP_ART_COSMOS_ENDPOINT;
export const COSMOS_API_KEY = process.env.DEEP_ART_COSMOS_API_KEY;
export const COSMOS_DATABASE_ID = process.env.DEEP_ART_COSMOS_DATABASE_ID;
export const COLLECTION_DB = process.env.DEEP_ART_COSMOS_DATABASE_COLLECTION;
export const FILE_DB = process.env.DEEP_ART_COSMOS_DATABASE_FILE;
export const ORDER_DB = process.env.DEEP_ART_COSMOS_DATABASE_ORDER;
export const PAYMENT_DB = process.env.DEEP_ART_COSMOS_DATABASE_PAYMENT;
export const POST_DB = process.env.DEEP_ART_COSMOS_DATABASE_POST;
export const USER_DB = process.env.DEEP_ART_COSMOS_DATABASE_USER;
export const SECRET_KEY =
  'a92f9c0d773ef522e123a5ea5e1761d45c69f73d4c00e1fa8ec4b4f33bdc266f';
export const EXPIRES_IN_HOURS = 24;
export const DEEP_ART_USER_SECRET = 'deepartuser';
