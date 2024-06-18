/**
 * Generate a random value between min and max.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @return {number} - A random value between min and max.
 */
const generateRandomValueInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random value based on probabilities.
 * @param {Array} options - The array of options.
 * @param {Array} probabilities - The array of probabilities.
 * @return {any} - A random value from the options based on probabilities.
 */
const generateRandomValueFromProbabilities = (options, probabilities) => {
  const random = Math.random(); // Generate a random number between 0 and 1
  let sum = 0;

  for (let i = 0; i < options.length; i++) {
    sum += probabilities[i];
    if (random <= sum) {
      return options[i];
    }
  }
  return options[options.length - 1]; // Return the last option if no other match
};

/**
 * Generate a random gender with 50% probability for male and female.
 * @return {number} - A random gender.
 */
const generateRandomGender = () => {
  return generateRandomValueFromProbabilities([0, 1], [0.5, 0.5]);
};

module.exports = {
  generateRandomValueInRange,
  generateRandomValueFromProbabilities,
  generateRandomGender,
};
