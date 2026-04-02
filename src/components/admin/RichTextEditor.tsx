"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Heading2,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Mô tả sản phẩm chi tiết...",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[160px] p-4 focus:outline-none [&>p]:my-1 [&>ul]:my-2 [&>ol]:my-2 [&>h2]:mt-4 [&>h2]:mb-2",
      },
    },
  });

  // Sync external value changes (e.g. when data loads)
  useEffect(() => {
    if (editor && value && !isInternalChange.current) {
      const currentContent = editor.getHTML();
      if (currentContent !== value && value !== "<p></p>") {
        editor.commands.setContent(value);
      }
    }
    isInternalChange.current = false;
  }, [value, editor]);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      if (isDemo) {
        const url = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(file.name.split(".")[0])}`;
        editor.chain().focus().setImage({ src: url }).run();
        toast.info("Demo: Kết nối Supabase để upload thật");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "descriptions");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          toast.error(data.error || "Lỗi upload");
        }
      } catch {
        toast.error("Lỗi upload ảnh");
      }

      e.target.value = "";
    },
    [editor]
  );

  if (!editor) return <div className="border border-gray-200 rounded-xl p-4 min-h-[200px] text-gray-300 text-sm">{placeholder}</div>;

  const ToolBtn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 p-0 ${active ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"}`}
    >
      {children}
    </Button>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Tiêu đề"
        >
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="In đậm"
        >
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="In nghiêng"
        >
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Danh sách"
        >
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Danh sách số"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ"
        >
          <Minus className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn onClick={addImage} title="Chèn ảnh">
          <ImageIcon className="w-4 h-4" />
        </ToolBtn>
        <div className="flex-1" />
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Hoàn tác"
        >
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Làm lại"
        >
          <Redo className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
