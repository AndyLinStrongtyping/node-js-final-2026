const isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/;

  return passwordRegex.test(password);
};

module.exports = { isValidPassword };
