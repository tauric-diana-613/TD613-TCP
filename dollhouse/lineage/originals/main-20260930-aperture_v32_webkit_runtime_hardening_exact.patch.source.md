--- a/app/aperture/tool.html
+++ b/app/aperture/tool.html
@@ -11544,7 +11544,13 @@
     if (rt.needsSync || !rt.snapshot) synchronizeFieldState({ appendTraces: false });
   }
 
-  drawMain();
+  const settings = getRuntimeSettings();
+  const mainIntervalMs = 1000 / Math.max(settings.mainHz, 1);
+  rt.mainAccumulatorMs += frameMs;
+  if (state.frameCount < 2 || rt.mainAccumulatorMs >= mainIntervalMs || rt.forceUIRefresh || rt.forceHeavyUIRefresh) {
+    rt.mainAccumulatorMs = mainIntervalMs > 0 ? rt.mainAccumulatorMs % mainIntervalMs : 0;
+    drawMain();
+  }
 
   /*
     v2.9.5 dromology uses the existing Aperture frame clock.
@@ -11576,7 +11582,6 @@
     }
   }
 
-  const settings = getRuntimeSettings();
   const auxIntervalMs = 1000 / Math.max(settings.auxHz, 1);
   const uiIntervalMs = 1000 / Math.max(settings.uiHz, 1);
   rt.auxAccumulatorMs += frameMs;
@@ -23542,6 +23547,7 @@
   var fieldAnimationStarted = false;
   var fieldAnimationFrame = 0;
   var fieldAnimationVisible = false;
+  var reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
   var cachedOps = { propagation:0.5, compression:0.38, coupling:0.44, transition:0.36, stabilization:0.6 };
   var fieldBox = { w:0, h:0, dpr:1, ctx:null, lastMeasure:0, visible:false };
 
@@ -23641,6 +23647,10 @@
     function frame(now){
       fieldAnimationFrame = 0;
       if (document.hidden || !fieldAnimationVisible) return;
+      if (reducedMotionQuery && reducedMotionQuery.matches) {
+        drawField(cachedOps, now);
+        return;
+      }
       var targetMs = 24;
       if (!lastFrame || now - lastFrame >= targetMs) {
         lastFrame = now;
@@ -23649,9 +23659,16 @@
       fieldAnimationFrame = requestAnimationFrame(frame);
     }
     function schedule(){
-      if (!document.hidden && fieldAnimationVisible && !fieldAnimationFrame) {
-        fieldAnimationFrame = requestAnimationFrame(frame);
+      if (fieldAnimationFrame && (document.hidden || !fieldAnimationVisible || (reducedMotionQuery && reducedMotionQuery.matches))) {
+        cancelAnimationFrame(fieldAnimationFrame);
+        fieldAnimationFrame = 0;
       }
+      if (document.hidden || !fieldAnimationVisible) return;
+      if (reducedMotionQuery && reducedMotionQuery.matches) {
+        drawField(cachedOps, performance.now());
+        return;
+      }
+      if (!fieldAnimationFrame) fieldAnimationFrame = requestAnimationFrame(frame);
     }
     var canvas = $('v294FieldCanvas');
     if (canvas) {
@@ -23680,6 +23697,9 @@
       }, { passive:true });
     }
     document.addEventListener('visibilitychange', schedule, { passive:true });
+    if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === 'function') {
+      reducedMotionQuery.addEventListener('change', schedule);
+    }
   }
 
   function relocateResidueFallback(){
