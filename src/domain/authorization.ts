export default interface Authorization {
  auth(authorization: AuthorizationModel): Promise<ErrorResponse | undefined>;
}

export interface AuthorizationModel {
  email: string;
  password: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export interface Account {
  id: string;
  name: string;
  passwordHash: string;
}
