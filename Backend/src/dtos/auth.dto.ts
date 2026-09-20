import { User, Role } from '@prisma/client';

// ---------------------------------------------------------
// RESPONSE DTOs
// ---------------------------------------------------------

export interface UserResponseDTO {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: UserResponseDTO;
}

// ---------------------------------------------------------
// MAPPERS
// ---------------------------------------------------------

/**
 * Strips raw Prisma User object of sensitive fields (passwordHash, deletedAt, googleId)
 * and formats it precisely for the frontend contract.
 */
export const toUserResponseDTO = (user: User & { role?: Role }): UserResponseDTO => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role ? user.role.name : 'UNKNOWN_ROLE',
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
};
