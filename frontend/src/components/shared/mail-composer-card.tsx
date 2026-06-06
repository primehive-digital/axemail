"use client";

import { useEffect, useRef, useState, type ComponentType, type FormEvent, type ReactNode, type Ref } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import toast from "react-hot-toast";
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
  LoaderCircle,
  Mail,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MASK_MAILER_FROM_EMAIL_EXT } from "@/constants/enum";
import type { MailerSendPayload } from "@/lib/outreach/outreach-api";
import { cn } from "@/lib/utils";

const fontFamilies = ["Arial", "Helvetica", "Georgia", "Times New Roman", "Verdana"];
const fontSizes = ["12px", "14px", "16px", "18px", "24px"];
const maskEmailExtensions = Object.values(MASK_MAILER_FROM_EMAIL_EXT);
const maxAttachmentSize = 10 * 1024 * 1024;
const maxAttachmentCount = 10;
const maxTotalAttachmentSize = 20 * 1024 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

type ComposerField = {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
};

type MailComposerCardProps = {
  title: string;
  description: string;
  includeMaskFromEmail?: boolean;
  onSend: (input: MailerSendPayload) => Promise<unknown>;
  isSending?: boolean;
  isCooldownActive?: boolean;
  isQuotaAvailable?: boolean;
  isLoadingCapacity?: boolean;
};

type UploadBoxProps = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  inputName: string;
  disabled?: boolean;
  inputRef: Ref<HTMLInputElement>;
};

const composerFields: ComposerField[] = [
  { id: "from-name", label: "From Name", required: true, placeholder: "Axemail Campaign Team", icon: User },
  { id: "preview-text", label: "Preview Text", placeholder: "Short inbox preview shown before opening", icon: Eye },
  { id: "to", label: "To", required: true, type: "email", placeholder: "recipient@company.com", icon: Send },
  { id: "reply-to", label: "Reply To", required: true, type: "email", placeholder: "reply@yourdomain.com", icon: Reply },
  { id: "cc", label: "CC", type: "email", placeholder: "cc@company.com", icon: Users },
  { id: "bcc", label: "BCC", type: "email", placeholder: "bcc@company.com", icon: Users },
  { id: "subject", label: "Subject", required: true, placeholder: "Write a clear email subject", icon: Sparkles },
];

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

function ComposerLabel({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <Label htmlFor={htmlFor} className="font-google-sans text-sm font-semibold text-heading">
      {children}
      {required && <RequiredMark />}
    </Label>
  );
}

