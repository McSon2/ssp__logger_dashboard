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
  TableContainer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  TableSortLabel,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ExpandMore } from "@mui/icons-material";
import ReactJson from "@microlink/react-json-view";

function App() {
  const [logs, setLogs] = useState([]);
  const [stakeUsernameFilter, setStakeUsernameFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [orderBy, setOrderBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");

  const fetchLogs = () => {
    axios
      .get("https://ssplogger-ssplogger.up.railway.app/api/logs", {
        params: {
          stakeUsername: stakeUsernameFilter || undefined,
          level: levelFilter || undefined,
        },
      })
      .then((response) => {
        let sortedLogs = response.data;
        // Trier les logs
        sortedLogs.sort((a, b) => {
          if (orderBy === "timestamp") {
            return order === "asc"
              ? new Date(a.timestamp) - new Date(b.timestamp)
              : new Date(b.timestamp) - new Date(a.timestamp);
          } else {
            return order === "asc"
              ? (a[orderBy] || "").localeCompare(b[orderBy] || "")
              : (b[orderBy] || "").localeCompare(a[orderBy] || "");
          }
        });
        setLogs(sortedLogs);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des logs :", error);
      });
  };

  // Utiliser useEffect pour appeler fetchLogs au montage et lors des changements de filtres
  useEffect(() => {
    fetchLogs();
  }, [stakeUsernameFilter, levelFilter, orderBy, order]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleDeleteLogs = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tous les logs ?")) {
      axios
        .delete("https://ssplogger-ssplogger.up.railway.app/api/logs", {
          headers: {
            "x-delete-token": "votre_token_secret", // Remplacez par le même token que dans le backend
          },
        })
        .then(() => {
          // Rafraîchir la liste des logs après la suppression
          fetchLogs();
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression des logs :", error);
        });
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard des Logs
      </Typography>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid xs={12} sm={6} md={4}>
          <TextField
            label="Utilisateur (stakeUsername)"
            variant="outlined"
            fullWidth
            value={stakeUsernameFilter}
            onChange={(e) => setStakeUsernameFilter(e.target.value)}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <TextField
            label="Niveau"
            variant="outlined"
            fullWidth
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} alignItems="center" display="flex">
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDeleteLogs}
          >
            Vider les logs
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "timestamp"}
                  direction={orderBy === "timestamp" ? order : "asc"}
                  onClick={() => handleRequestSort("timestamp")}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "level"}
                  direction={orderBy === "level" ? order : "asc"}
                  onClick={() => handleRequestSort("level")}
                >
                  Niveau
                </TableSortLabel>
              </TableCell>
              <TableCell>Message</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "stakeUsername"}
                  direction={orderBy === "stakeUsername" ? order : "asc"}
                  onClick={() => handleRequestSort("stakeUsername")}
                >
                  Utilisateur
                </TableSortLabel>
              </TableCell>
              <TableCell>Version App</TableCell>
              <TableCell>Plateforme</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.level}</TableCell>
                <TableCell
                  style={{
                    maxWidth: 200,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {log.message}
                </TableCell>
                <TableCell>{log.stakeUsername}</TableCell>
                <TableCell>{log.appVersion}</TableCell>
                <TableCell>{log.platform}</TableCell>
                <TableCell style={{ maxWidth: 200 }}>
                  {log.details ? (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel-content"
                        id="panel-header"
                      >
                        <Typography>Voir les détails</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ReactJson src={log.details} collapsed={false} />
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
