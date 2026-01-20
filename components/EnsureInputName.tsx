import React, { useEffect, useRef } from 'react';

type Props = {
  name: string;
  id?: string;
  children: React.ReactNode;
};

// Wrap any third-party input and ensure the underlying DOM <input>/<textarea>
// gets a `name` or `id` attribute so browsers can autofill it.
export default function EnsureInputName({ name, id, children }: Props) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // If the wrapped component exposes an input element as its root, use that.
    const target =
      (root instanceof HTMLInputElement || root instanceof HTMLTextAreaElement)
        ? root
        : (root.querySelector && (root.querySelector('input,textarea') as
            | HTMLInputElement
            | HTMLTextAreaElement
            | null));
    if (!target) return;
    if (id && !target.id) target.id = id;
    if (name && !target.name) target.name = name;
  }, [name, id]);

  // Render a wrapper element and place the child inside it. Many third-party
  // components render their DOM input somewhere inside their tree so we
  // discover it with querySelector.
  return <span ref={rootRef as any}>{children}</span>;
}
