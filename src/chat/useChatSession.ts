import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { sendChatTurn } from '../api/chat.ts';
import type { ChatResponse } from '../contracts/chat.ts';
import { getChatSessionId } from '../customer/chatSessionId.ts';
import { getCustomerId } from '../customer/customerId.ts';

interface SendChatInput {
  message: string;
  choices?: string[];
}

export function useChatSession(): UseMutationResult<ChatResponse, Error, SendChatInput> {
  const customerId = getCustomerId();
  const sessionId = getChatSessionId();

  return useMutation({
    mutationFn: ({ message, choices = [] }) =>
      sendChatTurn({ customerId, sessionId, message, choices, k: 4 }),
  });
}
