--- a/app/aperture/tool.html
+++ b/app/aperture/tool.html
@@ -11557,18 +11557,19 @@
     One lean refresh approximately every 125 ms; no extra RAF, interval,
     mouse handler, scroll governor, or visibility observer.
   */
+  const reducedMotionActive = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   rt.dromoAccumulatorMs = (rt.dromoAccumulatorMs || 0) + frameMs;
   if (rt.dromoAccumulatorMs >= 250) {
     rt.dromoAccumulatorMs %= 250;
     try {
-      if (typeof window.__TD613_V295_DROMO_FRAME_SYNC === "function") {
+      if (!reducedMotionActive && typeof window.__TD613_V295_DROMO_FRAME_SYNC === "function") {
         window.__TD613_V295_DROMO_FRAME_SYNC({
           snapshot: rt.snapshot,
           frameMs,
           running: state.running
         });
       }
-      if (typeof window.__TD613_V3_ANTI_EPI_FRAME_SYNC === "function") {
+      if (!reducedMotionActive && typeof window.__TD613_V3_ANTI_EPI_FRAME_SYNC === "function") {
         window.__TD613_V3_ANTI_EPI_FRAME_SYNC({
           snapshot: rt.snapshot,
           frameMs,
