import "server-only";

/**
 * Server-only Data Access Layer / Repositories.
 * Encapsulate raw queries and mutations here.
 */
export const exampleRepository = {
  async findById(id: string) {
    return { id, name: "Sample Item" };
  },
};
