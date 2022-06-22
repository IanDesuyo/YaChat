import * as jose from "jose";

export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly userName: string;
  readonly clientId: string;
  readonly isValid: boolean;
  readonly error?: any;
}

interface TokenHeader {
  kid: string;
  alg: string;
}

interface PublicKey extends jose.JWK {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

interface PublicKeyMeta {
  instance: PublicKey;
  pem: jose.KeyLike | Uint8Array;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

const cognitoPoolId = process.env.COGNITO_POOL_ID;
if (!cognitoPoolId) {
  throw new Error("env var required for cognito pool");
}
const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/${cognitoPoolId}`;

let cacheKeys: MapOfKidToPublicKey | undefined;
const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (cacheKeys) {
    return cacheKeys;
  }

  const publicKeys = await fetch(`${cognitoIssuer}/.well-known/jwks.json`).then(
    res => res.json() as Promise<PublicKeys>
  );

  const keys: MapOfKidToPublicKey = {};
  publicKeys.keys.forEach(async key => {
    keys[key.kid] = {
      instance: key,
      pem: await jose.importJWK(key),
    };
  });

  cacheKeys = keys;
  return keys;
};

const handler = async (token: string): Promise<ClaimVerifyResult> => {
  try {
    const tokenSections = (token || "").split(".");
    if (tokenSections.length < 2) {
      throw new Error("requested token is invalid");
    }

    const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
    const header = JSON.parse(headerJSON) as TokenHeader;

    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      throw new Error("claim made for unknown kid");
    }

    const { payload } = (await jose.jwtVerify(token, key.pem, {
      issuer: cognitoIssuer,
    })) as any as { payload: Claim };

    const currentSeconds = Math.floor(new Date().valueOf() / 1000);
    if (currentSeconds > payload.exp || currentSeconds < payload.auth_time) {
      throw new Error("claim is expired or invalid");
    }

    return {
      userName: payload.username,
      clientId: payload.client_id,
      isValid: true,
    };
  } catch (error) {
    console.log(error);
    return { userName: "", clientId: "", error, isValid: false };
  }
};

export default handler;
