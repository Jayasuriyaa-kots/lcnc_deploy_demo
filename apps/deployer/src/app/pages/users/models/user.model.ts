export type UserStatus = 'active' | 'inactive';

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  profilePhotoDataUrl?: string;
  status?: UserStatus;
}

export interface UserModel {
  id: string;
  organisationId: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  lastLogin: string;
  sessionHours: string;
  profilePhotoDataUrl?: string;
  createdAt: string;
}
