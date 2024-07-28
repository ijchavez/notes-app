const validations = {};

validations.validateNote = (title, description) => {
  const errors = [];

  if (!title) {
    errors.push({ text: "Please Write a Title." });
  }

  if (!description) {
    errors.push({ text: "Please Write a Description" });
  }

  return errors;
};

module.exports = validations;
