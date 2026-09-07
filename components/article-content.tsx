import type { JsonNode } from "@/lib/types";

function Text({ node }: { node: JsonNode }) {
  let value: React.ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") value = <strong className="font-semibold text-paper">{value}</strong>;
    if (mark.type === "italic") value = <em className="italic">{value}</em>;
    if (mark.type === "code") value = <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-amber">{value}</code>;
    if (mark.type === "link") {
      const href = mark.attrs?.href ?? "#";
      value = (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber underline decoration-amber/30 underline-offset-4 hover:decoration-amber">
          {value}
        </a>
      );
    }
  }
  return <>{value}</>;
}

function Node({ node }: { node: JsonNode }): React.ReactNode {
  const inner = node.content?.map((child, i) => <Node key={i} node={child} />);
  switch (node.type) {
    case "text":
      return <Text node={node} />;
    case "paragraph":
      return <p>{inner}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      if (level === 2) return <h2>{inner}</h2>;
      if (level === 3) return <h3>{inner}</h3>;
      return <h4>{inner}</h4>;
    }
    case "bulletList":
      return <ul>{inner}</ul>;
    case "orderedList":
      return <ol>{inner}</ol>;
    case "listItem":
      return <li>{inner}</li>;
    case "blockquote":
      return <blockquote>{inner}</blockquote>;
    case "codeBlock":
      return (
        <pre>
          <code>{inner}</code>
        </pre>
      );
    case "hardBreak":
      return <br />;
    default:
      return <>{inner}</>;
  }
}

export function ArticleContent({ content }: { content: JsonNode }) {
  // Defensive: if content is empty doc, show placeholder
  if (!content || !content.content || content.content.length === 0) {
    return <div className="prose-pole"><p className="text-zinc-500 italic">Bu makalenin içeriği henüz hazır değil.</p></div>;
  }
  // If doc has single empty paragraph, also placeholder
  if (content.content.length === 1 && content.content[0].type === "paragraph" && !content.content[0].content) {
    return <div className="prose-pole"><p className="text-zinc-500 italic">İçerik boş.</p></div>;
  }
  return (
    <div className="prose-pole">
      <Node node={content} />
    </div>
  );
}
