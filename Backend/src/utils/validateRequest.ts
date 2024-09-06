import { ObjectSchema } from "joi";
import { CustomError } from "./CustomError";

const validateRequest = <T>({ schema, data }: { schema: ObjectSchema<T>; data: object }) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new CustomError(400, error.details[0].message);
  }
  return value;
};

export {validateRequest}