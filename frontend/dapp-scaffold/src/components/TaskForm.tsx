import React, { useState } from 'react';

const TaskForm = ({ onCreate }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (description) {
            onCreate(description);
            setDescription('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                required
                style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Add Task</button>
        </form>
    );
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8f9fa', // Light background color
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    width: '300px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#ffffff', // White background color
    color: '#000000', // Black text color
};

const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff', // Bootstrap primary color
    color: '#ffffff', // White text color
    border: 'none',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

export default TaskForm;
