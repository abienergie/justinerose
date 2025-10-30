@@ .. @@
 CREATE POLICY "Students can update own profile"
   ON profiles FOR UPDATE
   TO authenticated
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id);

+-- Allow service_role to access profiles for authentication
+CREATE POLICY "Service role can access profiles"
+  ON profiles FOR SELECT
+  TO service_role
+  USING (true);
+
 -- RLS Policies for course_packages table