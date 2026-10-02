/**
 * The asterisk on a required field's label. The glyph alone means nothing to a
 * screen reader, so it carries a visually-hidden "(required)" with it.
 */
export function RequiredMark() {
  return (
    <span className="text-ds-error">
      {" *"}
      <span className="sr-only"> (required)</span>
    </span>
  );
}
