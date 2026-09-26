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
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { htmlToPlain, isEmptyHtml } from "../../../lib/htmlText";

export const BIO_MAX_CHARS = 500;

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-black leading-none tracking-tight">
      {children}
    </span>
  );
}

function Tool({
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
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition ${
        active
          ? "bg-amber-400/15 text-amber-300"
          : "hover:bg-white/5 hover:text-white"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
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
    <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
      <Tool
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Glyph>B</Glyph>
      </Tool>
      <Tool
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="text-[11px] font-sans italic font-bold leading-none">
          I
        </span>
      </Tool>
      <Tool
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Glyph>
          <span className="line-through">S</span>
        </Glyph>
      </Tool>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Tool
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Glyph>H</Glyph>
      </Tool>
      <Tool
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
      </Tool>
      <Tool
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListBulletIcon className="h-4 w-4" />
      </Tool>
      <Tool
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <Glyph>1.</Glyph>
      </Tool>
      <Tool
        label="Link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Tool>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Tool
        label="Undo"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </Tool>
      <Tool
        label="Redo"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
      </Tool>
    </div>
  );
}

export default function ApplyBioEditor({
  value,
  onChange,
  disabled,
  invalid,
  tone = "apply",
  placeholder = "Worship collective in Lagos. Singles and youth nights since 2019.",
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  tone?: "apply" | "studio";
  placeholder?: string;
}) {
  const studio = tone === "studio";
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2] }, link: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: studio
          ? "apply-bio-editor min-h-[9rem] px-4 py-3 text-sm leading-relaxed text-jevah-text outline-none"
          : "apply-bio-editor min-h-[9rem] px-4 py-3 text-sm leading-relaxed text-white outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(isEmptyHtml(html) ? "" : html);
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
    if (!isEmptyHtml(next) && current !== next && isEmptyHtml(current)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  const chars = htmlToPlain(value).length;
  const over = chars > BIO_MAX_CHARS;

  if (!editor) {
    return (
      <div
        className={`min-h-[11rem] animate-pulse rounded-xl border ${
          studio ? "border-jevah-border bg-jevah-card" : "border-white/10 bg-[#08131d]"
        }`}
      />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border transition focus-within:ring-2 ${
        studio
          ? invalid || over
            ? "border-rose-400 bg-jevah-elevated focus-within:ring-rose-400/20"
            : "border-jevah-border bg-jevah-elevated focus-within:border-jevah-accent focus-within:ring-jevah-accent/20"
          : invalid || over
            ? "border-rose-400/70 bg-[#08131d] focus-within:ring-rose-400/15"
            : "border-white/10 bg-[#08131d] focus-within:border-amber-400/70 focus-within:ring-amber-400/15"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div
        className={`flex items-center justify-between px-3 py-1.5 text-[11px] ${
          studio ? "border-t border-jevah-border" : "border-t border-white/10"
        }`}
      >
        <span className={studio ? "text-jevah-text-muted" : "text-slate-500"}>
          Italics, bold, lists, and links
        </span>
        <span
          className={`font-mono ${
            over
              ? "font-semibold text-rose-500"
              : studio
                ? "text-jevah-text-muted"
                : "text-slate-500"
          }`}
        >
          {chars}/{BIO_MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
