// Currency utilities for INR
// Note: Prices are now stored directly in INR, no conversion needed

/**
 * Format amount as INR currency
 * @param {number} amount - Amount in INR to format
 * @returns {string} - Formatted amount with ₹ symbol
 */
export const formatINR = (amount) => {
  return `₹${amount}`;
};

/**
 * Legacy function for backward compatibility - now just formats INR directly
 * @param {number} inrAmount - Amount in INR (no longer USD)
 * @returns {string} - Formatted INR amount
 */
export const convertAndFormatINR = (inrAmount) => {
  return formatINR(inrAmount);
};

/**
 * Legacy function for backward compatibility - now returns the same amount
 * @param {number} inrAmount - Amount in INR (no longer USD)
 * @returns {number} - Same amount (no conversion)
 */
export const convertUSDToINR = (inrAmount) => {
  return inrAmount;
};
