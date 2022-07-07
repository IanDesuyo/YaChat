export enum AuthType {
  Unauthorized = 0,
  Authenticated = 1,
}

export interface SignUpAttributes {
  nickname: string;
}

export interface UserAttributes extends SignUpAttributes {
  email: string;
  email_verified: boolean;
}

export interface IUser {
  attributes: UserAttributes;
  username: string;
}

export interface IAuth {
  isAuthenticated: AuthType | null;
  user: IUser | null;
  getCurrentUser: () => Promise<CognitoUser>;
  getCurrentSession: () => Promise<CognitoUserSession>;
  getCurrentToken: () => Promise<string>;
  getCurrentUserAttributes: () => Promise<UserAttributes>;
  setCurrentUserAttributes: (attributes: { [key: string]: any }) => Promise<unknown>;
  signIn: (email: string, password: string) => Promise<CognitoUserSession>;
  signUp: (email: string, password: string, attributes: SignUpAttributes) => Promise<CognitoUser>;
  verificationCode: (email: string, code: string) => Promise<string>;
  signOut: () => Promise<true>;
}
