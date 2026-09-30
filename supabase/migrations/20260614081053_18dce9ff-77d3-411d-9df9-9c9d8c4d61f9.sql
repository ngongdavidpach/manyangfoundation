
-- Enums
CREATE TYPE public.contact_type AS ENUM ('donor','lead','partner','volunteer','beneficiary');
CREATE TYPE public.lifecycle_stage AS ENUM ('lead','qualified','engaged','donor','lapsed');
CREATE TYPE public.interaction_type AS ENUM ('email','call','meeting','note','task');
CREATE TYPE public.donation_method AS ENUM ('stripe','cash','bank_transfer','cheque','mobile_money','other');
CREATE TYPE public.donation_status AS ENUM ('pending','completed','refunded','failed');
CREATE TYPE public.expense_status AS ENUM ('planned','approved','paid','cancelled');

-- Receipt number sequence
CREATE SEQUENCE public.receipt_number_seq START 1000;

-- Contacts
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type contact_type NOT NULL DEFAULT 'lead',
  lifecycle_stage lifecycle_stage NOT NULL DEFAULT 'lead',
  full_name text NOT NULL,
  email text,
  phone text,
  organization text,
  country text,
  tags text[] NOT NULL DEFAULT '{}',
  source text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contacts_user_id_idx ON public.contacts(user_id);
CREATE INDEX contacts_type_idx ON public.contacts(type);
CREATE INDEX contacts_stage_idx ON public.contacts(lifecycle_stage);
CREATE INDEX contacts_email_idx ON public.contacts(lower(email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_admin_all ON public.contacts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY contacts_self_read ON public.contacts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Contact interactions
CREATE TABLE public.contact_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  type interaction_type NOT NULL DEFAULT 'note',
  subject text,
  body text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  follow_up_at timestamptz,
  completed boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_interactions_contact_idx ON public.contact_interactions(contact_id);
CREATE INDEX contact_interactions_followup_idx ON public.contact_interactions(follow_up_at) WHERE follow_up_at IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_interactions TO authenticated;
GRANT ALL ON public.contact_interactions TO service_role;
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY interactions_admin_all ON public.contact_interactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Donations
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  method donation_method NOT NULL DEFAULT 'stripe',
  status donation_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text UNIQUE,
  stripe_session_id text UNIQUE,
  designation text,
  donor_name text,
  donor_email text,
  is_anonymous boolean NOT NULL DEFAULT false,
  message text,
  received_at timestamptz NOT NULL DEFAULT now(),
  receipt_number bigint UNIQUE,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX donations_contact_idx ON public.donations(contact_id);
CREATE INDEX donations_user_idx ON public.donations(user_id);
CREATE INDEX donations_received_idx ON public.donations(received_at);
CREATE INDEX donations_status_idx ON public.donations(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY donations_admin_all ON public.donations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY donations_self_read ON public.donations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Receipts
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  receipt_number bigint NOT NULL,
  storage_path text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  issued_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX receipts_donation_idx ON public.receipts(donation_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY receipts_admin_all ON public.receipts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY receipts_self_read ON public.receipts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.user_id = auth.uid()));

-- Expense categories
CREATE TABLE public.expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  annual_budget_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY expense_categories_admin_all ON public.expense_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Expenses
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  vendor text,
  description text NOT NULL,
  program_pillar text,
  incurred_at date NOT NULL DEFAULT current_date,
  paid_at date,
  status expense_status NOT NULL DEFAULT 'planned',
  receipt_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX expenses_category_idx ON public.expenses(category_id);
CREATE INDEX expenses_incurred_idx ON public.expenses(incurred_at);
CREATE INDEX expenses_status_idx ON public.expenses(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_admin_all ON public.expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Budgets
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year int NOT NULL,
  category_id uuid REFERENCES public.expense_categories(id) ON DELETE CASCADE,
  planned_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(fiscal_year, category_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT ALL ON public.budgets TO service_role;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budgets_admin_all ON public.budgets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Updated_at triggers (reuse existing set_updated_at)
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_interactions_updated BEFORE UPDATE ON public.contact_interactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_donations_updated BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_expense_categories_updated BEFORE UPDATE ON public.expense_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_budgets_updated BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Assign receipt number on completion
CREATE OR REPLACE FUNCTION public.assign_receipt_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.receipt_number IS NULL THEN
    NEW.receipt_number := nextval('public.receipt_number_seq');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_donations_receipt_number BEFORE INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.assign_receipt_number();
