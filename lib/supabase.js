import { createClient } from "@supabase/supabase-js";

let client = null;

function getClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

export const supabase = new Proxy(
  {},
  {
    get(_t, prop) {
      const c = getClient();
      if (!c) {
        return () => {
          throw new Error("Supabase env vars missing at runtime");
        };
      }
      const v = c[prop];
      return typeof v === "function" ? v.bind(c) : v;
    },
  }
);
