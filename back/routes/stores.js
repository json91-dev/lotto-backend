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
    res.status(400).send('경도(long) 값이 존재하지 않습니다.');
  }

  if (!req.query['lat']) {
    res.status(400).send('위도(lat) 값이 존재하지 않습니다.');
  }

  if (!req.query['rad']) {
    res.status(400).send('반경(rad) 값이 존재하지 않습니다.');
  }

  if (isNaN(req.query['long']) || isNaN(req.query['lat'] || isNaN(req.query['rad']))) { // 숫자가 아니라면
    res.status(400).send('값이 없거나 유효하지 않은 타입의 값을 입력하였습니다.')
  }

  const { lat, long, rad } = req.query;


  try {
    const query = `
  SELECT id, address, address_new, name, phone, region1, region2, storetype, latitude, longitude, 
    (6371*acos(cos(radians(${lat}))*cos(radians(latitude))*cos(radians(longitude) -radians(${long}))+sin(radians(${lat}))*sin(radians(latitude))))
    AS distance
    FROM Stores
    HAVING distance <= ${rad}
    ORDER BY distance;
  `;

    const stores = await db.sequelize.query(query, {
      type: db.sequelize.QueryTypes.SELECT
    });
    res.status(200).json(stores)
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/searchRadiusEdit', async (req, res, next) => { // POST /api/store

  if (!req.query['long']) {
    res.status(400).send('경도(long) 값이 존재하지 않습니다.');
  }

  if (!req.query['lat']) {
    res.status(400).send('위도(lat) 값이 존재하지 않습니다.');
  }

  if (!req.query['rad']) {
    res.status(400).send('반경(rad) 값이 존재하지 않습니다.');
  }

  if (isNaN(req.query['long']) || isNaN(req.query['lat'] || isNaN(req.query['rad']))) { // 숫자가 아니라면
    res.status(400).send('값이 없거나 유효하지 않은 타입의 값을 입력하였습니다.')
  }

  const { lat, long, rad } = req.query;

  try {
    const stores = await db.Store.findAll({
      attributes: [
        [ db.sequelize.literal(`6371*acos(cos(radians(${lat}))*cos(radians(latitude))*cos(radians(longitude) -radians(${long}))+sin(radians(${lat}))*sin(radians(latitude)))`), 'distance' ],
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
    });

    res.status(200).json(stores);

  } catch (e) {
    console.error(e);
    next(e);
  }

});

module.exports = router;
