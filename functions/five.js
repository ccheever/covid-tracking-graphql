module.exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: '' + (2 + 3),
  };
};
