const parseQueryString = (_query, models) => {
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
  /* -------------------------*/

  /*          Parsing         */
  const include = [];
  let attributes = []; // 마지막에 비어있을 경우 null처리 해줘야 하기 때문에 let

  if (includeTmp) {
    // Parsing include
    includeTmp.forEach((inc) => {
      include.push({ model: models[inc] });
    });
  }

  if (attributeTmp) {
    // Parsing attributes
    attributeTmp.forEach((att) => {
      const split = att.split(".");
      if (split.length === 1) attributes.push(split[0]);
      // Burger의 attributes 처리
      else {
        // {객체명}.{속성명} 일 경우
        include.forEach((e) => {
          if (e.model === models[split[0]]) {
            // model이 {객체명}과 일치하는 include를 찾음
            if (!e.attributes) e.attributes = []; // 초기화
            e.attributes.push(split[1]); // 찾은 include의 attributes에 항목 추가
          }
        });
      }
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
