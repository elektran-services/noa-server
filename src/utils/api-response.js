const sendError = (res, status, message, details, code = 'API_ERROR') => {
  const requestId = res && res.req ? res.req.requestId : undefined;
  return res.status(status).json({
    success: false,
    requestId,
    error: {
      code,
      message,
      details: details || null,
    },
  });
};

module.exports = {
  sendError,
};
