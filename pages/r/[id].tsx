import React from 'react'
import { nowTraceToRegion } from '../../lib/utils'
import { GetServerSideProps } from 'next'
import Room from '../../components/room/room'

const JITSI_CONFIG = JSON.parse(process.env.JITSI_CONFIG || '')

interface RoomPageProps {
  id: string;
  region: string;
}

interface RoomPageState {
  mounted: boolean;
}

export const getServerSideProps: GetServerSideProps<RoomPageProps, {}> = async ({ req, query }) => {
  const id = query.id ? query.id.toString() : ''
  const trace = req.headers['x-now-trace'] ? req.headers['x-now-trace'].toString() : ''
  // Allows override from the query string
  const region = query.region ? query.region.toString() : nowTraceToRegion(trace)

  return {
    props: {
      id: id,
      region: region
    }
  }
}

export default class RoomPage extends React.Component<RoomPageProps, RoomPageState> {
  constructor (props: RoomPageProps) {
    super(props)

    this.state = {
      mounted: false
    }
  }

  componentDidMount(): void {
    this.setState({ mounted: true })
  }

  render (): JSX.Element | null {
    if (this.state.mounted) {
      return <Room id={this.props.id} region={this.props.region} host={JITSI_CONFIG.host} />
    } else {
      return null
    }
  }
}
