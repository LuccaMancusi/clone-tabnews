import database from "infra/database.js";

export default async function status(req, res) {
  const updatedAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;

  const [openedConnections, maxConnections, serverVersion] = await Promise.all([
    database.query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    }),
    database.query("SHOW max_connections;"),
    database.query("SHOW server_version;"),
  ]);

  const openedConnectionsValue = openedConnections.rows[0].count;
  const maxConnectionsValue = maxConnections.rows[0].max_connections;
  const serverVersionValue = serverVersion.rows[0].server_version;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: parseInt(maxConnectionsValue),
        opened_connections: openedConnectionsValue,
        server_version: serverVersionValue,
      },
    },
  });
}
