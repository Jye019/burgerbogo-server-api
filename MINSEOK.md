# Sequelize 정리

## Scope

Scope는 코드의 재사용성을 높여준다. where, include, limit 등 자주 사용되는 옵션들을 미리 정의할 수 있다.

### defaultScope

해당 모델에 기본적으로 적용되는 Scope이다.
아래와 같이 모델정의 부분에 정의한다.

```javascript
............ 생략 ..............
      tableName: "reviews",
      timestamps: true,
      paranoid: true,
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: [
            "user_id",
            "burger_id",
            "userId",
            "BurgerId",
            "createdAt",
            "updatedAt",
            "deletedAt",
          ],
        },
      },
```

### scopes

Scope에 이름을 정할 수 있다.

```javascript
............... 생략 ...............
  defaultScope: {
    where: {
      active: true
    }
  },
  scopes: {
    deleted: {
      where: {
        deleted: true
      }
    },
    activeUsers: {
      include: [
        { model: User, where: { active: true } }
      ]
    },
    random() {
      return {
        where: {
          someNumber: Math.random()
        }
      }
    },
    accessLevel(value) {
      return {
        where: {
          accessLevel: {
            [Op.gte]: value
          }
        }
      }
    }
    sequelize,
    modelName: 'project'
  }
});
```

### addScope

위의 scopes 속성을 사용하는 대신 아래와 같이 addScope 메서드를 사용할 수 있다.

```javascript
Project.addScope("activeUsers", {
  include: [{ model: User.scope("active") }],
});
```

### Scope의 사용

```javascript
await Project.scope("deleted").findAll();
```

모델명.scope("{스코프이름}").findAll(); 과 같은 식으로 사용한다.

### Merging Includes

```javascript
Foo.addScope("includeEverything", {
  include: {
    model: Bar,
    include: [
      {
        model: Baz,
        include: Qux,
      },
    ],
  },
});

Foo.addScope("limitedBars", {
  include: [
    {
      model: Bar,
      limit: 2,
    },
  ],
});

Foo.addScope("limitedBazs", {
  include: [
    {
      model: Bar,
      include: [
        {
          model: Baz,
          limit: 2,
        },
      ],
    },
  ],
});

Foo.addScope("excludeBazName", {
  include: [
    {
      model: Bar,
      include: [
        {
          model: Baz,
          attributes: {
            exclude: ["name"],
          },
        },
      ],
    },
  ],
});
```

```javascript
await Foo.findAll({
  include: {
    model: Bar,
    limit: 2,
    include: [
      {
        model: Baz,
        limit: 2,
        attributes: {
          exclude: ["name"],
        },
        include: Qux,
      },
    ],
  },
});

// The above is equivalent to:
await Foo.scope([
  "includeEverything",
  "limitedBars",
  "limitedBazs",
  "excludeBazName",
]).findAll();
```

위와 같이 여러 Scope들을 같이 전달하면 Deep Merge 되어 적용된다.
