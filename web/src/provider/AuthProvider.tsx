import { createContext, useCallback, useEffect, useState } from "react";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  CognitoUserSession,
  AuthenticationDetails,
  ISignUpResult,
} from "amazon-cognito-identity-js";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IAuth, IUser, UserAttributes, SignUpAttributes } from "../types/auth";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_COGNITO_USERPOOL as string,
  ClientId: process.env.REACT_APP_COGNITO_CLIENTID as string,
});

enum AuthType {
  Unauthorized = 0,
  Authenticated = 1,
}

export const AuthContext = createContext<IAuth>({} as any);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = useToast();
  const [isAuthenticated, setAuthenticated] = useState<AuthType | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const navigate = useNavigate();

  const getCurrentUser = async (getSession = false) => {
    const currentUser = userPool.getCurrentUser();

    return new Promise((resolve, reject) => {
      if (currentUser && getSession) {
        currentUser.getSession((err: Error | undefined, session: CognitoUserSession | null) => {
          if (err) {
            return reject(err);
          }

          return resolve(currentUser);
        });
      }

      resolve(currentUser);
    }).catch(err => {
      throw err;
    }) as Promise<CognitoUser | null>;
  };

  const getCurrentSession = async () => {
    const currentUser = await getCurrentUser();

    return new Promise((resolve, reject) => {
      currentUser?.getSession((err: Error | undefined, session: CognitoUserSession | null) => {
        if (err) {
          return reject(err);
        }

        resolve(session);
      });
    }).catch(err => {
      throw err;
    }) as Promise<CognitoUserSession>;
  };

  const getCurrentToken = async () => {
    const session = await getCurrentSession();

    return new Promise((resolve, reject) => {
      const token = session?.getIdToken().getJwtToken();

      if (!token) {
        return reject(new Error("No token"));
      }

      resolve(token);
    }).catch(err => {
      throw err;
    }) as Promise<string>;
  };

  const getCurrentUserAttributes = useCallback(async () => {
    const currentUser = await getCurrentUser(true);

    return new Promise((resolve, reject) => {
      currentUser?.getUserAttributes((err: Error | undefined, attributes: CognitoUserAttribute[] | undefined) => {
        if (err) {
          return reject(err);
        }

        const userAttributes = attributes
          ? attributes.reduce((acc, attribute) => {
              (acc as any)[attribute.getName()] = attribute.getValue();
              return acc;
            }, {})
          : {};

        resolve(userAttributes);
      });
    }).catch(err => {
      throw err;
    }) as Promise<UserAttributes>;
  }, []);

  const setCurrentUserAttributes = async (attributes: { [key: string]: any }) => {
    const currentUser = await getCurrentUser();

    const cognitoAttributes = Object.entries(attributes).map(([Name, Value]) => {
      return new CognitoUserAttribute({ Name, Value });
    });

    return new Promise((resolve, reject) => {
      currentUser?.updateAttributes(cognitoAttributes, (err: Error | undefined, result: string | undefined) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    }).catch(err => {
      throw err;
    });
  };

  const signIn = async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      new CognitoUser({
        Username: email,
        Pool: userPool,
      }).authenticateUser(
        new AuthenticationDetails({
          Username: email,
          Password: password,
        }),
        {
          onSuccess: (session: CognitoUserSession) => {
            updateAuth().then(user => {
              resolve(session);
              setAuthenticated(AuthType.Authenticated);

              toast({
                title: "登入成功",
                description: `歡迎回來, ${user?.attributes.nickname}`,
                status: "success",
              });
            });
          },
          onFailure: (err: Error) => {
            reject(err);
          },
        }
      );
    }).catch(err => {
      throw err;
    }) as Promise<CognitoUserSession>;
  };

  const signUp = async (email: string, password: string, attributes: SignUpAttributes) => {
    const cognitoAttributes = Object.entries(attributes).map(([Name, Value]) => {
      return new CognitoUserAttribute({ Name, Value });
    });

    return new Promise((resolve, reject) => {
      userPool.signUp(
        email,
        password,
        cognitoAttributes,
        [],
        (err: Error | undefined, result: ISignUpResult | undefined) => {
          if (err) {
            return reject(err);
          }

          resolve(result?.user);
        }
      );
    }).catch(err => {
      throw err;
    }) as Promise<CognitoUser>;
  };

  const signOut = async () => {
    const currentUser = await getCurrentUser();

    return new Promise((resolve, _) => {
      navigate("/");
      currentUser?.signOut();
      updateAuth();
      resolve(true);
    }).catch(err => {
      throw err;
    }) as Promise<true>;
  };

  const updateAuth = useCallback(async (): Promise<IUser | null> => {
    const currentUser = await getCurrentUser(true);

    if (currentUser) {
      const attributes = await getCurrentUserAttributes();

      const user = {
        username: currentUser?.getUsername() as string,
        attributes,
      };

      setUser(user);
      setAuthenticated(AuthType.Authenticated);
      return user;
    }

    setUser(null);
    setAuthenticated(AuthType.Unauthorized);
    return null;
  }, [getCurrentUserAttributes]);

  useEffect(() => {
    updateAuth();
  }, [updateAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        getCurrentUser,
        getCurrentSession,
        getCurrentToken,
        getCurrentUserAttributes,
        setCurrentUserAttributes,
        signIn,
        signUp,
        signOut,
      }}
    >
      {isAuthenticated !== null ? children : <p>Loading</p>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
