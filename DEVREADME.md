# Develpoper Readme


## Table creation

Table Creator uses a component to create tables from. This component is refered to as a template. When a table is created it contains a reference to the template used to create it. Although tables are not instances of components they can be updated because they contain a reference to the template used to create them.

## Types

### File

```
id: string
```
The id of the file.

```
name: string
```
The name of the file.

---

### Template

```
id: string
```
The id of the component the template belongs to.

```
key: string
```
The key of the component the template belongs to.

```
file: File
```
The file the component originated from.

---

### TableSettings

```
template?: Template
```
The template used to create the table.

```
file?: File
```

The file the table was created in.

```
matrix?: [number | '$', number | '$']
```

The number of columns and rows of the table.

```
size?: [number | 'HUG' | '$', number | 'HUG' | '$']
```

The size of the table.

```
cell?: [number | '$', number | '$']
```

The size of the cell.

```
alignment?: ['MIN' | 'MAX', 'MIN' | 'MAX']
```

The alignment of the conent in the cells.

```
axis?: 'ROWS' | 'COLUMNS'
```
The main axis used for the table.

```
resizing?: boolean
```
If the table uses a local component for resizing.

```
header?: boolean
```
If the table includes a header.





### Remote Files

A list of files stored on the `document` used by the plugin. This is so one user can add a template to the current file, so other users can use that remote template to create tables from.

```js
getDocumentData('remoteFiles')
```

## Node Data

## Client Storage

### Recent Files

A list of files which the plugin has been run on.

```js
getClientStorageAsync('recentFiles')
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


### User Preferences

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

## Commands

Notes

1. figma.on(‘new-template’)
    - newTemplateComponent()
        - createDefaultComponents()
            - setDocumentData ('defaultTemplate', template component)
            - incrementNameNumerically()
            - postMessage('defaultTemplate')
2. figma.on(‘edit-template’)
    - getComponent()
        - animateNodeIntoView()
        - fetchTemplateParts()
        - postUsersCurrentSelection()
3. figma.on(‘set-default-template’)
    - setDefaultTemplate()
        - postMessage('defaultTemplate')
4. figma.on(‘refresh-tables’)
5. figma.on(‘create-table’)
   - createTableInstance()
        - getUserPreferencesAsync()
            - getRecentFilesAsync()
6. figma.on(‘using-remote-template’)
7. figma.on(‘set-semantics’)
8. figma.on(‘save-user-preferences’)
9. figma.on(‘fetch-template-parts’)
10. figma.on(‘fetch-current-selection’)


## Functions

### Setting data

#### Templates

-   ```js
    setTemplateData(componentNode) | setPluginData(componentNode, ‘template’, setTemplateData)
    ```
    
    Adds template data to a component.

-   ```js
    updateTemplateData(templateComponent) | updatePluginData(templateComponent, updateTemplateData)
    ````
    
    Keeps certain properties of the node in sync with the template node data.

-   ```js
    setDocumentData(‘defaultTemplate’, setDefaultTemplateData)
    ```

    Sets the default template on the document. When template it set, post new data to UI.

-   ```js
    getTemplateComponents()
    ```   
    
    Returns all template components in the document.

#### Semantics

-   ```js
    setSemanticData(figma.currentPage.selection[0], {is: element})
    ```

    Adds template data to a component.

#### Remote files

-   ```js
    updateDocumentData(‘remoteFiles’, updateRemoteFilesData)
    ```
    
    Updates the reference to each file to make sure the document references the correct file name. Fetches the most up to date file name for each file.

#### Recent files

-   ```js
    updateRecentFilesAsync(fileId?, callback?) | getDocumentData(‘fileId’)
    ```

    Updates recent files with up to date file name. If filename provided then there is an option to update it’s data. If file doesn’t exist in recentFiles then it creates a new entry.

-   ```js
    getRecentFilesAsync()
    ```
    
    Returns a list of files recently visited by the plugin. This calls figma.clientStorageAsync(‘recentFiles’’) and filters out the current file.


## New fignite helpers

### setPluginData()

```js
var nodeId = figma.currentPage.selection[0].id

setPluginData(figma.currentPage.selection[0], 'test', {
	name: `{figma.getNodeById("${nodeId}").name}`,
	width: `{figma.getNodeById("${nodeId}").width}`
})
```

### bindPluginData()

Will only work if code inside callback references node. Would need to save how node is referenced.

```js
bindPluginData(node, 'test', (data) => {
    return Object.assign(data, {
			file: {
				id: getPluginData(figma.root, 'fileId'),
				name: figma.root.name
			},
			name: node.name,
			component: {
				key: node.key,
				id: node.id
			}
		})
}, 300)
```