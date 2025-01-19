import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const KanbanPage = () => {
  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      items: [],
    },
    inProgress: {
      name: "In Progress",
      items: [],
    },
    done: {
      name: "Done",
      items: [],
    },
  });

  const [newTicket, setNewTicket] = useState("");

  // Fonction pour ajouter un ticket
  const addTicket = () => {
    if (newTicket.trim() !== "") {
      const newItem = { id: `${Date.now()}`, content: newTicket };
      setColumns({
        ...columns,
        todo: {
          ...columns.todo,
          items: [...columns.todo.items, newItem],
        },
      });
      setNewTicket(""); // Réinitialise l'entrée
    }
  };

  // Fonction pour supprimer un ticket
  const deleteTicket = (columnId, ticketId) => {
    setColumns({
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: columns[columnId].items.filter((item) => item.id !== ticketId),
      },
    });
  };

  // Gestion du drag-and-drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Si l'utilisateur a lâché l'élément hors d'une destination valide
    if (!destination) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const [movedItem] = sourceColumn.items.splice(source.index, 1);

    destColumn.items.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Kanban Board</h2>

      {/* Input pour ajouter un ticket */}
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

      {/* Gestion des colonnes */}
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
