function formatEventDate(date) {
  return new Date(date).toLocaleString();
}

module.exports = {
  formatEventDate,
};