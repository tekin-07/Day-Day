import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode, useId } from "react";
import { tr } from "../i18n/tr";

export function Modal({
  title,
  description,
  children,
  close,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const descriptionId = useId();
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content
          className={`dialog ${wide ? "dialog-wide" : ""}`}
          aria-describedby={description ? descriptionId : undefined}
        >
          <div className="dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <button type="button" className="quiet" onClick={close}>
              {tr.close}
            </button>
          </div>
          {description && <Dialog.Description id={descriptionId}>{description}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
