export type JsonNode = {
  type?: string;
  text?: string;
  marks?: { type: string; attrs?: Record<string, string> }[];
  attrs?: Record<string, string | number | null>;
  content?: JsonNode[];
};

export type Profile = {
  id: string; display_name: string; bio: string; avatar_path: string | null;
  title: string | null; role: "user" | "admin"; created_at: string;
};
export type Article = {
  id: string; author_id: string; slug: string; title: string; excerpt: string;
  cover_path: string | null; content: JsonNode; status: "draft" | "published";
  published_at: string | null; created_at: string; updated_at: string;
};
export type Comment = {
  id: string; article_id: string; author_id: string; parent_id: string | null;
  body: string; created_at: string; updated_at: string; profiles: Pick<Profile, "id" | "display_name" | "avatar_path" | "title"> | null;
};
