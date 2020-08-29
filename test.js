const arr = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }];

arr.forEach((e) => {
  e.a = 4;
});

console.log(arr);
