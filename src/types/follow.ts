import type { UserResponseDTO } from "./user";

export type FollowDto = {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: Date;
  follower: Pick<UserResponseDTO, "id" | "firstName" | "lastName" | "email">;
  followed: Pick<UserResponseDTO, "id" | "firstName" | "lastName" | "email">;
};

export type FollowRequestStatus = "pending" | "approved" | "rejected";

export type FollowRequestDto = {
  id: string;
  followerId: string;
  followedId: string;
  follower: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  followed: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: FollowRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type FollowRequestProcessingAction = "accept" | "reject";

export const FollowRequestProcessingAction = {
  ACCEPT: "accept",
  REJECT: "reject",
} as const;
