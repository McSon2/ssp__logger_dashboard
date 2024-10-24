import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTable, useSortBy, useFilters, usePagination } from "react-table";
import Modal from "react-modal";
import { FaSearch, FaTrash, FaTimes, FaSortUp, FaSortDown } from "react-icons/fa";
import axios from "axios";

function App() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ stakeUsername: "", level: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(() => {
    setIsLoading(true);
    axios
      .get("https://ssplogger-ssplogger.up.railway.app/api/logs", { params: filters })
      .then((response) => setLogs(response.data))
      .catch((error) => console.error("Erreur lors de la récupération des logs :", error))
      .finally(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDeleteLogs = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tous les logs ?")) {
      axios
        .delete("https://ssplogger-ssplogger.up.railway.app/api/logs")
        .then(() => setLogs([]))
        .catch((error) => console.error("Erreur lors de la suppression des logs :", error));
    }
  };

  const columns = useMemo(
    () => [
      { Header: "Timestamp", accessor: (row) => new Date(row.timestamp).toLocaleString() },
      { Header: "Niveau", accessor: "level" },
      { Header: "Message", accessor: "message" },
      { Header: "Utilisateur", accessor: "stakeUsername" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } = useTable(
    { columns, data: logs },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">Dashboard des Logs</h1>
          <button
            onClick={handleDeleteLogs}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaTrash className="mr-2" /> Vider les logs
          </button>
        </header>

        <div className="flex gap-4 mb-8">
          <input
            placeholder="Utilisateur (stakeUsername)"
            value={filters.stakeUsername}
            onChange={(e) => setFilters({ ...filters, stakeUsername: e.target.value })}
            className="bg-gray-800 text-white px-4 py-2 rounded flex-grow"
          />
          <input
            placeholder="Niveau"
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="bg-gray-800 text-white px-4 py-2 rounded flex-grow"
          />
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaSearch className="mr-2" /> {isLoading ? "Chargement..." : "Rechercher"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className="p-3 text-left bg-gray-800">
                      {column.render("Header")}
                      <span className="ml-2">{column.isSorted ? column.isSortedDesc ? <FaSortDown /> : <FaSortUp /> : ""}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => setSelectedLog(row.original)}
                    className="bg-gray-700 hover:bg-gray-600 cursor-pointer"
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="p-3">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={!!selectedLog}
          onRequestClose={() => setSelectedLog(null)}
          className="bg-gray-900 p-8 rounded-lg max-w-2xl mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
        >
          {selectedLog && (
            <div>
              <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <FaTimes />
              </button>
              <h2 className="text-2xl mb-4">Détails du log</h2>
              <p className="mb-2">
                <strong>Message:</strong> {selectedLog.message}
              </p>
              <p className="mb-2">
                <strong>Niveau:</strong> {selectedLog.level}
              </p>
              <p className="mb-2">
                <strong>Utilisateur:</strong> {selectedLog.stakeUsername}
              </p>
              <p className="mb-2">
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </p>
              <h3 className="text-xl mt-4 mb-2">Détails supplémentaires</h3>
              <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-60">{JSON.stringify(selectedLog.details, null, 2)}</pre>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default App;
