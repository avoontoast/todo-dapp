import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TodoDapp } from '../target/types/todo_dapp';
import { assert } from 'chai';
import crypto from "crypto";

describe('todo_dapp', () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.TodoDapp as Program<TodoDapp>;

    const generateDescription = (base: string) => `${base}-${Date.now()}`;

    const descriptionSeed = (description: string): Buffer => {
        return crypto.createHash('sha256').update(description, 'utf-8').digest().slice(0, 16);
    };

    const createTask = async (description: string) => {
        const task = anchor.web3.Keypair.generate();
        const [taskDescriptionPda] = await PublicKey.findProgramAddress(
            [Buffer.from("task_description"), descriptionSeed(description)],
            program.programId
        );

        await program.methods.createTask(description)
            .accounts({
                task: task.publicKey,
                taskDescription: taskDescriptionPda,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([task])
            .rpc();

        return { task, taskDescriptionPda };
    };

    describe('Create', () => {
        it('Can create a task', async () => {
            const description = generateDescription("Start the project");
            const { task } = await createTask(description);

            const taskAccount = await program.account.task.fetch(task.publicKey);
            assert.equal(taskAccount.description, description);
            assert.equal(taskAccount.completed, false);
        });

        it('Cannot create the same task twice', async () => {
            const description = generateDescription("Unique task");
            await createTask(description);

            const newTask = anchor.web3.Keypair.generate();
            const [taskDescriptionPda] = await PublicKey.findProgramAddress(
                [Buffer.from("task_description"), descriptionSeed(description)],
                program.programId
            );

            try {
                await program.methods.createTask(description)
                    .accounts({
                        task: newTask.publicKey,
                        taskDescription: taskDescriptionPda,
                        user: provider.wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([newTask])
                    .rpc();
                assert.fail("Should have thrown an error because the task already exists.");
            } catch (err) {
                if (err.message.includes("custom program error: 0x0")) {
                    assert.ok("Correctly failed due to existing task.");
                } else {
                    console.error("Error in Cannot create the same task twice:", err);
                    assert.fail(`Unexpected error: ${err}`);
                }
            }
        });

        it('Cannot create a task with a description longer than 500 characters', async () => {
            const longDescription = 'a'.repeat(501); // 501 characters long

            try {
                await createTask(longDescription);
                assert.fail("Should have thrown an error because the description is too long.");
            } catch (err) {
                if (err.message.includes('DescriptionTooLong')) {
                    assert.ok("Correctly failed due to long description.");
                } else {
                    console.error("Error in Cannot create a task with a description longer than 500 characters:", err);
                    assert.fail(`Unexpected error: ${err}`);
                }
            }
        });

        it('Cannot create a task with a description shorter than 5 characters', async () => {
            const shortDescription = 'a'.repeat(4); // 4 characters long

            try {
                await createTask(shortDescription);
                assert.fail("Should have thrown an error because the description is too short.");
            } catch (err) {
                if (err.message.includes('DescriptionTooShort')) {
                    assert.ok("Correctly failed due to short description.");
                } else {
                    console.error("Error in Cannot create a task with a description shorter than 5 characters:", err);
                    assert.fail(`Unexpected error: ${err}`);
                }
            }
        });
    });

    describe('Complete', () => {
        it('Can complete a task', async () => {
            const description = generateDescription("Complete the project");
            const { task } = await createTask(description);

            await program.methods.completeTask(true)
                .accounts({
                    task: task.publicKey,
                    user: provider.wallet.publicKey,
                })
                .rpc();

            const taskAccount = await program.account.task.fetch(task.publicKey);
            assert.equal(taskAccount.completed, true);
        });

        it('Cannot complete a task that is already completed', async () => {
            const description = generateDescription("Complete an already completed task");
            const { task } = await createTask(description);

            await program.methods.completeTask(true)
                .accounts({
                    task: task.publicKey,
                    user: provider.wallet.publicKey,
                })
                .rpc();

            try {
                await program.methods.completeTask(true)
                    .accounts({
                        task: task.publicKey,
                        user: provider.wallet.publicKey,
                    })
                    .rpc();
                assert.fail("Should have thrown an error because the task is already completed.");
            } catch (err) {
                if (err.message.includes('TaskAlreadyCompleted')) {
                    assert.ok("Correctly failed due to already completed task.");
                } else {
                    console.error("Error in Cannot complete a task that is already completed:", err);
                    assert.fail(`Unexpected error: ${err}`);
                }
            }
        });
    });

    describe('Delete', () => {
        it('Can delete a task', async () => {
            const description = generateDescription("Delete the project");
            const { task } = await createTask(description);

            await program.methods.deleteTask()
                .accounts({
                    task: task.publicKey,
                    user: provider.wallet.publicKey,
                })
                .rpc();

            try {
                await program.account.task.fetch(task.publicKey);
                assert.fail("Should have thrown an error because the task is deleted.");
            } catch (err) {
                if (err.message.includes('Account does not exist')) {
                    assert.ok("Correctly failed to fetch deleted task.");
                } else {
                    console.error("Error in Can delete a task:", err);
                    assert.fail(`Unexpected error: ${err}`);
                }
            }
        });

        it('Cannot delete an already deleted task', async () => {
            const description = generateDescription("Delete an already deleted task");
            const { task } = await createTask(description);

            await program.methods.deleteTask()
                .accounts({
                    task: task.publicKey,
                    user: provider.wallet.publicKey,
                })
                .rpc();

            try {
                await program.methods.deleteTask()
                    .accounts({
                        task: task.publicKey,
                        user: provider.wallet.publicKey,
                    })
                    .rpc();
                assert.fail("Should have thrown an error because the task is already deleted.");
            } catch (err) {
                if (err.message.includes('AccountNotInitialized')) {
                    assert.ok("Correctly failed to delete an already deleted task.");
                } else {
                    console.error("Error in Cannot delete an already deleted task:", err);
                    assert.fail(`Unexpected error: ${err}`);
                }
            }
        });
    });
});
