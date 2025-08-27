import { client } from "./client";

export async function logActiveUser(groupId: string, date: string, platform: string) {
  const response = await client.post('/log/activity', { groupId, date, platform });
  return response.data;
} 