# React Bits components

Upstream: https://github.com/DavidHDev/react-bits
Pinned commit: 37f53df7efb61238b0fea9ea8be74e3cce62b959
License: MIT + Commons Clause. The complete notice is in LICENSE.txt and is shipped at /legal/react-bits-license.txt.

Imported JavaScript + CSS variants: TiltedCard, SpotlightCard, AnimatedContent, Topography, ShinyText, GlareHover.

Local adaptations: semantic roots, live reduced-motion/coarse-pointer disabling, progressively visible and focus-triggered reveals, CSS cascade layers, direct hex-color parsing for ShinyText, and ResizeObserver fallback for GlareHover. Topography is loaded on demand on supported pointer devices; the static background remains available. Gyroscope access, flipping and cursor tooltips are disabled.

ProjectShowcase.jsx is a portfolio-specific coverflow inspired by the Circular Carousel demo (https://reactbits.dev/components/circular-carousel), built with semantic project cards and independent controls instead of the upstream cylinder renderer. It preserves project sorting, localized descriptions, native detail buttons, thumbnails, reduced-motion support and viewport/modal/focus/visibility-aware playback.
