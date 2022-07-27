# Developer Readme


## Table creation

Table Creator uses a component to create tables from. This component is refered to as a template. When a table is created it contains a reference to the template used to create it. Although tables are not instances of components they can be updated because they contain a reference to the template used to create them.

- [Nodes](#nodes)
- [Types](#types)
- [Functions](#functions)
- [Commands](#commands)

## Nodes

### TemplateNode

A template node is a component with pluginData of `"template"`.

```ts
isTemplateNode()
```

### TableNode

A table created from a template, can be a frame or instance and has pluginData or `"template"`.

```ts
isTableNode()
```

## Functions

### Recent Files

Returns a list of recent files which the plugin has been run on.

```js
getClientStorageAsync('recentFiles'): Promise<File[]>
```

### Remote Files

Returns a list of files stored on the `document` used by the plugin. This is so one user can add a template to the current file, so other users can use that remote template to create tables from.

```ts
getDocumentData('remoteFiles'): File[]
```

### User Preferences

Returns the user's preferences.

```ts
getClientStorageAsync('userPreferences'): Promise<object>
```

### Recent Tables

```ts
getClientStorageAsync('recentTables'): Promise<TableSettings[]>
```

### Get Default Template

Determines which template is the default by checking if the template from the most recently created table exists. If it doesn't exist then it checks for a remote templates and then a local templates.

```ts
getDefaultTemplate(): Template | null
```

## Types

### File

```
id: string
name: string
```

### Template

```
id: string
key: string
file: File
```

### TableSettings

```
template?: Template
file?: File
matrix?: [number | '$', number | '$']
size?: [number | 'HUG' | '$', number | 'HUG' | '$']
cell?: [number | '$', number | '$']
alignment?: ['MIN' | 'MAX', 'MIN' | 'MAX']
axis?: 'ROWS' | 'COLUMNS'
resizing?: boolean
header?: boolean
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