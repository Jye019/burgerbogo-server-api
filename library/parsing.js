const parseQueryString = (res, _query, curModel, incModels) => {
  /* 현재 모델의 컬럼 목록 */
  const curColumns = Object.keys(curModel.rawAttributes);

  /* 쿼리스트링들 그대로 저장 */
  const query = _query;
  let includeTmp = [];
  let attributeTmp = [];
  let whereObjTmp = {};
  let whereTmp = [];
  let order = [];
  let limit = 0;
  let offset = 0;
  if (query._include) {
    includeTmp = query._include.split(",");
    delete query._include;
  }
  if (query._attribute) {
    attributeTmp = query._attribute.split(",");
    delete query._attribute;
  }
  if (query._order) {
    order.push(query._order.split(" "));
    delete query._order;
  } else order = null;
  if (query._limit) {
    limit = query._limit * 1;
    delete query._limit;
  } else limit = null;
  if (query._offset) {
    offset = limit * (query._offset * 1 - 1);
    delete query._offset;
  } else offset = null;

  if (query) {
    whereObjTmp = query;
    for (const [key, value] of Object.entries(whereObjTmp)) {
      const split = key.split(".");
      whereTmp.push(split.concat([value]));
    }
    console.log(whereTmp);
  }

  /* -------------------------*/

  /*          Parsing         */
  const include = [];
  const where = {};
  let attributes = []; // 마지막에 비어있을 경우 null처리 해줘야 하기 때문에 let

  if (includeTmp) {
    // Parsing include
    for (let i = 0; i < includeTmp.length; i += 1) {
      if (incModels[includeTmp[i].trim()])
        include.push({ model: incModels[includeTmp[i].trim()] });
      else
        return {
          error: 1,
          code: "SEQUELIZE_UNKNOWN_INCLUDE",
          message: includeTmp[i].trim(),
        };
    }
  }

  if (attributeTmp) {
    // Parsing attributes
    for (let i = 0; i < attributeTmp.length; i += 1) {
      const split = attributeTmp[i].split(".");
      if (split.length === 1) {
        if (curColumns.indexOf(split[0].trim()) === -1) {
          return {
            error: 1,
            code: "SEQUELIZE_UNKNOWN_ATTRIBUTE",
            message: split[0].trim(),
          };
        }
        attributes.push(split[0].trim());
      }
      // Burger의 attributes 처리
      else {
        // {객체명}.{속성명} 일 경우
        for (let j = 0; j < include.length; j += 1) {
          if (include[j].model === incModels[split[0].trim()]) {
            // model이 {객체명}과 일치하는 include를 찾음
            if (
              Object.keys(include[j].model.rawAttributes).indexOf(
                split[1].trim()
              ) === -1
            ) {
              return {
                error: 1,
                code: "SEQUELIZE_UNKNOWN_ATTRIBUTE",
                message: `${split[0].trim()}.${split[1].trim()}`,
              };
            }
            if (!include[j].attributes) include[j].attributes = []; // 초기화
            include[j].attributes.push(split[1].trim()); // 찾은 include의 attributes에 항목 추가
          }
        }
      }
    }
  }

  if (whereTmp) {
    // Parsing where
    for (let i = 0; i < whereTmp.length; i += 1) {
      if (whereTmp[i].length === 2) {
        if (curColumns.indexOf(whereTmp[i][0].trim()) === -1) {
          return {
            error: 1,
            code: "SEQUELIZE_UNKNOWN_WHERE",
            message: `${whereTmp[i][0].trim()}=${whereTmp[i][1]}`,
          };
        }
        where[whereTmp[i][0].trim()] = whereTmp[i][1];
      }
      // include의 where 처리
      else {
        // {객체명}.{속성명} 일 경우
        for (let j = 0; j < include.length; j += 1) {
          if (include[j].model === incModels[whereTmp[i][0].trim()]) {
            // model이 {객체명}과 일치하는 include를 찾음
            if (
              Object.keys(include[j].model.rawAttributes).indexOf(
                whereTmp[i][1].trim()
              ) === -1
            ) {
              return {
                error: 1,
                code: "SEQUELIZE_UNKNOWN_WHERE",
                message: `${whereTmp[i][0].trim()}.${whereTmp[i][1].trim()}=${
                  whereTmp[i][2]
                }`,
              };
            }
            if (!include[j].where) include[j].where = {}; // 초기화
            include[j].where[whereTmp[i][1].trim()] = whereTmp[i][2]; // 찾은 include의 attributes에 항목 추가
          }
        }
      }
    }
  }

  /* -------------------------*/

  if (attributes.length === 0) attributes = null;
  // attributes 가 [] 일 경우 아무런 컬럼도 불러오지 않기 때문에 null처리
  console.log({
    include,
    where,
    attributes,
    limit,
    offset,
    order,
  });
  return { include, where, attributes, limit, offset, order };
};

export { parseQueryString };
