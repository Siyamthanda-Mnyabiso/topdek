interface TourOverlayProps {
  rect: DOMRect | null
  reduceMotion: boolean
}

/** Dims the whole page and cuts a "spotlight" around the active target via
 * a giant box-shadow — the standard technique for this, avoids needing an
 * SVG mask. A separate full-viewport layer blocks clicks everywhere
 * (including on the highlighted element itself) so the tour can only be
 * advanced with its own Back/Next/Skip controls. */
export function TourOverlay({ rect, reduceMotion }: TourOverlayProps) {
  return (
    <>
      <div className="fixed inset-0 z-[90]" aria-hidden="true" />
      {rect && (
        <div
          className={
            'fixed z-[91] rounded border-2 border-white' +
            (reduceMotion ? '' : ' transition-[top,left,width,height] duration-300 ease-out')
          }
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
