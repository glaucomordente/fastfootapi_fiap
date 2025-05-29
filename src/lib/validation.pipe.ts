import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CustumerEntity } from "../modules/customer/adapters/out/persistence/entities/Customer.entity";

export const ValidationPipe = (entityClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    try {
      // Transform plain object to class instance
      const entityInstance = plainToInstance(entityClass, req.body);

      // Validate the instance
      const errors: ValidationError[] = await validate(entityInstance);

      if (errors.length > 0) {
        const validationErrors = errors.reduce(
          (acc: any, err: ValidationError) => {
            if (err.constraints) {
              return { ...acc, ...err.constraints };
            }
            return acc;
          },
          {}
        );

        return res.status(400).json({
          errors: validationErrors,
          message: "Validation failed",
        });
      }

      // Add validated instance to request
      req.body = entityInstance;
      next();
    } catch (error) {
      console.error("Validation error:", error);
      return res.status(500).json({
        error: "Internal server error during validation",
      });
    }
  };
};
