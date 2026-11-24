/**
 * The ambient colour behind the whole app. Four oversized, heavily blurred
 * fields drift over ~30s each; the glass surfaces above them pick the colour
 * up through their translucency. Purely decorative, so it is hidden from
 * assistive tech and never intercepts a pointer.
 */
export function Aurora() {
  return (
    <div aria-hidden className="aurora" data-slot="aurora">
      <span
        className="aurora-blob block"
        style={{
          left: "-16%",
          top: "-22%",
          width: "58vw",
          height: "58vw",
          background: "radial-gradient(circle at 40% 40%, rgb(99 102 241 / 0.5), transparent 68%)",
        }}
      />
      <span
        className="aurora-blob block"
        style={{
          right: "-14%",
          top: "-4%",
          width: "46vw",
          height: "46vw",
          background: "radial-gradient(circle at 55% 45%, rgb(45 212 191 / 0.36), transparent 66%)",
        }}
      />
      <span
        className="aurora-blob block"
        style={{
          left: "16%",
          bottom: "-30%",
          width: "52vw",
          height: "52vw",
          background: "radial-gradient(circle at 50% 45%, rgb(251 191 36 / 0.26), transparent 66%)",
        }}
      />
      <span
        className="aurora-blob block"
        style={{
          right: "-10%",
          bottom: "-18%",
          width: "42vw",
          height: "42vw",
          background: "radial-gradient(circle at 45% 55%, rgb(168 85 247 / 0.34), transparent 66%)",
        }}
      />
    </div>
  );
}
