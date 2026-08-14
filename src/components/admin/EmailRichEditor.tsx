import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ListBulletIcon,
  LinkIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { cn } from "./ui";

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-black leading-none tracking-tight">
      {children}
    </span>
  );
}

export function htmlToPlain(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
}

export function isEmptyHtml(html: string): boolean {
  return !htmlToPlain(html).length;
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-jevah-text-muted transition",
        active
          ? "bg-jevah-accent/15 text-jevah-accent"
          : "hover:bg-jevah-card hover:text-jevah-text",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-jevah-border bg-jevah-card/50 px-2 py-1.5">
      <ToolbarBtn
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Glyph>B</Glyph>
      </ToolbarBtn>
      <ToolbarBtn
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="text-[11px] font-serif italic font-bold leading-none">
          I
        </span>
      </ToolbarBtn>
      <ToolbarBtn
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Glyph>
          <span className="line-through">S</span>
        </Glyph>
      </ToolbarBtn>

      <span className="mx-1 h-5 w-px bg-jevah-border" />

      <ToolbarBtn
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Glyph>H</Glyph>
      </ToolbarBtn>
      <ToolbarBtn
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <CodeBracketIcon className="h-4 w-4" />
      </ToolbarBtn>

      <span className="mx-1 h-5 w-px bg-jevah-border" />

      <ToolbarBtn
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListBulletIcon className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <Glyph>1.</Glyph>
      </ToolbarBtn>
      <ToolbarBtn
        label="Link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarBtn>

      <span className="mx-1 h-5 w-px bg-jevah-border" />

      <ToolbarBtn
        label="Undo"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label="Redo"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
      </ToolbarBtn>
    </div>
  );
}

type Props = {
  value: string;
  onChange: (html: string, plain: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeightClass?: string;
};

export default function EmailRichEditor({
  value,
  onChange,
  placeholder = "Write your email…",
  disabled = false,
  minHeightClass = "min-h-[220px]",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "email-rich-editor px-4 py-3 text-sm leading-relaxed text-jevah-text outline-none",
          minHeightClass
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(isEmptyHtml(html) ? "" : html, ed.getText().trim());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (isEmptyHtml(next) && !isEmptyHtml(current)) {
      editor.commands.clearContent(true);
      return;
    }
    if (
      !isEmptyHtml(next) &&
      current !== next &&
      isEmptyHtml(current)
    ) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-2xl border border-jevah-border bg-jevah-card/40",
          minHeightClass
        )}
      />
    );
  }

  const chars = editor.getText().trim().length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-jevah-border bg-jevah-input shadow-sm transition focus-within:border-jevah-accent focus-within:ring-2 focus-within:ring-jevah-accent/15",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-jevah-border/60 px-3 py-1.5 text-[10px] text-jevah-text-muted">
        <span>Bold, lists, links, and headings are included in the email</span>
        <span>
          {chars} character{chars === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
