const express = require('express');
const db = require('../models');
const router = express.Router();
const { checkProvider } = require('./middleware');

router.get('/',checkProvider ,async (req, res, next) => { // /api/user
  try {
    if (req.body.provider === 'device') {
      if (!req.body.deviceid) {
        return res.status(400).json({
          success: false,
          message: '디바이스 아이디가 없습니다.',
        });
      }

      const user = await db.User.findOne({
          where: {
            deviceid: req.body.deviceid,
          }
        }
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: '유저가 존재하지 않습니다.(deviceid)'
        })
      } else {
        res.status(200).json(user);
      }
    }
  } catch(e) {
    console.error(e);
    next(e);
  }
});

router.post('/',checkProvider, async (req, res, next) => {
  try {
    if (req.body.provider === 'device') {
      if (!req.body.deviceid) {
        return res.status(400).json({
          success: false,
          message: '디바이스 아이디가 없습니다.',
        });
      }

      if (!req.body.nickname) {
        return res.status(400).json({
          success: false,
          message: '닉네임이 없습니다.',
        });
      }

      if (!req.body.address) {
        return res.status(400).json({
          success: false,
          message: '주소가 없습니다.',
        });
      }

      const existUser = await db.User.findOne({
          where: {
            deviceid: req.body.deviceid,
          }
        }
      );

      if (!existUser) {
        const newUser = await db.User.create({
          nickname: req.body.nickname,
          provider: req.body.provider,
          deviceid: req.body.deviceid,
          address: req.body.address,
        });

        return res.status(200).json(newUser);
      } else {
        res.status(404).json({
          success: false,
          message: '이미 유저가 존재합니다.(deviceid)'
        })
      }
    }
  } catch(e) {
    console.error(e);
    next(e);
  }
});

router.post('/check-nickname', async (req, res, next) => {
  try {
    const existNickname = await db.User.findOne({
      where: {
        nickname: req.body.nickname,
      }
    });

    if (!existNickname) {
      return res.status(200).json({
        success: false,
        message: "닉네임이 중복되었습니다."
      });

    } else {
      return res.status(200).json({
        success: true,
        message: "올바른 닉네임입니다."
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
