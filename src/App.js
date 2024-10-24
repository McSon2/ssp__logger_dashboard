import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Remplacez l'URL par l'URL de votre backend sur Railway
    axios
      .get("https://ssplogger-ssplogger.up.railway.app/api/logs")
      .then((response) => {
        setLogs(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des logs :", error);
      });
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard des Logs
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Version App</TableCell>
              <TableCell>Plateforme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.level}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.stakeUsername}</TableCell>
                <TableCell>{log.appVersion}</TableCell>
                <TableCell>{log.platform}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default App;
