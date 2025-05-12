import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

// Icon declarations
const PlusIcon = getIcon("Plus");
const InfoIcon = getIcon("Info");
const CheckCircleIcon = getIcon("CheckCircle");

const Home = ({ darkMode }) => {
  const [boards, setBoards] = useState(() => {
    const savedBoards = localStorage.getItem('taskflowBoards');
    return savedBoards ? JSON.parse(savedBoards) : [
      { id: 'board-1', title: 'My First Board', createdAt: new Date().toISOString() }
    ];
  });
  
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('welcomeShown') !== 'true';
  });

  useEffect(() => {
    // If no board is selected, select the first one
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0].id);
    }
    
    // Save boards to localStorage
    localStorage.setItem('taskflowBoards', JSON.stringify(boards));
  }, [boards, selectedBoard]);

  const handleCreateBoard = (newBoardTitle) => {
    const newBoard = {
      id: `board-${Date.now()}`,
      title: newBoardTitle,
      createdAt: new Date().toISOString()
    };
    
    setBoards([...boards, newBoard]);
    setSelectedBoard(newBoard.id);
    toast.success(`Board "${newBoardTitle}" created!`);
  };

  const handleDeleteBoard = (boardId) => {
    const updatedBoards = boards.filter(board => board.id !== boardId);
    setBoards(updatedBoards);
    
    // If the deleted board was selected, select another one
    if (selectedBoard === boardId) {
      setSelectedBoard(updatedBoards.length > 0 ? updatedBoards[0].id : null);
    }
    
    toast.info("Board deleted");
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeShown', 'true');
  };

  const currentBoard = boards.find(board => board.id === selectedBoard);

  return (
    <div className="pb-20">
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-light to-primary dark:from-primary-dark dark:to-primary p-4 rounded-xl text-white mb-6 relative"
        >
          <div className="flex items-start gap-3">
            <InfoIcon className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome to TaskFlow!</h2>
              <p className="mb-2">Your visual task management solution. Here's how to get started:</p>
              <ul className="list-inside space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 inline flex-shrink-0" />
                  <span>Select or create a board from the sidebar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 inline flex-shrink-0" />
                  <span>Add columns for different stages (To Do, In Progress, Done)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 inline flex-shrink-0" />
                  <span>Create cards for your tasks and drag them between columns</span>
                </li>
              </ul>
              <button 
                onClick={dismissWelcome}
                className="px-4 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-sm font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-64 lg:w-72 shrink-0"
        >
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card border border-surface-200 dark:border-surface-700 p-4 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Your Boards</h2>
            
            <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => setSelectedBoard(board.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedBoard === board.id 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                  }`}
                >
                  <div className="font-medium truncate">{board.title}</div>
                  <div className="text-xs opacity-75">{new Date(board.createdAt).toLocaleDateString()}</div>
                </button>
              ))}
              
              {boards.length === 0 && (
                <div className="text-center text-surface-500 dark:text-surface-400 py-4">
                  No boards yet. Create your first board!
                </div>
              )}
            </div>
            
            {/* Create new board form */}
            <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
              <h3 className="text-sm font-semibold mb-2">Create New Board</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = e.target.boardTitle.value.trim();
                  if (title) {
                    handleCreateBoard(title);
                    e.target.reset();
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  name="boardTitle"
                  placeholder="Board name"
                  className="input-field text-sm py-1.5"
                  required
                />
                <button
                  type="submit"
                  className="p-1.5 bg-primary hover:bg-primary-dark rounded-lg text-white transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-grow"
        >
          {selectedBoard ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{currentBoard?.title}</h1>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${currentBoard.title}"?`)) {
                      handleDeleteBoard(currentBoard.id);
                    }
                  }}
                  className="btn btn-outline text-sm"
                >
                  Delete Board
                </button>
              </div>
              
              <MainFeature boardId={selectedBoard} darkMode={darkMode} />
            </>
          ) : (
            <div className="bg-white dark:bg-surface-800 rounded-xl p-8 text-center shadow-card border border-surface-200 dark:border-surface-700">
              <img 
                src="https://source.unsplash.com/RLw-UC03Gwc/400x300" 
                alt="Create a board" 
                className="w-full max-w-md mx-auto rounded-lg object-cover h-60 mb-6"
              />
              <h2 className="text-2xl font-bold mb-2">No Board Selected</h2>
              <p className="text-surface-600 dark:text-surface-300 mb-6">
                Please select a board from the sidebar or create a new one to get started.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;