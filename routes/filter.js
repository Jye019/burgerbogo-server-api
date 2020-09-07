import express from 'express';
import { QueryTypes } from "sequelize";
import db from '../models';

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const list =  await db.sequelize.query(
                        `SELECT image, 
                                score, 
                                score_cnt,
                                price_single, 
                                price_set, 
                                price_combo,
                                burger.id as id,
                                burger.name as name, 
                                brand.name as brand_name
                         FROM burgers AS burger
                         LEFT JOIN (SELECT burger_id, id FROM burgers_have_ingredients WHERE ingredient_id IN (${req.body.allergy})) bi
                         ON burger.id = bi.burger_id 
                         INNER JOIN (SELECT burger_id, id FROM burgers_have_ingredients WHERE ingredient_id IN (${req.body.main})) bi2 
                         ON burger.id = bi2.burger_id
                         INNER JOIN brands AS brand 
                         ON brand.id = burger.brand_id
                         LEFT JOIN (
                            SELECT ROUND(AVG(SCORE), 1) AS score,
                                    COUNT(burger_id) AS score_cnt,
                                    burger_id 
                            FROM reviews 
                            GROUP BY burger_id) AS review 
                         ON review.burger_id=burger.id
                         WHERE bi.id IS NULL
                         AND score_cnt >= ${(req.body.order==='score')? 3: 0}
                         ORDER BY ${req.body.order} ${(req.body.order==='name'||req.body.order==='calorie')? 'ASC' : 'DESC'}`, 
                        { 
                            type: QueryTypes.SELECT,
                            nest: true,
                        });
       return res.status(200).json({
           data: list
       })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            error: err.stack
        });
    }
});

export default router;