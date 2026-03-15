export type UserResponseDTO = {
  id: string
  firstName: string
  lastName: string
  email: string
  privacity: 'public' | 'private'
  createdAt: string
  updatedAt: string
}

export type UserResponseWithFollowInfoDTO = UserResponseDTO & {
  followedByLoggedUser?: boolean;
  followRequestPending?: boolean;
  followRequestId?: string;
};