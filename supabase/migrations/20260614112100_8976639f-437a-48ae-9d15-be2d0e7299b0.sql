
-- Only service_role should call this. Server-side code uses the admin client.
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;

-- Add an admin-read policy to rate_limits so the linter is satisfied and admins can audit.
CREATE POLICY rate_limits_admin_read ON public.rate_limits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
