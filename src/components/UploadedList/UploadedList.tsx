import * as React from 'react'

import './UploadedList.scss'

interface Props {
    list: FileList | null
}

export default class UploadedList extends React.Component<Props> {
    constructor (props: any) {
        super(props)
    }

    render () {
        return (
            <table className="uploadedlist">
                <tbody>
                    <tr>
                        <th>Name</th>
                    </tr>
                    {this.renderFileItems()}
                </tbody>
            </table>
        )
    }

    renderFileItems () {
        if (this.props.list) {
            return Array.from(this.props.list).map((file: File, index: number) => {
                return <tr key={index}><td>{file.name}</td></tr>
            })
        } else {
            return <tr><td>No file</td></tr>
        }
    }
}