function UploadBox({ title, description, icon: Icon, inputName, disabled, inputRef }: UploadBoxProps) {
  return (
    <label className={cn("flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/60 p-5 text-center transition-colors hover:bg-secondary", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
      <input ref={inputRef} type="file" name={inputName} multiple disabled={disabled} className="sr-only" />
      <span className="grid size-11 place-items-center rounded-xl border border-border bg-card text-heading shadow-sm shadow-black/5">
        <Icon className="size-5" strokeWidth={2.3} />
      </span>
      <span>
        <span className="block font-google-sans text-sm font-semibold text-heading">{title}</span>
        <span className="mt-1 block font-inter text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

function ToolbarButton({ active, children, onClick, label, disabled }: { active?: boolean; children: ReactNode; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <Button type="button" variant="outline" size="icon" aria-label={label} disabled={disabled} onClick={onClick} className={cn("size-11 rounded-full border-border bg-card text-heading shadow-none hover:bg-secondary", active && "bg-accent text-accent-foreground")}>
      {children}
    </Button>
  );
}

function FromEmailField({ extension, onExtensionChange, disabled }: { extension: string; onExtensionChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div className="md:col-span-2 xl:col-span-3">
      <ComposerLabel htmlFor="from-email-name" required>From Email</ComposerLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="from-email-name" name="from-email-name" required disabled={disabled} placeholder="sender" className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <Input value="@uspto." disabled aria-label="Static mask domain prefix" className="h-11 w-full rounded-sm bg-secondary px-4 text-center font-inter text-sm text-muted-foreground opacity-100 shadow-none sm:w-24" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" disabled={disabled} className="h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal sm:w-28">
              {extension}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            {maskEmailExtensions.map((value) => (
              <DropdownMenuItem key={value} onSelect={() => onExtensionChange(value)} className="font-inter">
                <span className="grid w-4 place-items-center">{extension === value && <Check className="size-4" />}</span>
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function splitEmailList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function validateEmailList(value: string) {
  return splitEmailList(value).every((email) => emailPattern.test(email));
}

function getRequiredValue(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    toast.error(`${label} is required.`);
    return null;
  }

  return value;
}

async function readAttachments(formData: FormData) {
  const files = [...formData.getAll("attachments"), ...formData.getAll("signature-attachments")].filter(
    (item): item is File => item instanceof File && item.size > 0,
  );

  if (files.length > maxAttachmentCount) {
    throw new Error(`You can upload up to ${maxAttachmentCount} attachments.`);
  }

  const oversizedFile = files.find((file) => file.size > maxAttachmentSize);
  if (oversizedFile) {
    throw new Error(`${oversizedFile.name} exceeds the 10 MB attachment limit.`);
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > maxTotalAttachmentSize) {
    throw new Error("Total attachments cannot exceed 20 MB.");
  }

  return Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      contentBase64: await fileToBase64(file),
    })),
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read attachment."));
    reader.readAsDataURL(file);
  });
}

function getEditorText(editor: Editor) {
  return editor.getText().replace(/\u00a0/g, " ").trim();
}

export function MailComposerCard({ title, description, includeMaskFromEmail, onSend, isSending, isCooldownActive, isQuotaAvailable = true, isLoadingCapacity }: MailComposerCardProps) {
  const attachmentsInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [extension, setExtension] = useState<string>(maskEmailExtensions[0] ?? "gov");
  const isDisabled = Boolean(isSending || isCooldownActive || isLoadingCapacity || !isQuotaAvailable);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !isDisabled,
    extensions: [
      StarterKit.configure({ heading: false }),
      TextStyle,
      FontFamily,
      FontSize,
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-56 px-5 py-4 font-inter text-sm leading-6 text-foreground outline-none",
      },
    },
  });
  const selectedFontFamily = (editor?.getAttributes("textStyle").fontFamily as string | undefined) ?? "Arial";
  const selectedFontSize = (editor?.getAttributes("textStyle").fontSize as string | undefined) ?? "14px";

  useEffect(() => {
    editor?.setEditable(!isDisabled);
  }, [editor, isDisabled]);

  function setLink() {
    if (!editor || isDisabled) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter link URL", previousUrl ?? "https://");

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function resetTransientFields(form: HTMLFormElement) {
    const toInput = form.elements.namedItem("to") as HTMLInputElement | null;

    if (toInput) toInput.value = "";
    if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
    if (signatureInputRef.current) signatureInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSending) return;
    if (isLoadingCapacity) {
      toast.error("Mailer capacity is still loading.");
      return;
    }
    if (isCooldownActive) {
      toast.error("Please wait for the cooldown to finish before sending another mail.");
      return;
    }
    if (!isQuotaAvailable) {
      toast.error("No remaining mailer allocation is available.");
      return;
    }
    if (!editor || !getEditorText(editor)) {
      toast.error("Content is required.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fromName = getRequiredValue(formData, "from-name", "From Name");
    const to = getRequiredValue(formData, "to", "To");
    const replyTo = getRequiredValue(formData, "reply-to", "Reply To");
    const subject = getRequiredValue(formData, "subject", "Subject");
    const fromEmailName = String(formData.get("from-email-name") ?? "").trim();
    const cc = String(formData.get("cc") ?? "").trim();
    const bcc = String(formData.get("bcc") ?? "").trim();

    if (!fromName || !to || !replyTo || !subject) return;
    if (!validateEmailList(to)) {
      toast.error("Enter valid recipient email addresses.");
      return;
    }
    if (!emailPattern.test(replyTo)) {
      toast.error("Enter a valid reply-to email address.");
      return;
    }
    if (cc && !validateEmailList(cc)) {
      toast.error("Enter valid CC email addresses.");
      return;
    }
    if (bcc && !validateEmailList(bcc)) {
      toast.error("Enter valid BCC email addresses.");
      return;
    }
    if (includeMaskFromEmail && !fromEmailName) {
      toast.error("From Email is required.");
      return;
    }

    let attachments: MailerSendPayload["attachments"];
    try {
      attachments = await readAttachments(formData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to prepare mail attachments.");
      return;
    }

    try {
      await onSend({
        fromName,
        previewText: String(formData.get("preview-text") ?? "").trim(),
        to,
        replyTo,
        cc,
        bcc,
        subject,
        fromEmail: includeMaskFromEmail ? `${fromEmailName}@uspto.${extension}` : undefined,
        attachments,
        content: editor.getHTML(),
      });
      resetTransientFields(form);
    } catch {
      return;
    }
  }

  return (
    <Card className="rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">{title}</h2>
          <p className="mt-1 font-inter text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <form className="space-y-6 p-5" noValidate onSubmit={handleSubmit}>
          <fieldset disabled={isDisabled} className="space-y-6 disabled:opacity-70">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {includeMaskFromEmail && <FromEmailField extension={extension} onExtensionChange={setExtension} disabled={isDisabled} />}
              {composerFields.map((field) => (
                <div key={field.id} className={cn(field.id === "subject" && "md:col-span-2 xl:col-span-3")}>
                  <ComposerLabel htmlFor={field.id} required={field.required}>{field.label}</ComposerLabel>
                  <div className="relative mt-2">
                    <field.icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={field.placeholder} disabled={isDisabled} className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <UploadBox title="Attachment" description="Upload files to include with your email." icon={Paperclip} inputName="attachments" disabled={isDisabled} inputRef={attachmentsInputRef} />
              <UploadBox title="Signature Image or Attachment" description="Upload a signature image or supporting signature file." icon={Signature} inputName="signature-attachments" disabled={isDisabled} inputRef={signatureInputRef} />
            </div>

            <div>
              <Label className="mb-3 font-google-sans text-sm font-semibold text-heading">Content<RequiredMark /></Label>
              <div className="overflow-hidden rounded-sm border border-border bg-background">
                <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" disabled={isDisabled} className="h-11 min-w-40 justify-between rounded-2xl bg-card px-4 font-inter font-normal">
                        {selectedFontFamily}
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      {fontFamilies.map((fontFamily) => (
                        <DropdownMenuItem key={fontFamily} onSelect={() => editor?.chain().focus().setFontFamily(fontFamily).run()} className="font-inter" style={{ fontFamily }}>
                          <span className="grid w-4 place-items-center">{selectedFontFamily === fontFamily && <Check className="size-4" />}</span>
                          {fontFamily}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" disabled={isDisabled} className="h-11 min-w-28 justify-between rounded-2xl bg-card px-4 font-inter font-normal">
                        {selectedFontSize}
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-24">
                      {fontSizes.map((fontSize) => (
                        <DropdownMenuItem key={fontSize} onSelect={() => editor?.chain().focus().setFontSize(fontSize).run()} className="justify-center font-inter">
                          <span className="grid w-4 place-items-center">{selectedFontSize === fontSize && <Check className="size-4" />}</span>
                          {fontSize}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ToolbarButton label="Bold" disabled={isDisabled} active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Italic" disabled={isDisabled} active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Underline" disabled={isDisabled} active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Align left" disabled={isDisabled} active={editor?.isActive({ textAlign: "left" })} onClick={() => editor?.chain().focus().setTextAlign("left").run()}><AlignLeft className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Align center" disabled={isDisabled} active={editor?.isActive({ textAlign: "center" })} onClick={() => editor?.chain().focus().setTextAlign("center").run()}><AlignCenter className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Align right" disabled={isDisabled} active={editor?.isActive({ textAlign: "right" })} onClick={() => editor?.chain().focus().setTextAlign("right").run()}><AlignRight className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Bullet list" disabled={isDisabled} active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Ordered list" disabled={isDisabled} active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolbarButton>
                  <ToolbarButton label="Link" disabled={isDisabled} active={editor?.isActive("link")} onClick={setLink}><LinkIcon className="size-4" /></ToolbarButton>
                </div>
                <div className={cn(isDisabled && "pointer-events-none opacity-60")}>
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end">
            <Button type="submit" disabled={isDisabled} className="h-10 rounded-full border-none px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
              {isLoadingCapacity ? "Loading Capacity" : !isQuotaAvailable ? "No Allocation" : isCooldownActive ? "Cooldown Active" : isSending ? "Sending" : "Send Mail"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}