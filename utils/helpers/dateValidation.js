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
  const eighteenYearsAgo = new Date();
  const birthDate = new Date(dob);
  const today = new Date();
  eighteenYearsAgo.setFullYear(today.getFullYear()- 18 );
  eighteenYearsAgo.setHours(0,0,0,0);

  if(birthDate > eighteenYearsAgo){
    throw new Error("Employee must be at least 18 years old");
  }
};

module.exports = { isNotFutureDate, validateEmployeeDates };