import React, { useEffect, useState } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, utils, setProvider, web3 } from '@coral-xyz/anchor';
import idl from './todo_dapp.json';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import * as crypto from 'crypto';


const HomeView = () => {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const { connected, connect, select, wallets, wallet: selectedWallet } = useWallet();
    const [program, setProgram] = useState<Program | null>(null);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeProgram = async () => {
            if (wallet) {
                const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
                setProvider(provider);
                const program = new Program(idl as any, provider);
                setProgram(program);
                await fetchTasks(program);
            }
        };

        initializeProgram();
    }, [wallet, connection]);

    const fetchTasks = async (program: Program) => {
        try {
            const taskAccounts = await program.account.task.all();
            const walletPublicKey = wallet.publicKey.toBase58();

            // Filter tasks by the current wallet
            const filteredTasks = taskAccounts.filter((account) => {
                const userPublicKey = account.account.user.toBase58();
                return userPublicKey === walletPublicKey;
            });

            const tasks = filteredTasks.map((account) => ({
                ...account.account,
                publicKey: account.publicKey.toBase58(), // Convert publicKey to string
            }));

            console.log('Fetched raw task accounts:', taskAccounts); // Detailed logging
            taskAccounts.forEach((account, index) => {
                console.log(`Task ${index + 1}:`, account.publicKey.toBase58(), account.account);
            });

            setTasks(tasks);
            setError(null);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Error fetching tasks.');
        }
    };

    const createTask = async (description: string) => {
        if (!program || !wallet) return;

        const task = Keypair.generate();
        const [taskDescriptionPda] = await PublicKey.findProgramAddress(
            [Buffer.from('task_description'), descriptionSeed(description)],
            program.programId
        );

        try {
            console.log(`Creating task: ${description}`);
            await program.methods.createTask(description)
                .accounts({
                    task: task.publicKey,
                    taskDescription: taskDescriptionPda,
                    user: wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([task])
                .rpc();

            console.log(`Task created with public key: ${task.publicKey.toBase58()}`);
            await fetchTasks(program);
            setError(null);
        } catch (err) {
            console.error('Error creating task:', err);
            handleErrors(err);
        }
    };

    const completeTask = async (taskPubKey: PublicKey) => {
        if (!program || !wallet) return;

        try {
            await program.methods.completeTask(true)
                .accounts({
                    task: taskPubKey,
                    user: wallet.publicKey,
                })
                .rpc();

            await fetchTasks(program);
            setError(null);
        } catch (err) {
            console.error('Error completing task:', err);
            handleErrors(err);
        }
    };

    const deleteTask = async (taskPubKey: PublicKey) => {
        if (!program || !wallet) return;

        try {
            const taskAccount = await program.account.task.fetch(taskPubKey);
            console.log('Task account before deletion:', taskAccount);

            await program.methods.deleteTask()
                .accounts({
                    task: taskPubKey,
                    user: wallet.publicKey,
                })
                .rpc();

            await fetchTasks(program);
            setError(null);
        } catch (err) {
            console.error('Error deleting task:', err);
            handleErrors(err);
        }
    };

    const handleErrors = (err: any) => {
        if (err.message) {
            if (err.message.includes('DescriptionTooShort')) {
                setError('Error: The task description is too short.');
            } else if (err.message.includes('DescriptionTooLong')) {
                setError('Error: The task description is too long.');
            } else if (err.message.includes('TaskAlreadyExists')) {
                setError('Error: The task already exists.');
            } else if (err.message.includes('TaskAlreadyCompleted')) {
                setError('Error: The task is already marked as completed.');
            } else if (err.message.includes('TaskAlreadyDeleted')) {
                setError('Error: The task has already been deleted.');
            } else {
                setError('An unknown error occurred.');
            }
        } else {
            setError('An unknown error occurred.');
        }
    };

    const tasksToDo = tasks.filter((task) => !task.completed);
    const tasksCompleted = tasks.filter((task) => task.completed);

    const handleConnectWallet = async () => {
        if (!selectedWallet) {
            if (wallets.length > 0) {
                select(wallets[0].adapter.name);
            }
        } else {
            connect().catch(err => {
                console.error('Failed to connect wallet:', err);
                setError('Failed to connect wallet.');
            });
        }
    };

    return (
        <div>
            <h1>Solana Todo DApp</h1>
            {error && <div style={errorStyle}>{error}</div>}
            {connected ? (
                <>
                    <TaskForm onCreate={createTask} />
                    <h2>Tasks To Do</h2>
                    <TaskList tasks={tasksToDo} onComplete={completeTask} onDelete={deleteTask} />
                    <h2>Completed Tasks</h2>
                    <TaskList tasks={tasksCompleted} onComplete={completeTask} onDelete={deleteTask} />
                </>
            ) : (
                <button onClick={handleConnectWallet}>Connect to Phantom Wallet</button>
            )}
        </div>
    );
};

const descriptionSeed = (description: string) => {
    return crypto.createHash('sha256').update(description, 'utf-8').digest().slice(0, 16);
};

const errorStyle = {
    color: 'red',
    marginBottom: '10px',
};

export default HomeView;
