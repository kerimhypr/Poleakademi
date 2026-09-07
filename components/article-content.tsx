import type { JsonNode } from "@/lib/types";

function Text({ node }: { node: JsonNode }) {
  let value: React.ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") value = <strong>{value}</strong>;
    if (mark.type === "italic") value = <em>{value}</em>;
    if (mark.type === "code") value = <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-sm">{value}</code>;
    if (mark.type === "link") value = <a href={mark.attrs?.href} target="_blank" rel="noopener noreferrer">{value}</a>;
  }
  return <>{value}</>;
}

function Node({ node }: { node: JsonNode }): React.ReactNode {
  const inner = node.content?.map((child, i) => <Node key={i} node={child} />);
  switch (node.type) {
    case "text": return <Text node={node} />;
    case "paragraph": return <p>{inner}</p>;
    case "heading": { const Tag = (`h${node.attrs?.level ?? 2}` as "h2" | "h3" | "h4"); return <Tag>{inner}</Tag>; }
    case "bulletList": return <ul>{inner}</ul>;
    case "orderedList": return <ol>{inner}</ol>;
    case "listItem": return <li>{inner}</li>;
    case "blockquote": return <blockquote>{inner}</blockquote>;
    case "codeBlock": return <pre><code>{inner}</code></pre>;
    case "hardBreak": return <br />;
    default: return <>{inner}</>;
  }
}
export function ArticleContent({ content }: { content: JsonNode }) { return <div className="prose-pole"><Node node={content} /></div>; }
