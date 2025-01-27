import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { db } from "../App";
import {
  collection,
  addDoc,
  getDocs,
  query,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const KanbanPage = () => {
  const [columns, setColumns] = useState({
    todo: { name: "À faire", items: [] },
    inProgress: { name: "En cours", items: [] },
    done: { name: "Terminé", items: [] },
  });
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    date: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const ticketSnapshot = await getDocs(query(collection(db, "kanban")));

        const loadedColumns = {
          todo: { name: "À faire", items: [] },
          inProgress: { name: "En cours", items: [] },
          done: { name: "Terminé", items: [] },
        };

        ticketSnapshot.forEach((doc) => {
          const data = doc.data();
          loadedColumns[data.status]?.items.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date,
          });
        });

        setColumns(loadedColumns);
      } catch (error) {
        console.error("Erreur lors du chargement des tickets :", error);
      }
    };

    fetchTickets();
  }, []);

  const addTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      alert("Veuillez remplir tous les champs du ticket.");
      return;
    }

    const newItem = {
      ...newTicket,
      status: "todo",
    };

    try {
      const docRef = await addDoc(collection(db, "kanban"), newItem);

      setColumns((prevColumns) => ({
        ...prevColumns,
        todo: {
          ...prevColumns.todo,
          items: [
            ...prevColumns.todo.items,
            { id: docRef.id, ...newTicket },
          ],
        },
      }));

      setNewTicket({ title: "", description: "", date: new Date().toLocaleDateString() });
    } catch (error) {
      console.error("Erreur lors de la création du ticket :", error);
    }
  };

  const deleteTicket = async (columnId, ticketId) => {
    try {
      await deleteDoc(doc(db, "kanban", ticketId));
      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          items: prevColumns[columnId].items.filter(
            (item) => item.id !== ticketId
          ),
        },
      }));
    } catch (error) {
      console.error("Erreur lors de la suppression du ticket :", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const [movedItem] = sourceColumn.items.splice(source.index, 1);

    destColumn.items.splice(destination.index, 0, movedItem);

    setColumns((prevColumns) => ({
      ...prevColumns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    }));

    try {
      await updateDoc(doc(db, "kanban", movedItem.id), {
        status: destination.droppableId,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du ticket :", error);
    }
  };

  return (
<div className="flex flex-col items-center justify-center bg-[#1e293b] min-h-screen text-white">
  <h2 className="text-3xl font-bold mb-6">Kanban Board</h2>

  {/* Tableau Kanban global */}
  <div className="bg-[#24334a] p-6 rounded-xl shadow-lg w-full max-w-7xl">
    {/* Formulaire d'ajout de ticket */}
    <div className="mb-8 flex items-center space-x-4 w-full">
      <input
        type="text"
        value={newTicket.title}
        onChange={(e) =>
          setNewTicket((prev) => ({ ...prev, title: e.target.value }))
        }
        placeholder="Titre"
        className="bg-gray-800 text-white border-none p-3 rounded w-1/4"
      />
      <input
        type="text"
        value={newTicket.description}
        onChange={(e) =>
          setNewTicket((prev) => ({ ...prev, description: e.target.value }))
        }
        placeholder="Description"
        className="bg-gray-800 text-white border-none p-3 rounded w-1/3"
      />
      <button
        onClick={addTicket}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded"
      >
        Ajouter
      </button>
    </div>

    {/* Colonnes Kanban */}
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-6">
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-900 p-4 rounded-lg w-1/3 shadow-lg"
              >
                <h3 className="font-bold text-xl mb-4 flex justify-between items-center">
                  {column.name} <span>({column.items.length})</span>
                </h3>
                {column.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-800 p-4 mb-4 shadow-md rounded hover:bg-gray-700 transition"
                      >
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-sm">{item.description}</p>
                        <p className="text-xs text-gray-400">
                          Ajouté : {item.date}
                        </p>
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => alert("Edit feature à implémenter")}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteTicket(columnId, item.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  </div>
</div>


  );
};

export default KanbanPage;
