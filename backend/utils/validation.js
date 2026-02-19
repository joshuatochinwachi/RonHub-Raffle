/**
 * Input validation helpers for RonHub Raffle
 */

/**
 * Validates a Ronin/EVM address format
 * @param {string} address - The address to validate
 * @returns {boolean}
 */
const isValidAddress = (address) => {
  return typeof address === 'string' && /^0x[0-9a-fA-F]{40}$/.test(address);
};

/**
 * Validates a Ronin transaction hash format
 * @param {string} txHash - The transaction hash to validate
 * @returns {boolean}
 */
const isValidTxHash = (txHash) => {
  return typeof txHash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(txHash);
};

module.exports = {
  isValidAddress,
  isValidTxHash
};
