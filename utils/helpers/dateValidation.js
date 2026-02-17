// helpers/dateValidation.js

/**
 * Validates that a date is not in the future.
 * @param {string | Date} dateInput 
 * @returns {boolean}
 */
const isNotFutureDate = (dateInput) => {
  if (!dateInput) return true; // Let other logic handle empty fields
  const date = new Date(dateInput);
  const today = new Date();
  
  // Set today to midnight to allow selecting the current day
  today.setHours(0, 0, 0, 0);
  
  return date <= today;
};


/**
 * Comprehensive validation for Employee dates
 * @param {string} dob 
 * @param {string} joiningDate 
 * @throws {Error}
 */
const validateEmployeeDates = (dob) => {
  if (dob && !isNotFutureDate(dob)) {
    throw new Error("Date of Birth cannot be in the future.");
  }
};

module.exports = { isNotFutureDate, validateEmployeeDates };