import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid2, // Importé ici
} from "@mui/material";
import { ExpandMore, Close } from "@mui/icons-material";
import ReactJson from "@microlink/react-json-view";

function App() {
  const [logs, setLogs] = useState([]);
  const [stakeUsernameFilter, setStakeUsernameFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Mémoriser fetchLogs avec useCallback
  const fetchLogs = useCallback(() => {
    axios
      .get("https://ssplogger-ssplogger.up.railway.app/api/logs", {
        params: {
          stakeUsername: stakeUsernameFilter || undefined,
          level: levelFilter || undefined,
          page: page,
          limit: 10, // Ajustez ce nombre selon vos besoins
        },
      })
      .then((response) => {
        setLogs((prevLogs) => [...prevLogs, ...response.data]);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des logs :", error);
      });
  }, [stakeUsernameFilter, levelFilter, page]);

  // Utiliser useEffect pour appeler fetchLogs au montage et lors des changements
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDeleteLogs = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tous les logs ?")) {
      axios
        .delete("https://ssplogger-ssplogger.up.railway.app/api/logs")
        .then(() => {
          setLogs([]);
          setPage(1);
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression des logs :", error);
        });
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleOpenDialog = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard des Logs
      </Typography>

      {/* Filtres */}
      <Grid2 container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid2 xs={12} sm={6} md={4}>
          <TextField
            label="Utilisateur (stakeUsername)"
            variant="outlined"
            fullWidth
            value={stakeUsernameFilter}
            onChange={(e) => setStakeUsernameFilter(e.target.value)}
          />
        </Grid2>
        <Grid2 xs={12} sm={6} md={4}>
          <TextField
            label="Niveau"
            variant="outlined"
            fullWidth
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          />
        </Grid2>
        <Grid2 xs={12} sm={6} md={4}>
          <Button variant="contained" color="secondary" onClick={handleDeleteLogs} fullWidth>
            Vider les logs
          </Button>
        </Grid2>
      </Grid2>

      {/* Liste des logs */}
      <Grid2 container spacing={2}>
        {logs.map((log) => (
          <Grid2 xs={12} sm={6} md={4} key={log.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {new Date(log.timestamp).toLocaleString()}
                </Typography>
                <Chip label={log.level} color={log.level === "error" ? "error" : "default"} size="small" />
                <Typography variant="body2" noWrap>
                  {log.message}
                </Typography>
                <Typography variant="body2">Utilisateur: {log.stakeUsername}</Typography>
                <Typography variant="body2">
                  Version: {log.appVersion} | Plateforme: {log.platform}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpenDialog(log)}>
                  Voir les détails
                </Button>
              </CardActions>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Bouton pour charger plus de logs */}
      <Button variant="contained" color="primary" onClick={handleLoadMore} fullWidth sx={{ marginTop: 2 }}>
        Charger plus de logs
      </Button>

      {/* Dialog pour afficher les détails */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen>
        <DialogTitle>
          Détails du log
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <>
              <Typography variant="h6">Message</Typography>
              <Typography paragraph>{selectedLog.message}</Typography>
              <Typography variant="h6">Détails</Typography>
              <ReactJson src={selectedLog.details} theme="monokai" />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
