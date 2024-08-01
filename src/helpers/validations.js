const validations = {};

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
};

module.exports = validations;
