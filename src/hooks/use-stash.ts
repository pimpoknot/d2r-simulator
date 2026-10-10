import { useState, useEffect, useCallback } from "react";
import { ItemQuality } from "@/server/db/client";

export type StashItemView = {
  id: string;
  itemName: string;
  itemQuality: ItemQuality;
  statsPayload: Record<string, unknown>;
  droppedAt: string;
};

export function useStash(userId?: string) {
  const [items, setItems] = useState<StashItemView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const url = userId ? `/api/stash?userId=${encodeURIComponent(userId)}` : "/api/stash";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch stash");
      }
      return json.data.items;
    } catch (err) {
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fetchedItems = await fetchItems();
        if (active) setItems(fetchedItems);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    }
    
    load();
    return () => { active = false; };
  }, [fetchItems]);

  const filterItems = useCallback((quality?: ItemQuality, query?: string) => {
    return items.filter(item => {
      if (quality && item.itemQuality !== quality) return false;
      if (query && !item.itemName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items]);

  return { items, loading, error, fetchItems, filterItems };
}
