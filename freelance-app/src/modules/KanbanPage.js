import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { db, auth } from "../App";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const KanbanPage = () => {
  const [columns, setColumns] = useState({
    todo: { name: "To Do", items: [] },
    inProgress: { name: "In Progress", items: [] },
    done: { name: "Done", items: [] },
  });
  const [newTicket, setNewTicket] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [userRole, setUserRole] = useState(null); // Ajout du rôle utilisateur

  // Charger les informations utilisateur et les tickets
  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("Utilisateur non connecté.");
          return;
        }

        // Récupérer les informations de l'utilisateur
        const userSnapshot = await getDocs(
          query(collection(db, "users"), where("email", "==", user.email))
        );

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUserRole(userData.role); // Définit le rôle de l'utilisateur
          setProjectId(userData.projectId);

          // Si l'utilisateur est un SuperAdmin, récupère tous les tickets
          const ticketQuery =
            userData.role === "superAdmin"
              ? collection(db, "kanban") // Pas de filtre pour le SuperAdmin
              : query(
                  collection(db, "kanban"),
                  where("projectId", "==", userData.projectId)
                );

          const ticketSnapshot = await getDocs(ticketQuery);

          const loadedColumns = {
            todo: { name: "To Do", items: [] },
            inProgress: { name: "In Progress", items: [] },
            done: { name: "Done", items: [] },
          };

          ticketSnapshot.forEach((doc) => {
            const data = doc.data();
            loadedColumns[data.status]?.items.push({
              id: doc.id,
              content: data.content,
            });
          });

          setColumns(loadedColumns);
        } else {
          console.error("Utilisateur introuvable dans la collection Firestore 'users'.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tickets :", error);
      }
    };

    fetchUserAndTickets();
  }, []);

  // Ajouter un ticket
  const addTicket = async () => {
    if (!newTicket.trim()) {
      alert("Le ticket ne peut pas être vide.");
      return;
    }

    if (!projectId && userRole !== "superAdmin") {
      alert("Impossible de créer un ticket sans projectId. Vérifiez vos informations.");
      return;
    }

    const newItem = {
      content: newTicket,
      status: "todo",
      projectId: userRole === "superAdmin" ? "global" : projectId, // Ajout du `projectId` global pour les tickets SuperAdmin
    };

    try {
      const docRef = await addDoc(collection(db, "kanban"), newItem);

      setColumns((prevColumns) => ({
        ...prevColumns,
        todo: {
          ...prevColumns.todo,
          items: [...prevColumns.todo.items, { id: docRef.id, content: newTicket }],
        },
      }));

      setNewTicket("");
    } catch (error) {
      console.error("Erreur lors de la création du ticket :", error);
    }
  };

  // Supprimer un ticket
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
      console.log("Ticket supprimé :", ticketId);
    } catch (error) {
      console.error("Erreur lors de la suppression du ticket :", error);
      alert("Une erreur est survenue lors de la suppression du ticket.");
    }
  };

  // Gérer le drag-and-drop
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
      console.log("Statut du ticket mis à jour :", movedItem.id);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du ticket :", error);
      alert("Une erreur est survenue lors de la mise à jour du ticket.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Kanban Board</h2>

      <div className="mb-4">
        <input
          type="text"
          value={newTicket}
          onChange={(e) => setNewTicket(e.target.value)}
          placeholder="Add a new ticket"
          className="border p-2 mr-2"
        />
        <button onClick={addTicket} className="bg-blue-500 text-white px-4 py-2">
          Add Ticket
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded w-1/3"
                >
                  <h3 className="font-bold text-lg mb-2">{column.name}</h3>
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 mb-2 shadow rounded flex justify-between items-center"
                        >
                          {item.content}
                          <button
                            onClick={() => deleteTicket(columnId, item.id)}
                            className="text-red-500"
                          >
                            ✕
                          </button>
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
  );
};

export default KanbanPage;
