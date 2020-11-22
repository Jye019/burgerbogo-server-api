import express from 'express';
import { QueryTypes } from "sequelize";
import db from '../models';
import {logger} from '../library/log';

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const {order} = req.query;
        let {allergy, brand, main, keyword} = req.query;

        if( allergy ) {
            allergy = allergy.split(",");
            allergy.forEach(num => {
                if(Number.isNaN(parseInt(num, 10)))
                    return res.status(406).json({code: "FILTER_UNEXPECTED_ALLERGY"});
            });  
        }                                                                                                                                                                                                                                                                                                                                                                                                           

        if( main ) {
            main = main.split(",");
            main.forEach(num => {
                if(Number.isNaN(parseInt(num, 10)))
                    return res.status(406).json({code: "FILTER_UNEXPECTED_MAIN"});
            });  
        }

        if( brand ) {
            brand = brand.split(",");
            brand.forEach(num => {
                if(Number.isNaN(parseInt(num, 10)))
                    return res.status(406).json({code: "FILTER_UNEXPECTED_BRAND"});
            });  
        }

        if( !order ) 
            return res.status(406).json({code: "FILTER_ORDER_MISSING"});
        if( !(order === "name" || order === "score" || order === "released_at_year" || order === "calorie") )
            return res.status(406).json({code: "FILTER_UNEXPECTED_ORDER"});
        if( keyword ) 
            keyword = keyword.replace(/(\s*)/g, "");

        const list =  await db.sequelize.query(
                        `SELECT DISTINCT image, 
                                price_single, 
                                price_set, 
                                price_combo,
                                released_at_year,
                                released_at_month,
                                released_at_day,
                                burger.id as id,
                                score, 
                                score_count,
                                burger.name as name,` +
                                'brand_id as `Brand.id`,' +  
                                '(select name from brands where id = brand_id) as `Brand.name`'+
                        `FROM burgers AS burger
                        LEFT JOIN (
                            SELECT burger_id, 
                                   id 
                            FROM burgers_have_ingredients 
                            WHERE ingredient_id IN (${allergy || 0}) ) bi
                        ON burger.id = bi.burger_id 
                        ${(main)? `RIGHT` : `LEFT`} JOIN (
                            SELECT burger_id, 
                                   id 
                            FROM burgers_have_ingredients
                            WHERE ingredient_id IN (${main || 0 }) ) bi2 
                        ON burger.id = bi2.burger_id
                        LEFT JOIN (
                            SELECT ROUND(AVG(SCORE), 1) AS score,
                                   COUNT(burger_id) AS score_count,
                                   burger_id 
                            FROM reviews 
                            GROUP BY burger_id) AS review 
                        ON review.burger_id=burger.id
                        WHERE bi.id IS NULL
                        AND deleted_at IS NOT NULL
                        AND COALESCE(score_count, 0) >= ${(order==='score')? 3: 0}
                        AND ( fn_search_csnt(name) like '%${keyword || ''}%' OR name like '%${keyword || ''}%' )
                        ${ (brand)? `AND brand_id IN (${brand})` : ''}
                        ORDER BY ${order} ${(order==='score')? 'DESC' : 'ASC'}
                        ${(order==='released_at_year')? ', released_at_month ASC, released_at_day ASC' : ''}`,
                        { 
                            type: QueryTypes.SELECT,
                            nest: true,
                        });
       return res.status(200).json({
           code: 'FILTER_SUCCESS', 
           data: list
       })
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            error: err.stack
        });
    }
});

export default router;