const express = require('express');
const db = require('../models');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const stores = await db.Store.findAll({
      attributes: ['id', 'address', 'address_new', 'name', 'phone', 'region1', 'region2', 'storetype', 'latitude', 'longitude',]
    });
    res.json(stores);
  } catch {
    console.error(e);
    next(e);
  }
});

router.get('/searchRadius', async (req, res, next) => { // POST /api/store

  if (!req.query['long']) {
    res.status(400).json({
      msg: '경도(long) 값이 존재하지 않습니다.',
    });
  }

  if (!req.query['lat']) {
    res.status(400).json({
      msg: '위도(lat) 값이 존재하지 않습니다.',
    });
  }

  if (!req.query['rad']) {
    res.status(400).json({
      msg: '반경(rad) 값이 존재하지 않습니다.',
    });
  }

  if (isNaN(req.query['long']) || isNaN(req.query['lat'] || isNaN(req.query['rad']))) { // 숫자가 아니라면
    res.status(400).json({
      msg: '값이 없거나 유효하지 않은 타입의 값을 입력하였습니다.'
    })
  }

  const { lat, long, rad } = req.query;

  try {
    const stores = await db.Store.findAll({
      attributes: [
        [ db.sequelize.literal(`6371*acos(cos(radians(${lat}))*cos(radians(latitude))*cos(radians(longitude) -radians(${long}))+sin(radians(${lat}))*sin(radians(latitude)))`), 'distance' ],
        'id',
        'address',
        'address_new',
        'name',
        'phone',
        'region1',
        'region2',
        'storetype',
        'latitude',
        'longitude',
      ],
      having: db.sequelize.literal(`distance < ${rad}`),
      order: db.sequelize.literal(`distance ASC`),
      include: [{
        model: db.User,
        through: 'Like',
        as: 'Likers',
      }, {
        model: db.User,
        through: 'Visit',
        as: 'Visitors',
      }, {
        model: db.Winning,
        attributes: ['rank', 'selection'] // 'selection': 추후에 추가
      }],

    });

    res.status(200).json(stores);

  } catch (e) {
    console.error(e);
    next(e);
  }

});

module.exports = router;
