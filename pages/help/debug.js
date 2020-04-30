import React from 'react'
import { nowTraceToRegion } from '../../lib/utils'

export async function getServerSideProps({ req }) {
  return {
    props: {
      trace: req.headers['x-now-trace'] || null,
      region: nowTraceToRegion(req.headers['x-now-trace'])
    }
  }
}

export default class DebugPage extends React.Component {
  render () {
    const { trace, region } = this.props

    return (
      <div className='debugPage'>
        <table>
          <tbody>
            <tr>
              <th>x-now-trace</th>
              <td>{trace || 'not set'}</td>
            </tr>
            <tr>
              <th>region</th>
              <td>{region || 'not set'}</td>
            </tr>
          </tbody>
        </table>

        <style jsx>{`
          table {
            font-family: monospace;
            margin: 20px;
          }

          th {
            font-weight: bold;
          }

          th,td {
            border: 1px solid #eee;
            padding: 5px;
          }
      `}</style>
      </div>
    )
  }
}
