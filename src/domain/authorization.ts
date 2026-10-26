export default interface Authorization {
  auth(authorization: AuthorizationModel): Promise<void>;
}

export interface AuthorizationModel {
  email: string;
  password: string;
}

export interface LoadAccountByEmailRepository {
  loadByEmail(email: string): Promise<Account | null>;
}

export interface Account {
  id: string;
  name: string;
  passwordHash: string;
}
