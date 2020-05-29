import { GetServerSideProps } from "next";
import { vercelTraceToRegion } from "../../lib/utils";
import React from "react";

type DebugPageProps = {
  trace: string;
  region: string;
};

export const getServerSideProps: GetServerSideProps<DebugPageProps, {}> = async ({ req }) => {
  const trace = req.headers["x-vercel-trace"] ? req.headers["x-vercel-trace"].toString() : "none";

  return {
    props: {
      trace: trace,
      region: vercelTraceToRegion(trace)
    }
  };
};

export default class DebugPage extends React.Component<DebugPageProps> {
  render(): JSX.Element {
    const { trace, region } = this.props;

    return (
      <div className="debugPage">
        <table>
          <tbody>
            <tr>
              <th>x-now-trace</th>
              <td>{trace || "not set"}</td>
            </tr>
            <tr>
              <th>region</th>
              <td>{region || "not set"}</td>
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

          th,
          td {
            border: 1px solid #eee;
            padding: 5px;
          }
        `}</style>
      </div>
    );
  }
}
