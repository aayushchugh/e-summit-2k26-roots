export enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  USER = "user",
}

export type UserPass = {
  name: string;
  status: string;
};

export type User = {
  id?: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: UserRole;
  pass?: UserPass | null;
};
