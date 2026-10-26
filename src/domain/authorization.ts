export default interface Authorization {
  auth(
    authorization: AuthorizationModel
  ): Promise<ErrorResponse | AuthorizationSuccess>;
}

export interface AuthorizationModel {
  email: string;
  password: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export interface AuthorizationSuccess {
  accessToken: string;
  name: string;
}

export interface Account {
  id: string;
  name: string;
  passwordHash: string;
}
