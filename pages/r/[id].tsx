import { GetServerSideProps } from "next";
import { vercelTraceToRegion } from "../../lib/utils";
import Head from "next/head";
import React from "react";
import Room from "../../components/room/room";

const JITSI_CONFIG = JSON.parse(process.env.JITSI_CONFIG || "");

interface RoomPageProps {
  id: string;
  region: string;
}

interface RoomPageState {
  mounted: boolean;
}

export const getServerSideProps: GetServerSideProps<RoomPageProps> = async ({ req, query }) => {
  const id = query.id ? query.id.toString() : "";
  const trace = req.headers["x-vercel-trace"] ? req.headers["x-vercel-trace"].toString() : "";
  // Allows override from the query string
  const region = query.region ? query.region.toString() : vercelTraceToRegion(trace);

  return {
    props: {
      id: id,
      region: region
    }
  };
};

export default class RoomPage extends React.Component<RoomPageProps, RoomPageState> {
  state = {
    mounted: false
  };

  componentDidMount(): void {
    this.setState({ mounted: true });
  }

  render(): JSX.Element {
    return (
      <>
        <Head>
          <title>Video Chat | bipbop</title>
          <meta
            key="viewport"
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
        </Head>

        {this.state.mounted && (
          <Room id={this.props.id} region={this.props.region} host={JITSI_CONFIG.host} />
        )}

        {!this.state.mounted && (
          <div className="roomSetup">
            <div
              className="ant-row ant-row-middle settings"
              style={{ marginLeft: "-8px", marginRight: "-8px" }}
            >
              <div
                className="ant-col ant-col-16 videoContainer"
                style={{ paddingLeft: "8px", paddingRight: "8px" }}
              >
                <div className="video local"></div>
              </div>
              <div
                className="ant-col ant-col-8 formContainer"
                style={{ paddingLeft: "8px", paddingRight: "8px" }}
              >
                <h2 className="ant-typography">Ready to join?</h2>
                <div className="ant-typography ant-typography-secondary">
                  <strong>
                    Please allow access to your <br />
                    microphone and camera.
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
