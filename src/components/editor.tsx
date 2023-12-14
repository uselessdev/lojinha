"use client";

import { EditorContent, useEditor, type Editor as TEditor } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { FormControl, FormItem, FormLabel } from "./ui/form";

type Props = {
  initialValue?: string;
  onChange: (args: { html: string; raw: string }) => void;
  label: string;
};

export function Editor({ initialValue = "", onChange, label }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange({ html: editor.getHTML(), raw: editor.getText() });
    },
  });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <EditorMenu editor={editor} />

      <FormControl>
        <EditorContent
          id="editor"
          editor={editor}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-gray-700 focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </FormControl>
    </FormItem>
  );
}

const menu = (editor: TEditor | null) => [
  {
    id: "heading",
    items: [
      {
        name: "h1",
        command: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        icon: <Heading1Icon className="w-4" />,
      },
      {
        name: "h2",
        command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        icon: <Heading2Icon className="w-4" />,
      },
      {
        name: "h3",
        command: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        icon: <Heading3Icon className="w-4" />,
      },
    ],
  },
  {
    id: "format",
    items: [
      {
        name: "bold",
        command: () => editor?.chain().focus().toggleBold().run(),
        icon: <BoldIcon className="w-4" />,
      },
      {
        name: "italic",
        command: () => editor?.chain().focus().toggleItalic().run(),
        icon: <ItalicIcon className="w-4" />,
      },
      {
        name: "strike",
        command: () => editor?.chain().focus().toggleStrike().run(),
        icon: <StrikethroughIcon className="w-4" />,
      },
      {
        name: "underline",
        command: () => editor?.chain().focus().toggleUnderline().run(),
        icon: <UnderlineIcon className="w-4" />,
      },
    ],
  },
  {
    id: "align",
    items: [
      {
        name: "left",
        command: () => editor?.chain().focus().setTextAlign("left").run(),
        icon: <AlignLeftIcon className="w-4" />,
      },
      {
        name: "center",
        command: () => editor?.chain().focus().setTextAlign("center").run(),
        icon: <AlignCenterIcon className="w-4" />,
      },
      {
        name: "right",
        command: () => editor?.chain().focus().setTextAlign("right").run(),
        icon: <AlignRightIcon className="w-4" />,
      },
    ],
  },
  {
    id: "lists",
    items: [
      {
        name: "bulletList",
        command: () => editor?.chain().focus().toggleBulletList().run(),
        icon: <ListIcon className="w-4" />,
      },
      {
        name: "orderedList",
        command: () => editor?.chain().focus().toggleOrderedList().run(),
        icon: <ListOrderedIcon className="w-4" />,
      },
    ],
  },
];

function EditorMenu({ editor }: { editor: TEditor | null }) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      {menu(editor).map(({ id, items }) => (
        <div key={id} className="flex gap-1 border-r border-input pr-3 last:border-r-0">
          {items.map((item) => {
            const active =
              editor?.isActive(item.name) ??
              editor?.isActive({ textAlign: item.name }) ??
              (item.name === "h1" && editor?.isActive("heading", { level: 1 })) ??
              (item.name === "h2" && editor?.isActive("heading", { level: 2 })) ??
              (item.name === "h3" && editor?.isActive("heading", { level: 3 }));

            return (
              <button
                key={item.name}
                type="button"
                onClick={item.command}
                className={`flex h-8 w-8 items-center justify-center rounded-md outline-none hover:bg-foreground/5 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                  active ? "bg-gray-100/10" : ""
                }`}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
