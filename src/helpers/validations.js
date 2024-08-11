const validations = {};
/*
validations.validateNote = (title, description) => {
  const errors = [];

  if (!title) {
    errors.push({ text: "Please Write a Title." });
  }

  if (!description) {
    errors.push({ text: "Please Write a Description" });
  }

  if (title.length > 20) {
    errors.push({ text: "Title must be less than 20 characters" });
  }

  if (description.length > 200) {
    errors.push({ text: "Description must be less than 200 characters" });
  }
  return errors;
};*/
//esto es lo que anda bien
validations.validateNote = (title, description) => {
  const errors = [];

  if (!title || title.length === 0) {
    errors.push({ text: "Please Write a Title." });
  } else {
    if (title.length > 20) {
      errors.push({ text: "Title must be less than 20 characters" });
    }
  }

  if (!description || description.length === 0) {
    errors.push({ text: "Please Write a Description" });
  } else {
    if (description.length > 200) {
      errors.push({ text: "Description must be less than 200 characters" });
    }
  }

  return errors;
};
/**
 * Validates signup fields.
 *
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} confirm_password - The password confirmation.
 * @returns {Array} - Array of error messages.
 */
validations.validateSignupFields = (
  name,
  email,
  password,
  confirm_password
) => {
  let errors = [];
  console.log(password, confirm_password);
  if (password !== confirm_password) {
    errors.push({ text: "Passwords do not match." });
  }
  if (password.length < 4) {
    errors.push({ text: "Passwords must be at least 4 characters." });
  }
  return errors;
};

module.exports = validations;
