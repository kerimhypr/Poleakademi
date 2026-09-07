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
export type Discussion = {
  id: string; author_id: string; slug: string; title: string;
  content: JsonNode; created_at: string; updated_at: string;
};
export type DiscussionComment = {
  id: string; discussion_id: string; author_id: string; parent_id: string | null;
  body: string; created_at: string; updated_at: string; profiles: Pick<Profile, "id" | "display_name" | "avatar_path" | "title"> | null;
};
export type CommentVote = {
  id: string; comment_id: string; user_id: string; value: 1 | -1; created_at: string;
};
export type DiscussionCommentVote = {
  id: string; discussion_comment_id: string; user_id: string; value: 1 | -1; created_at: string;
};
export type VoteCounts = { likes: number; dislikes: number; score: number; userVote: 1 | -1 | null };
