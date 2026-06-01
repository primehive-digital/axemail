"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Eye,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Paperclip,
  Reply,
  Send,
  Signature,
  Sparkles,
  UnderlineIcon,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const fontFamilies = ["Arial", "Helvetica", "Georgia", "Times New Roman", "Verdana"];
const fontSizes = ["12px", "14px", "16px", "18px", "24px"];

type ComposerField = {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
};

const composerFields: ComposerField[] = [
  {
    id: "from-name",
    label: "From Name",
    required: true,
    placeholder: "Axemail Campaign Team",
    icon: User,
  },
  {
    id: "preview-text",
    label: "Preview Text",
    placeholder: "Short inbox preview shown before opening",
    icon: Eye,
  },
  {
    id: "to",
    label: "To",
    required: true,
    type: "email",
    placeholder: "recipient@company.com",
    icon: Send,
  },
  {
    id: "reply-to",
    label: "Reply To",
    required: true,
    type: "email",
    placeholder: "reply@yourdomain.com",
    icon: Reply,
  },
  {
    id: "cc",
    label: "CC",
    type: "email",
    placeholder: "cc@company.com",
    icon: Users,
  },
  {
    id: "bcc",
    label: "BCC",
    type: "email",
    placeholder: "bcc@company.com",
    icon: Users,
  },
  {
    id: "subject",
    label: "Subject",
    required: true,
    placeholder: "Write a clear email subject",
    icon: Sparkles,
  },
];

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

function ComposerLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="font-google-sans text-sm font-semibold text-heading"
    >
      {children}
      {required && <RequiredMark />}
    </Label>
  );
}

function UploadBox({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/60 p-5 text-center transition-colors hover:bg-secondary">
      <input type="file" className="sr-only" />
      <span className="grid size-11 place-items-center rounded-xl border border-border bg-card text-heading shadow-sm shadow-black/5">
        <Icon className="size-5" strokeWidth={2.3} />
      </span>
      <span>
        <span className="block font-google-sans text-sm font-semibold text-heading">
          {title}
        </span>
        <span className="mt-1 block font-inter text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

function ToolbarButton({
  active,
  children,
  onClick,
  label,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-11 rounded-full border-border bg-card text-heading shadow-none hover:bg-secondary",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </Button>
  );
}

export function DomainMailComposer() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      TextStyle,
      FontFamily,
      FontSize,
      Underline,
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-56 px-5 py-4 font-inter text-sm leading-6 text-foreground outline-none",
      },
    },
  });

  const selectedFontFamily =
    (editor?.getAttributes("textStyle").fontFamily as string | undefined) ??
    "Arial";
  const selectedFontSize =
    (editor?.getAttributes("textStyle").fontSize as string | undefined) ??
    "14px";

  const setLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <Card className="rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">
            Domain Mail Composer
          </h2>
          <p className="mt-1 font-inter text-sm text-muted-foreground">
            Compose and prepare your Domain mailer message.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {composerFields.map((field) => (
            <div
              key={field.id}
              className={cn(
                field.id === "subject" && "md:col-span-2 xl:col-span-3",
              )}
            >
              <ComposerLabel htmlFor={field.id} required={field.required}>
                {field.label}
              </ComposerLabel>
              <div className="relative mt-2">
                <field.icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.id}
                  type={field.type ?? "text"}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <UploadBox
            title="Attachment"
            description="Upload files to include with your email."
            icon={Paperclip}
          />
          <UploadBox
            title="Signature Image or Attachment"
            description="Upload a signature image or supporting signature file."
            icon={Signature}
          />
        </div>

        <div>
          <Label className="mb-3 font-google-sans text-sm font-semibold text-heading">
            Content
            <RequiredMark />
          </Label>
          <div className="overflow-hidden rounded-sm border border-border bg-background">
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-w-40 justify-between rounded-2xl bg-card px-4 font-inter font-normal"
                  >
                    {selectedFontFamily}
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {fontFamilies.map((fontFamily) => (
                    <DropdownMenuItem
                      key={fontFamily}
                      onSelect={() =>
                        editor?.chain().focus().setFontFamily(fontFamily).run()
                      }
                      className="font-inter"
                      style={{ fontFamily }}
                    >
                      <span className="grid w-4 place-items-center">
                        {selectedFontFamily === fontFamily && (
                          <Check className="size-4" />
                        )}
                      </span>
                      {fontFamily}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-w-28 justify-between rounded-2xl bg-card px-4 font-inter font-normal"
                  >
                    {selectedFontSize}
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-24">
                  {fontSizes.map((fontSize) => (
                    <DropdownMenuItem
                      key={fontSize}
                      onSelect={() =>
                        editor?.chain().focus().setFontSize(fontSize).run()
                      }
                      className="justify-center font-inter"
                    >
                      <span className="grid w-4 place-items-center">
                        {selectedFontSize === fontSize && (
                          <Check className="size-4" />
                        )}
                      </span>
                      {fontSize}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <ToolbarButton
                label="Bold"
                active={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Italic"
                active={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Underline"
                active={editor?.isActive("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Align left"
                active={editor?.isActive({ textAlign: "left" })}
                onClick={() =>
                  editor?.chain().focus().setTextAlign("left").run()
                }
              >
                <AlignLeft className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Align center"
                active={editor?.isActive({ textAlign: "center" })}
                onClick={() =>
                  editor?.chain().focus().setTextAlign("center").run()
                }
              >
                <AlignCenter className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Align right"
                active={editor?.isActive({ textAlign: "right" })}
                onClick={() =>
                  editor?.chain().focus().setTextAlign("right").run()
                }
              >
                <AlignRight className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Bullet list"
                active={editor?.isActive("bulletList")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <List className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Ordered list"
                active={editor?.isActive("orderedList")}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
              >
                <ListOrdered className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Link"
                active={editor?.isActive("link")}
                onClick={setLink}
              >
                <LinkIcon className="size-4" />
              </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="rounded-full px-4 h-10 font-google-sans shadow-[#2e5fa2]/10 shadow-sm hover:shadow-md hover:shadow-[#2e5fa2]/20 transition-all ease-in-out duration-200 border-none">
            <Paperclip className="size-4" />
            Send Mail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
