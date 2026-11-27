# React Bits components

Upstream: https://github.com/DavidHDev/react-bits
Pinned commit: 37f53df7efb61238b0fea9ea8be74e3cce62b959
License: MIT + Commons Clause. The complete notice is in LICENSE.txt and is shipped at /legal/react-bits-license.txt.

Imported JavaScript + CSS variants: TiltedCard, SpotlightCard, AnimatedContent, Topography, ShinyText, GlareHover.

Local adaptations: semantic roots, live reduced-motion/coarse-pointer disabling, progressively visible and focus-triggered reveals, CSS cascade layers, direct hex-color parsing for ShinyText, and ResizeObserver fallback for GlareHover. Topography is loaded on demand on supported pointer devices; the static background remains available. Gyroscope access, flipping and cursor tooltips are disabled.

ProjectShowcase.jsx is a portfolio-specific coverflow inspired by the Circular Carousel demo (https://reactbits.dev/components/circular-carousel), built with semantic project cards and independent controls instead of the upstream cylinder renderer. It preserves project sorting, localized descriptions, native detail buttons, thumbnails, reduced-motion support and viewport/modal/focus/visibility-aware playback.

TargetCursor (JavaScript + CSS): https://reactbits.dev/animations/target-cursor, pinned to 3e619ca31732d5d6849ecd5130ddd7b266aa7bd7. Local adaptations: larger violet brackets and central reticle, hover glow, a bounded CSS click pulse, preserved native pointers for editing/dragging/media, and lifecycle cleanup for visibility, keyboard, pointer cancellation and hybrid touch. PortfolioCursor disables the overlay for reduced motion and coarse pointers. Native project dialogs mount their own scoped cursor portal inside the top layer while the page cursor is unmounted; closing a dialog removes its scoped hiding rule and restores the page cursor. No additional dependencies or GPU renderer are used.

Hero hover stability: the cursor locks to the non-transformed `data-cursor-anchor` surrounding the artwork. The hero keeps its fixed CSS presentation angle and hover highlight; pointer-driven 3D rotation and scaling are disabled so small mouse movements cannot shake the artwork. Spring integration uses bounded substeps and critical damping to avoid low-frame-rate oscillation. The cursor overlay clips its decoration to the viewport so it cannot create scrolling overflow.

Carousel side cards use `data-cursor-lock="false"` to retain the compact cursor without framing their clipped, off-center bounds. Only the current card receives the full frame; changing the active card also releases any previous lock without requiring pointer movement.
