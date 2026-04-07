import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/** Validates that a string is a valid UUID v4 */
export function IsUUID(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUUID',
      target: (object as { constructor: Function }).constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid UUID`;
        },
      },
    });
  };
}

/** Validates that a number is a positive monetary amount (> 0, max 2 decimal places) */
export function IsPositiveMoney(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPositiveMoney',
      target: (object as { constructor: Function }).constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'number') return false;
          if (value <= 0) return false;
          if (value > 1_000_000) return false;
          const str = value.toString();
          const decimalIdx = str.indexOf('.');
          if (decimalIdx !== -1 && str.length - decimalIdx - 1 > 2) return false;
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive monetary amount (max 1,000,000 with up to 2 decimal places)`;
        },
      },
    });
  };
}
