import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket", "polling"],
});

export default function TaskBoard({ workspaceId, token }) {
  const [lists, setLists] = useState([]);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchLists = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/taskboard/lists/${workspaceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setLists(res.data);
      } catch (err) {
        console.error("fetchLists", err);
      }
    };

    fetchLists();

    socket.emit("joinRoom", workspaceId);

    socket.on("taskUpdated", (payload) => {
      if (payload.workspaceId === workspaceId) {
        setLists(payload.updatedLists);
      }
    });

    return () => {
      socket.emit("leaveRoom", workspaceId);
      socket.off("taskUpdated");
    };
  }, [workspaceId, token]);

  const persistLists = async (updatedLists) => {
    try {
      savingRef.current = true;

      const res = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/taskboard/lists/workspace/${workspaceId}`,
        { updatedLists },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const persisted = res.data;

      socket.emit("taskUpdated", {
        workspaceId,
        updatedLists: persisted || updatedLists,
      });

      return persisted || updatedLists;
    } catch (err) {
      console.error("persistLists", err);
      return updatedLists;
    } finally {
      savingRef.current = false;
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const listsCopy = JSON.parse(JSON.stringify(lists));

    const sourceListIndex = listsCopy.findIndex(
      (l) => l._id === source.droppableId
    );
    const destListIndex = listsCopy.findIndex(
      (l) => l._id === destination.droppableId
    );

    if (sourceListIndex < 0 || destListIndex < 0) return;

    const [moved] = listsCopy[sourceListIndex].tasks.splice(source.index, 1);
    listsCopy[destListIndex].tasks.splice(destination.index, 0, moved);

    setLists(listsCopy);

    const updated = await persistLists(listsCopy);

    setLists(updated);
  };

  return (
    <div className="p-2">
      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4">
            {lists.map((list) => (
              <Droppable droppableId={String(list._id)} key={list._id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-3 rounded w-72 flex-shrink-0"
                  >
                    <div className="font-bold mb-2">{list.name}</div>
                    {list.tasks.map((task, index) => (
                      <Draggable
                        draggableId={String(task._id)}
                        index={index}
                        key={task._id}
                      >
                        {(providedDr) => (
                          <div
                            ref={providedDr.innerRef}
                            {...providedDr.draggableProps}
                            {...providedDr.dragHandleProps}
                            className="bg-white p-2 mb-2 rounded shadow"
                          >
                            <div className="text-sm font-medium">
                              {task.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {task.description}
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
}
