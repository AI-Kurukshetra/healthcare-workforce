export type AvailabilityRange = {
  start: string;
  end: string;
};

export type AvailabilityDay = {
  day: string; // mon,tue,wed,thu,fri,sat,sun
  ranges: AvailabilityRange[];
};

export type StaffSkill = {
  id: string;
  name: string;
  category: string | null;
  level: string | null;
  expires_at?: string | null;
  certification_number?: string | null;
};

export type StaffCredential = {
  id: string;
  type: string;
  status: string;
  expires_at: string | null;
  license_number: string | null;
  days_remaining?: number | null;
  alert_level?: string | null;
};

export type CredentialAlert = StaffCredential & {
  staff_id: string;
  staff_name: string | null;
};

export type StaffListItem = {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  title: string | null;
  phone: string | null;
  email: string | null;
  shift_preference: string | null;
  availability: AvailabilityDay[] | null;
  skills: StaffSkill[];
};

export type StaffDetail = StaffListItem & {
  firstName: string;
  lastName: string;
  departmentId: string | null;
  unitId: string | null;
  emergency_contact: Record<string, string> | null;
  credentials: StaffCredential[];
};

export type SkillMatrixShape = {
  skills: { id: string; name: string; category: string | null }[];
  staff: Array<
    StaffListItem & {
      skills: StaffSkill[];
    }
  >;
};

export type RegisteredProfileOption = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "manager" | "staff";
};
