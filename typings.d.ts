type File = {
	id: string
	name: string
	data?: [] | {}
}

type Template = {
	name: string
	component: {
		id: number
		key: number
	}
	file: File
}

type TableSettings = {
	template?: Template
	file?: File
	matrix?: [number | '$', number | '$']
	size?: [number | 'HUG' | '$', number | 'HUG' | '$']
	cell?: [number | '$' | 'FILL', number | '$' | 'FILL']
	alignment?: ['MIN' | 'MAX', 'MIN' | 'MAX']
	axis?: 'ROWS' | 'COLUMNS'
	resizing?: Boolean
	header?: Boolean
	detachedCells?: Boolean
}

type TableParts = {
	container?: string
	table: string
	tr: string
	td: string
	th?: string
}
