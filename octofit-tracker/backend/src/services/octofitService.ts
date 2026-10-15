--- a/octofit-tracker/backend/src/services/octofitService.ts
+++ b/octofit-tracker/backend/src/services/octofitService.ts
@@
-  const { userId, teamId, type, minutes } = body;
-  const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
-  if (!isObjectId(userId) || !isObjectId(teamId) || typeof type !== 'string' || type.trim().length === 0 || typeof minutes !== 'number' || !Number.isFinite(minutes)) {
-    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
-  }
+  const { userId, teamId, type, minutes } = body;
+  const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
+  // Require minutes to be a finite number and strictly positive (> 0)
+  if (
+    !isObjectId(userId) ||
+    !isObjectId(teamId) ||
+    typeof type !== 'string' ||
+    type.trim().length === 0 ||
+    typeof minutes !== 'number' ||
+    !Number.isFinite(minutes) ||
+    minutes <= 0
+  ) {
+    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
+  }
