declare enum AuthType {
  Unauthorized = 0,
  Authenticated = 1,
}

declare interface SignUpAttributes {
  nickname: string;
}

declare interface UserAttributes extends SignUpAttributes {
  email: string;
  email_verified: boolean;
}

declare interface IUser {
  attributes: UserAttributes;
  username: string;
}

declare interface IAuth {
  isAuthenticated: AuthType | null;
  user: IUser | null;
  getCurrentUser: () => Promise<CognitoUser>;
  getCurrentSession: () => Promise<CognitoUserSession>;
  getCurrentToken: () => Promise<string>;
  getCurrentUserAttributes: () => Promise<UserAttributes>;
  setCurrentUserAttributes: (attributes: { [key: string]: any }) => Promise<unknown>;
  signIn: (email: string, password: string) => Promise<CognitoUserSession>;
  signUp: (email: string, password: string, attributes: SignUpAttributes) => Promise<CognitoUser>;
  signOut: () => Promise<true>;
}
