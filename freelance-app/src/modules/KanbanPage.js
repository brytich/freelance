import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { db, auth } from "../App";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../css/kanbanStyle/kanban.css";

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
    assignedUserEmail: "",
  });

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            setUserRole(userSnapshot.data().role);
          } else {
            console.error("❌ Utilisateur introuvable dans Firestore.");
            setUserRole("client");
          }
        } catch (error) {
          console.error("❌ Erreur lors de la récupération du rôle utilisateur:", error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || userRole === null) return;
    fetchTickets();
    if (userRole === "superAdmin")     
    console.log("🔍 Chargement des clients...");
    fetchClients();
  }, [user, userRole]);

  const fetchClients = async () => {
    try {
      const clientsQuery = query(collection(db, "users"), where("role", "==", "client")); // Récupérer uniquement les clients
      const clientsSnapshot = await getDocs(clientsQuery);
  
      if (clientsSnapshot.empty) {
        console.warn("⚠ Aucun client trouvé.");
        setClients([]); // Évite une erreur si la liste est vide
        return;
      }
  
      const clientList = clientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,  // On récupère bien l'email
      }));
  
      setClients(clientList);
      console.log("✅ Clients chargés :", clientList);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
  };
  
  

  const fetchTickets = async () => {
    try {
      const ticketQuery =
        userRole === "superAdmin"
          ? query(collection(db, "kanban"))
          : query(collection(db, "kanban"), where("assignedUserEmail", "==", user.email));

      const ticketSnapshot = await getDocs(ticketQuery);
      const loadedColumns = {
        todo: { name: "À faire", items: [] },
        inProgress: { name: "En cours", items: [] },
        done: { name: "Terminé", items: [] },
      };

      ticketSnapshot.forEach((doc) => {
        const data = doc.data();
        if (loadedColumns[data.status]) {
          loadedColumns[data.status].items.push({ id: doc.id, ...data });
        }
      });

      setColumns(loadedColumns);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
    }
  };

  const addTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim() || (!newTicket.assignedUserEmail && userRole === "superAdmin")) {
      alert("Veuillez remplir tous les champs du ticket.");
      return;
    }
  
    const assignedEmail = userRole === "superAdmin" ? newTicket.assignedUserEmail : user.email;
  
    const newItem = {
      ...newTicket,
      assignedUserEmail: assignedEmail,
      status: "todo",
    };
  
    try {
      const docRef = await addDoc(collection(db, "kanban"), newItem);
      const addedTicket = { id: docRef.id, ...newItem };
  
      setColumns((prev) => ({
        ...prev,
        todo: { ...prev.todo, items: [...prev.todo.items, addedTicket] },
      }));
  
      setNewTicket({ title: "", description: "", date: new Date().toLocaleDateString(), assignedUserEmail: "" });
    } catch (error) {
      console.error("Erreur lors de la création du ticket:", error);
    }
  };
  

  const deleteTicket = async (columnId, ticketId) => {
    try {
      await deleteDoc(doc(db, "kanban", ticketId));
      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          items: prev[columnId].items.filter((item) => item.id !== ticketId),
        },
      }));
    } catch (error) {
      console.error("Erreur lors de la suppression du ticket:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
  
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
  
    if (!sourceColumn || !destColumn) {
      console.error("Erreur: colonne introuvable");
      return;
    }
  
    const [movedItem] = sourceColumn.items.splice(source.index, 1);
    if (!movedItem) {
      console.error("Erreur: élément introuvable");
      return;
    }
  
    destColumn.items.splice(destination.index, 0, movedItem);
  
    setColumns((prevColumns) => ({
      ...prevColumns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    }));
  
    // ✅ Mise à jour du statut du ticket dans Firestore
    try {
      await updateDoc(doc(db, "kanban", movedItem.id), {
        status: destination.droppableId,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du ticket:", error);
    }
  };
  

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  return (
    <div className="kanban-container">
      <h2 className="kanban-title">Tableau de bord</h2>

      <div className="kanban-board">
        {/* ✅ Formulaire d'ajout de tickets */}
        <div className="kanban-form">
          <input
            type="text"
            value={newTicket.title}
            onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Titre"
            className="kanban-input"
          />
          <input
            type="text"
            value={newTicket.description}
            onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="kanban-input"
          />

{userRole === "superAdmin" && (
  <select
    value={newTicket.assignedUserEmail}
    onChange={(e) => setNewTicket((prev) => ({ ...prev, assignedUserEmail: e.target.value }))}
    className="kanban-select"
  >
    <option value="">Sélectionner un client</option>
    {clients.length > 0 ? (
      clients.map((client) => (
        <option key={client.id} value={client.email}>
          {client.email}
        </option>
      ))
    ) : (
      <option disabled>⚠ Aucun client disponible</option>
    )}
  </select>
)}


          <button onClick={addTicket} className="kanban-add-btn">
            Ajouter
          </button>
        </div>

        {/* 🏷️ Colonnes Kanban avec Drag & Drop */}
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
