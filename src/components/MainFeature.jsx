import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

// Icon declarations
const PlusIcon = getIcon("Plus");
const XIcon = getIcon("X");
const EditIcon = getIcon("Edit2");
const TrashIcon = getIcon("Trash2");
const GripVerticalIcon = getIcon("GripVertical");
const ClockIcon = getIcon("Clock");
const TagIcon = getIcon("Tag");
const AlertCircleIcon = getIcon("AlertCircle");

const MainFeature = ({ boardId, darkMode }) => {
  // State for columns and cards
  const [columns, setColumns] = useState(() => {
    const savedData = localStorage.getItem(`board-${boardId}`);
    return savedData ? JSON.parse(savedData) : [
      { id: 'col-1', title: 'To Do', cards: [] },
      { id: 'col-2', title: 'In Progress', cards: [] },
      { id: 'col-3', title: 'Done', cards: [] }
    ];
  });
  
  // State for new column form
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  // State for active card/drag
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  // State for card details
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem(`board-${boardId}`, JSON.stringify(columns));
  }, [columns, boardId]);

  // Reset states when board changes
  useEffect(() => {
    const savedData = localStorage.getItem(`board-${boardId}`);
    if (savedData) {
      setColumns(JSON.parse(savedData));
    } else {
      setColumns([
        { id: 'col-1', title: 'To Do', cards: [] },
        { id: 'col-2', title: 'In Progress', cards: [] },
        { id: 'col-3', title: 'Done', cards: [] }
      ]);
    }
    setActiveColumn(null);
    setActiveCard(null);
    setEditingCard(null);
  }, [boardId]);

  // Handle adding a new column
  const handleAddColumn = () => {
    if (newColumnTitle.trim() === '') return;
    
    const newColumn = {
      id: `col-${Date.now()}`,
      title: newColumnTitle,
      cards: []
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setShowColumnForm(false);
    toast.success('Column added');
  };

  // Handle deleting a column
  const handleDeleteColumn = (columnId) => {
    if (confirm('Are you sure you want to delete this column? All cards will be lost.')) {
      setColumns(columns.filter(col => col.id !== columnId));
      toast.info('Column deleted');
    }
  };

  // Handle adding a new card
  const handleAddCard = (columnId) => {
    setActiveColumn(columnId);
    setCardFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
    setEditingCard(null);
  };

  // Handle editing a card
  const handleEditCard = (columnId, card) => {
    setActiveColumn(columnId);
    setEditingCard(card.id);
    setCardFormData({
      title: card.title,
      description: card.description || '',
      priority: card.priority || 'medium',
      dueDate: card.dueDate || ''
    });
  };

  // Handle saving card data
  const handleSaveCard = () => {
    if (cardFormData.title.trim() === '') return;
    
    const newCard = {
      id: editingCard || `card-${Date.now()}`,
      title: cardFormData.title,
      description: cardFormData.description,
      priority: cardFormData.priority,
      dueDate: cardFormData.dueDate,
      createdAt: editingCard ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setColumns(columns.map(column => {
      if (column.id === activeColumn) {
        if (editingCard) {
          // Update existing card
          return {
            ...column,
            cards: column.cards.map(card => card.id === editingCard ? newCard : card)
          };
        } else {
          // Add new card
          return {
            ...column,
            cards: [...column.cards, newCard]
          };
        }
      }
      return column;
    }));
    
    setActiveColumn(null);
    setEditingCard(null);
    toast.success(editingCard ? 'Card updated' : 'Card added');
  };

  // Handle deleting a card
  const handleDeleteCard = (columnId, cardId) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: column.cards.filter(card => card.id !== cardId)
        };
      }
      return column;
    }));
    
    toast.info('Card deleted');
  };

  // Handle card form input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardFormData({
      ...cardFormData,
      [name]: value
    });
  };

  // Drag start handler
  const handleDragStart = (e, columnId, card) => {
    setDraggedCard({ columnId, card });
    // Add a dragging class to e.target
    e.currentTarget.classList.add('opacity-50');
  };

  // Drag end handler
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
    
    // If we have a valid drop target
    if (draggedCard && dragOverColumn) {
      // Move the card to the new column
      const updatedColumns = columns.map(column => {
        // Remove from source column
        if (column.id === draggedCard.columnId) {
          return {
            ...column,
            cards: column.cards.filter(c => c.id !== draggedCard.card.id)
          };
        }
        
        // Add to target column
        if (column.id === dragOverColumn) {
          return {
            ...column,
            cards: [...column.cards, draggedCard.card]
          };
        }
        
        return column;
      });
      
      setColumns(updatedColumns);
      toast.success('Card moved');
    }
    
    // Reset drag state
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  // Drag over handler
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300';
    }
  };

  return (
    <div>
      {/* Kanban Board */}
      <div className="flex flex-col">
        <div className="flex items-start gap-4 overflow-x-auto scrollbar-thin pb-4">
          {/* Columns */}
          {columns.map(column => (
            <div 
              key={column.id}
              className={`kanban-column ${
                dragOverColumn === column.id 
                  ? 'ring-2 ring-primary ring-opacity-70' 
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
            >
              <div className="kanban-column-header">
                <span>{column.title}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded-full">
                    {column.cards.length}
                  </span>
                  <button
                    onClick={() => handleAddCard(column.id)}
                    className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    title="Add card"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    title="Delete column"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Cards */}
              <div className="kanban-column-content">
                <AnimatePresence>
                  {column.cards.map(card => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="kanban-card group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, column.id, card)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-surface-800 dark:text-white">{card.title}</h3>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditCard(column.id, card)}
                            className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-600"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCard(column.id, card.id)}
                            className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-600"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {card.description && (
                        <p className="text-sm text-surface-600 dark:text-surface-300 mt-1 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3 text-xs">
                        {card.priority && (
                          <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${getPriorityClass(card.priority)}`}>
                            <AlertCircleIcon className="w-3 h-3" />
                            {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                          </span>
                        )}
                        
                        {card.dueDate && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {new Date(card.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-50">
                        <GripVerticalIcon className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {column.cards.length === 0 && (
                  <div className="text-center py-4 text-sm text-surface-500 dark:text-surface-400">
                    No cards yet
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add Column Button/Form */}
          <div className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px]">
            {showColumnForm ? (
              <div className="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card border border-surface-200 dark:border-surface-700">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column name"
                  className="input-field mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="btn btn-primary py-1.5 text-sm flex-grow"
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setShowColumnForm(false);
                      setNewColumnTitle('');
                    }}
                    className="btn btn-outline py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowColumnForm(true)}
                className="w-full h-12 bg-white dark:bg-surface-800 bg-opacity-50 dark:bg-opacity-50 hover:bg-opacity-100 dark:hover:bg-opacity-100 border border-dashed border-surface-300 dark:border-surface-600 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-300 transition-all hover:shadow-sm"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Column
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Form Modal */}
      <AnimatePresence>
        {activeColumn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingCard ? 'Edit Card' : 'Add New Card'}
                </h2>
                <button
                  onClick={() => {
                    setActiveColumn(null);
                    setEditingCard(null);
                  }}
                  className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCard();
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={cardFormData.title}
                    onChange={handleCardInputChange}
                    placeholder="Card title"
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={cardFormData.description}
                    onChange={handleCardInputChange}
                    placeholder="Card description"
                    className="input-field min-h-[100px]"
                    rows={4}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map((priority) => (
                      <label 
                        key={priority}
                        className={`flex-1 cursor-pointer border rounded-lg p-2 text-center text-sm transition-all ${
                          cardFormData.priority === priority
                            ? `${getPriorityClass(priority)} border-${priority === 'low' ? 'green' : priority === 'medium' ? 'yellow' : 'red'}-400`
                            : 'border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={cardFormData.priority === priority}
                          onChange={handleCardInputChange}
                          className="sr-only"
                        />
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={cardFormData.dueDate}
                    onChange={handleCardInputChange}
                    className="input-field"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editingCard ? 'Update Card' : 'Add Card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveColumn(null);
                      setEditingCard(null);
                    }}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;