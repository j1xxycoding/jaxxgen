// Luhn algorithm for card number validation
export function generateLuhn(partialNumber: string): string {
  let sum = 0;
  let shouldDouble = false;
  
  // Add all digits to the sum
  for (let i = partialNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(partialNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  // Calculate check digit
  const checkDigit = ((Math.floor(sum / 10) + 1) * 10 - sum) % 10;
  return partialNumber + checkDigit;
}

export function generateRandomDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export function generateRandomMonth(): string {
  return String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
}

export function generateRandomYear(): string {
  const currentYear = new Date().getFullYear();
  return String(currentYear + Math.floor(Math.random() * 5));
}

export function generateRandomCVV(): string {
  return generateRandomDigits(3);
}

export function formatCardNumber(number: string): string {
  return number.replace(/(.{4})/g, '$1 ').trim();
}