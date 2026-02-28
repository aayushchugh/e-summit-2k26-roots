export enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  USER = "user",
}

export type User = {
  id?: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: UserRole;
  avatar?: string | null;
};
