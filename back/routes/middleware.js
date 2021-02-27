exports.checkProvider = (req, res, next) => {
  if (!req.body.provider) {
    return res.status(400).json({
      success: false,
      message: 'provider 값이 존재하지 않습니다.'
    })
  } else {
    next();
  }
};
