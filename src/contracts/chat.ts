import type { paths } from './openapi.ts';

export type ChatRequest = paths['/chat']['post']['requestBody']['content']['application/json'];

export type ChatResponse = paths['/chat']['post']['responses'][200]['content']['application/json'];

export type ChatRecommendation = ChatResponse['games'][number];
