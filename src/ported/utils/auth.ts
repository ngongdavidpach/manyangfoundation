import type { User, UserRole } from "../types/auth";

// NOTE: Legacy localStorage-backed auth (hashPassword / authenticateUser /
// registerUser / verifyPassword / saveSession / loadSession / getUsersDB)
// has been removed for security. Authentication now flows exclusively
// through Supabase Auth via AuthContext. Do not reintroduce these helpers.

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const generateReferenceCode = (prefix: string): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${new Date().getFullYear()}-${randomNum}`;
};

// Password strength evaluation (UI only — does not store anything)
export const getPasswordStrength = (
  password: string,
): {
  score: number;
  label: string;
  color: string;
  requirements: Record<string, boolean>;
} => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  if (score <= 2) return { score, label: "Weak", color: "red", requirements };
  if (score <= 3) return { score, label: "Fair", color: "amber", requirements };
  if (score <= 4) return { score, label: "Strong", color: "blue", requirements };
  return { score, label: "Very Strong", color: "emerald", requirements };
};

// Application / donation history are demo helpers kept only for the
// dashboard UI; real records should move to Supabase tables in a future pass.
const APPS_DB_KEY = "mdf_applications_db";
const DONATIONS_DB_KEY = "mdf_donations_db";

export const saveApplication = (record: {
  userId: string;
  type: string;
  title: string;
  summary: string;
  referenceCode: string;
}): void => {
  const raw = localStorage.getItem(APPS_DB_KEY);
  const db = raw ? JSON.parse(raw) : [];
  db.push({
    id: generateId(),
    ...record,
    status: "pending",
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem(APPS_DB_KEY, JSON.stringify(db));
};

export const getApplications = (userId: string) => {
  const raw = localStorage.getItem(APPS_DB_KEY);
  const db: any[] = raw ? JSON.parse(raw) : [];
  return db.filter((a) => a.userId === userId);
};

export const saveDonation = (record: {
  userId: string;
  amount: number;
  frequency: string;
  pillar: string;
  referenceCode: string;
}): void => {
  const raw = localStorage.getItem(DONATIONS_DB_KEY);
  const db = raw ? JSON.parse(raw) : [];
  db.push({
    id: generateId(),
    ...record,
    status: "completed",
    date: new Date().toISOString(),
  });
  localStorage.setItem(DONATIONS_DB_KEY, JSON.stringify(db));
};

export const getDonations = (userId: string) => {
  const raw = localStorage.getItem(DONATIONS_DB_KEY);
  const db: any[] = raw ? JSON.parse(raw) : [];
  return db.filter((d) => d.userId === userId);
};

// Authorization helpers (presentation only)
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    guest: "Guest",
    member: "Member",
    donor: "Supporter",
    volunteer: "Volunteer",
    beneficiary: "Beneficiary",
    admin: "Administrator",
  };
  return labels[role];
};

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    guest: "bg-slate-100 text-slate-700",
    member: "bg-blue-100 text-blue-700",
    donor: "bg-amber-100 text-amber-700",
    volunteer: "bg-emerald-100 text-emerald-700",
    beneficiary: "bg-purple-100 text-purple-700",
    admin: "bg-red-100 text-red-700",
  };
  return colors[role];
};
