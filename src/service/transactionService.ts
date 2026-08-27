import apiClient from "../client/client";
import type { TransactionItem } from "./loginService";

export const categorizeTransactionWithAi = async (id: number): Promise<TransactionItem> => {
  const response = await apiClient.patch<TransactionItem>(`/transactions/${id}/categorize-ai`);
  return response.data;
};
