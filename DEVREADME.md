# Develpoper Readme


## Table creation

Table Creator uses a component create tables from. This component is refered to as a template. When a table is created it contains a reference to the template used to create it. Although tables are not instances of components they can be updated because they contain a reference to the template used to create them.

## Document Data

### File Id

```js
getPluginData(figma.root, 'fileId')
```

### Local Templates

A list of templates used by the plugin locally.

```js
getPluginData(figma.root, 'localTemplates')
```

```js
[
    {
        id: String,
        name: String,
        component: {
            id: String,
            key: String,
        }
    }
]
```

### Remote Files

A list of files stored on the `document` used by the plugin. This is so the user can select a new default template to create tables from.

```js
getPluginData(figma.root, 'remoteFiles')
```

```js
[
    {
        id: String,
        name: String,
        templates: [
            {
                id: String,
                name: String,
                component: {
                    id: String,
                    key: String,
                }
            }
        ]
    }
    
]
```

## Node Data

### Template

Each table contains a reference to the template used to create it. When a table is copied to another file these details can be used to import the component that's used to create the table.

```js
getPluginData(node, 'template')
```

```js
{
    file: {
        id: String,
        name: String
    },
    id: String,
    name: String,
    component: {
        id: String,
        key: String,
    }
}
```

### User Preferences `client`

The user's preferences are stored on the `client`. This avoids any preferences which may conflict with other users.

```js
getClientStorageAsync('userPreferences')
```

```js
{
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


