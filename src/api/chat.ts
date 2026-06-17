import { fetchJson } from './http.ts';
import type { ChatRequest, ChatResponse } from '../contracts/chat.ts';

const ENDPOINTS = {
  chat: () => '/chat',
} as const;

export async function sendChatTurn(request: ChatRequest): Promise<ChatResponse> {
  return fetchJson<ChatResponse>(ENDPOINTS.chat(), {
    method: 'POST',
    body: request,
  });
}
