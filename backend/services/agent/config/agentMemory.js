import { getMessages } from "../utlis/getMessages.js";
import redis from "../../../shared/redis/redis.js";

const MAX_HISTORY = 10;

export const getMemory = async (conversationId) => {
  const key = `messages-${conversationId}`;

  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  let messages = await getMessages(conversationId);

  // Keep only the latest messages
  messages = messages.slice(-MAX_HISTORY);

  await redis.set(
    key,
    JSON.stringify(messages),
    "EX",
    24 * 60 * 60
  );

  return messages;
};

export const addMessage = async (conversationId, role, content) => {
  const key = `messages-${conversationId}`;

  const raw = await redis.get(key);

  const messages = raw ? JSON.parse(raw) : [];

  messages.push({ role, content });

  // Keep only the latest messages
  while (messages.length > MAX_HISTORY) {
    messages.shift();
  }

  await redis.set(
    key,
    JSON.stringify(messages),
    "EX",
    24 * 60 * 60
  );
};