const parseQueryString = (res, _query, curModel, incModels) => {
  /* 현재 모델의 컬럼 목록 */
  const curColumns = Object.keys(curModel.rawAttributes);

  /* 쿼리스트링들 그대로 저장 */
  const query = _query;
  let includeTmp = [];
  let attributeTmp = [];
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

  const where = query;

  // WHERE 유효성 검사
  const testWhere = Object.keys(where);
  for (let i = 0; i < testWhere.length; i += 1) {
    if (curColumns.indexOf(testWhere[i]) === -1) {
      return res
        .status(406)
        .json({ code: "SEQUELIZE_UNKNOWN_WHERE", message: testWhere[i] });
    }
  }

  /* -------------------------*/

  /*          Parsing         */
  const include = [];
  let attributes = []; // 마지막에 비어있을 경우 null처리 해줘야 하기 때문에 let

  if (includeTmp) {
    // Parsing include
    includeTmp.forEach((inc) => {
      if (incModels[inc]) include.push({ model: incModels[inc] });
      else res.json({ code: "SEQUELIZE_UNKNOWN_INCLUDE", message: inc });
    });
  }

  if (attributeTmp) {
    // Parsing attributes
    attributeTmp.forEach((att) => {
      const split = att.split(".");
      if (split.length === 1) {
        if (curColumns.indexOf(split[0]) === -1) {
          return res
            .status(406)
            .json({ code: "SEQUELIZE_UNKNOWN_ATTRIBUTE", message: split[0] });
        }
        attributes.push(split[0]);
      }
      // Burger의 attributes 처리
      else {
        // {객체명}.{속성명} 일 경우
        include.forEach((e) => {
          if (e.model === incModels[split[0]]) {
            // model이 {객체명}과 일치하는 include를 찾음
            if (Object.keys(e.model.rawAttributes).indexOf(split[1]) === -1) {
              return res.status(406).json({
                code: "SEQUELIZE_UNKNOWN_ATTRIBUTE",
                message: `${split[0]}.${split[1]}`,
              });
            }
            if (!e.attributes) e.attributes = []; // 초기화
            e.attributes.push(split[1]); // 찾은 include의 attributes에 항목 추가
          }
          return null;
        });
      }
      return null;
    });
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
