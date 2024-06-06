import React from 'react';

const TaskList = ({ tasks, onComplete, onDelete }) => {
    return (
        <ul style={listStyle}>
            {tasks.map((task, index) => (
                <li key={index} style={listItemStyle}>
          <span style={{ ...descriptionStyle, textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.description}
          </span>
                    {!task.completed && (
                        <button onClick={() => onComplete(task.publicKey)} style={completeButtonStyle}>Complete</button>
                    )}
                    <button onClick={() => onDelete(task.publicKey)} style={deleteButtonStyle}>Delete</button>
                </li>
            ))}
        </ul>
    );
};

const listStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
};

const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '10px',
};

const descriptionStyle = {
    flexGrow: 1,
    fontSize: '16px',
    color: '#333',
};

const completeButtonStyle = {
    marginLeft: '10px',
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: '#28a745', // Bootstrap success color
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const deleteButtonStyle = {
    marginLeft: '10px',
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: '#dc3545', // Bootstrap danger color
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

export default TaskList;
