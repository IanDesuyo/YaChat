import { ObjectId } from "mongodb";

class ParserError {
  statusCode: number;
  response: {
    message: string;
    i18n: string;
  };
}

export const parseObjectId = (id: string): ObjectId => {
  if (!ObjectId.isValid(id)) {
    throw {
      statusCode: 400,
      response: {
        message: "Invalid ObjectId",
        i18n: "invalid.objectId",
      },
    } as ParserError;
  }

  return new ObjectId(id);
};
