import React from 'react'
import Router from 'next/router'

export default class OGRoomPage extends React.Component {
  static async getInitialProps ({ query, req }) {
    return {
      id: query.id
    }
  }

  componentDidMount() {
    // Redirect to the new room URL
    Router.push(`/r#${this.props.id}`)
  }

  render() {
    return (
      <div>
        Stand by for redirection...
      </div>
    )
  }
}
