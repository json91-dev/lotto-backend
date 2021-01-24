const express = require('express');
const db = require('../models');
const router = express.Router();

router.get('/', async(req, res, next) => { // /api/user
  const user = await db.User.findOne({
      where: { id: parseInt(req.user.id, 10) },
      attributes: ['id', 'nickname'],
      include: [{
        model: db.Post,
        as: 'Posts',
        attributes: ['id'],
      }]
    }
  );

  return res.json(user);
});

router.post('/', async(req, res, next) => {
  const exUser = await db.User.findOne({
    where: {
      uniqueid: req.body.uniqueid,
    }
  })
});

module.exports = router;
