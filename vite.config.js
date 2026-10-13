import {defineConfig} from 'vite';
import {marketMiddleware} from './server/market-api.js';
const proxy={'/api/live':{target:'http://127.0.0.1:5174'}};
export default defineConfig({server:{proxy},preview:{proxy},plugins:[{name:'live-market-api',configureServer(server){server.middlewares.use(marketMiddleware);},configurePreviewServer(server){server.middlewares.use(marketMiddleware);}}]});
