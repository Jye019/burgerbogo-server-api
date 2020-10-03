import express from 'express';
import { QueryTypes } from "sequelize";
import db from '../models';

const router = express.Router();

router.get('/', async(req, res) => {
    const {allergy, main, order} = req.query;
    try {
        const list =  await db.sequelize.query(
                        `SELECT DISTINCT image, 
                                score, 
                                score_cnt,
                                price_single, 
                                price_set, 
                                price_combo,
                                burger.id as id,
                                burger.name as name, 
                                (select name from brands where id = brand_id) as brand_name
                        FROM burgers AS burger
                        LEFT JOIN (
                            SELECT burger_id, 
                                   id 
                            FROM burgers_have_ingredients 
                            WHERE ingredient_id IN (${allergy || 0}) ) bi
                        ON burger.id = bi.burger_id 
                        ${(main)? `LEFT` : `RIGHT`} JOIN (
                            SELECT burger_id, 
                                   id 
                            FROM burgers_have_ingredients
                            WHERE ingredient_id IN (${main || 0 }) ) bi2 
                        ON burger.id = bi2.burger_id
                        LEFT JOIN (
                            SELECT ROUND(AVG(SCORE), 1) AS score,
                                    COUNT(burger_id) AS score_cnt,
                                    burger_id 
                            FROM reviews 
                            GROUP BY burger_id) AS review 
                        ON review.burger_id=burger.id
                        WHERE bi.id IS NULL
                        AND COALESCE(score_cnt, 0) >= ${(order==='score')? 3: 0}
                        ORDER BY ${order} ${(order==='name' || order==='calorie')? 'ASC' : 'DESC'}`,
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