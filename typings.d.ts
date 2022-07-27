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
	matrix?: [number | '$', number | '$'][]
	size?: [number | 'HUG' | '$', number | 'HUG' | '$'][]
	cell?: [number | '$', number | '$'][]
	alignment?: ['MIN' | 'MAX', 'MIN' | 'MAX']
	axis?: 'ROWS' | 'COLUMNS'
	resizing?: Boolean
	header?: Boolean
}
