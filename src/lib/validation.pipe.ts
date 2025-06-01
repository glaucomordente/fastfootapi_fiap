import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CustomerEntity } from '../modules/customer/adapters/out/persistence/entities/Customer.entity';

const validateCustomer = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const customerData = plainToClass(CustomerEntity, req.body);
    validate(customerData).then(errors => {
      if (errors.length > 0) {
        const validationErrors = errors.reduce((acc, err) => {
          return { ...acc, ...err.constraints };
        }, {});
        res.status(400).json({ errors: validationErrors });
        return;
      }

      req.body = customerData;
      next();
    }).catch(error => {
      res.status(400).json({ error: 'Validation failed' });
    });
  } catch (error) {
    res.status(400).json({ error: 'Validation failed' });
  }
};

export const validationMiddleware = {
  validateCustomer
};
