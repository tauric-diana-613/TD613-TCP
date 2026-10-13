--- a/app/aperture/tool.html
+++ b/app/aperture/tool.html
@@ -11606,7 +11606,7 @@
     }
   }
 
-  requestAnimationFrame(tick);
+  if (!reducedMotionActive) requestAnimationFrame(tick);
 }
 
 // ── Controls ──────────────────────────────────────────────────
