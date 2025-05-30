/**
 * CustomerValidations
 *
 * This class contains all validation rules for customer data.
 * It follows the Single Responsibility Principle by centralizing all validation logic.
 */
export class CustomerValidations {
  /**
   * Validates a CPF number
   * @param cpf The CPF to validate
   * @returns true if valid, false otherwise
   */
  static validateCPF(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, "");

    // Check if CPF has 11 digits
    if (cleanCPF.length !== 11) {
      return false;
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rest = 11 - (sum % 11);
    const digit1 = rest > 9 ? 0 : rest;
    if (digit1 !== parseInt(cleanCPF.charAt(9))) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    rest = 11 - (sum % 11);
    const digit2 = rest > 9 ? 0 : rest;
    if (digit2 !== parseInt(cleanCPF.charAt(10))) {
      return false;
    }

    return true;
  }

  /**
   * Validates an email address
   * @param email The email to validate
   * @returns true if valid, false otherwise
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates a phone number
   * @param phone The phone number to validate
   * @returns true if valid, false otherwise
   */
  static validatePhone(phone: string): boolean {
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, "");

    // Brazilian phone numbers should have 10 or 11 digits
    // (DDD + 8 or 9 digits)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  }

  /**
   * Validates a customer name
   * @param name The name to validate
   * @returns true if valid, false otherwise
   */
  static validateName(name: string): boolean {
    return name.trim().length > 0;
  }
}
