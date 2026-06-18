import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { sendChatTurn } from '../api/chat.ts';
import type { ChatResponse } from '../contracts/chat.ts';
import { getChatSessionId } from '../customer/chatSessionId.ts';
import { useCustomer } from '../customer/useCustomer.ts';

interface SendChatInput {
  message: string;
  choices?: string[];
}

export function useChatSession(): UseMutationResult<ChatResponse, Error, SendChatInput> {
  const customerId = useCustomer().customer.id;
  const sessionId = getChatSessionId();

  return useMutation({
    mutationFn: ({ message, choices = [] }) =>
      sendChatTurn({ customerId, sessionId, message, choices, k: 4 }),
  });
}
