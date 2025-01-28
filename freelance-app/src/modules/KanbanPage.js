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
import '../css/kanbanStyle/kanban.css'

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
<div className="kanban-container">
  <h2 className="kanban-title">Tableau de bord</h2>

  {/* Tableau Kanban global */}
  <div className="kanban-board">
    {/* Formulaire d'ajout de ticket */}
    <div className="kanban-form">
      <input
        type="text"
        value={newTicket.title}
        onChange={(e) =>
          setNewTicket((prev) => ({ ...prev, title: e.target.value }))
        }
        placeholder="Titre"
        className="kanban-input"
      />
      <input
        type="text"
        value={newTicket.description}
        onChange={(e) =>
          setNewTicket((prev) => ({ ...prev, description: e.target.value }))
        }
        placeholder="Description"
        className="kanban-input"
      />
      <button onClick={addTicket} className="kanban-add-btn">
        Ajouter
      </button>
    </div>

    {/* Colonnes Kanban */}
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-columns">
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="kanban-column"
              >
                <h3 className="kanban-column-title">
                  {column.name} <span>({column.items.length})</span>
                </h3>

                {column.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="kanban-ticket"
                      >
                        <h4 className="kanban-ticket-title">{item.title}</h4>
                        <p className="kanban-ticket-description">{item.description}</p>
                        <p className="kanban-ticket-date">
                          Ajouté : {item.date}
                        </p>
                        <div className="kanban-buttons">
                          <button
                            onClick={() => alert("Edit feature à implémenter")}
                            className="kanban-edit-btn"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteTicket(columnId, item.id)}
                            className="kanban-delete-btn"
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
