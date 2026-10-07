import "server-only";
import { exampleRepository } from "@/repositories/index";

/**
 * Server-only Business Logic Layer / Services.
 * Orchestrates business rules, security, third-party integrations, and repositories.
 */
export const exampleService = {
  async getItemDetails(id: string) {
    const item = await exampleRepository.findById(id);
    return {
      ...item,
      retrievedAt: new Date().toISOString(),
    };
  },
};
