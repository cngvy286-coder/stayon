"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

import { Icon } from "./Icon";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Accessible modal built on the native <dialog> element:
 * focus is trapped inside, Esc closes it, and the page behind is inert.
 * Clicking the dimmed backdrop also closes it.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // showModal/close are missing in some test environments (jsdom); fall back to the attribute.
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-xl font-bold tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="-mt-1 -mr-1 grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
