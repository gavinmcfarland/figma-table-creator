# Develpoper Readme


## Table creation

Table Creator uses a component create tables from. This component is refered to as a template. When a table is created it contains a reference to the template used to create it. Although tables are not instances of components they can be updated because they contain a reference to the template used to create them.

## Data storage

### User Preferences `client`

The user's preferences are stored on the `client`. This avoids any preferences which may conflict with other users.

```js
preferences: {
    defaultTemplate: {}
    columnCount: 4,
    rowCount: 4,
    cellWidth: 100,
    remember: true,
    includeHeader: true,
    columnResizing: true,
    cellAlignment: "MIN"
}
```

### Template List `document`

A list of templates are stored on both the `client` and the `document`. This is so the user can select a new default template create tables from.

```js
templates: [
    {
        id: {},
        name: String,
        components: {
            cell: { key: String, id: String },
            headerCell:  { key: String, id: String },
            row:  { key: String, id: String },
            table:  { key: String, id: String },
        },
        file: {
            name: String,
        }
    }
]
```

### Template Details `node`

Each table contains a reference to the template used to create it. When a table is copied to another file these details can be used to import the component that's used to create the table.

```js
template: {
    file: String,
    name: String,
    component: {
        id: String,
        key: String,
    }
}
```




